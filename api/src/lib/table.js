// Minimal Azure Table Storage client (REST + SharedKeyLite), no third-party dependencies.
// Configured from the IDEAS_STORAGE connection string (Static Web App environment variable).
import { createHmac } from 'node:crypto';

const VERSION = '2019-02-02';

export function parseConnectionString(cs) {
  const parts = Object.fromEntries(String(cs || '').split(';').filter(Boolean).map(kv => {
    const i = kv.indexOf('='); return [kv.slice(0, i), kv.slice(i + 1)];
  }));
  if (!parts.AccountName || !parts.AccountKey) throw new Error('Storage is not configured.');
  const suffix = parts.EndpointSuffix || 'core.windows.net';
  return { account: parts.AccountName, key: Buffer.from(parts.AccountKey, 'base64'), endpoint: parts.TableEndpoint || `https://${parts.AccountName}.table.${suffix}` };
}

const quote = v => "'" + String(v).replace(/'/g, "''") + "'";

export function createTableClient(connectionString, fetchImpl = fetch) {
  const cfg = parseConnectionString(connectionString);
  const ready = new Set();

  async function call(method, resource, { query = '', body, headers = {} } = {}) {
    const date = new Date().toUTCString();
    const url = `${cfg.endpoint}/${resource}${query}`;
    // SharedKeyLite signs "/<account><request path>" exactly as sent (covers Azure and the emulator's path-style URLs).
    const canonical = `/${cfg.account}${new URL(url).pathname}`;
    const signature = createHmac('sha256', cfg.key).update(`${date}\n${canonical}`, 'utf8').digest('base64');
    const res = await fetchImpl(url, {
      method,
      headers: {
        'x-ms-date': date, 'x-ms-version': VERSION, Authorization: `SharedKeyLite ${cfg.account}:${signature}`,
        Accept: 'application/json;odata=nometadata', DataServiceVersion: '3.0;NetFx', MaxDataServiceVersion: '3.0;NetFx',
        ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    return res;
  }
  const fail = async (res, what) => { throw new Error(`${what} failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`); };

  async function ensure(table) {
    if (ready.has(table)) return;
    const res = await call('POST', 'Tables', { body: { TableName: table }, headers: { Prefer: 'return-no-content' } });
    if (!res.ok && res.status !== 409) await fail(res, 'Create table');
    ready.add(table);
  }
  const entityPath = (table, pk, rk) => `${table}(PartitionKey=${encodeURIComponent(quote(pk))},RowKey=${encodeURIComponent(quote(rk))})`;

  return {
    async insert(table, entity) {
      await ensure(table);
      const res = await call('POST', table, { body: entity, headers: { Prefer: 'return-no-content' } });
      if (!res.ok) await fail(res, 'Insert');
    },
    async upsert(table, entity) {
      await ensure(table);
      const res = await call('PUT', entityPath(table, entity.PartitionKey, entity.RowKey), { body: entity });
      if (!res.ok) await fail(res, 'Upsert');
    },
    async get(table, pk, rk) {
      await ensure(table);
      const res = await call('GET', entityPath(table, pk, rk));
      if (res.status === 404) return null;
      if (!res.ok) await fail(res, 'Get');
      return res.json();
    },
    async remove(table, pk, rk) {
      await ensure(table);
      const res = await call('DELETE', entityPath(table, pk, rk), { headers: { 'If-Match': '*' } });
      if (!res.ok && res.status !== 404) await fail(res, 'Delete');
    },
    async query(table, filter, limit = 500) {
      await ensure(table);
      const out = [];
      let next = '';
      do {
        const res = await call('GET', `${table}()`, { query: `?$filter=${encodeURIComponent(filter)}&$top=${Math.min(limit, 1000)}${next}` });
        if (!res.ok) await fail(res, 'Query');
        out.push(...(await res.json()).value);
        const npk = res.headers.get('x-ms-continuation-NextPartitionKey'), nrk = res.headers.get('x-ms-continuation-NextRowKey');
        next = npk ? `&NextPartitionKey=${encodeURIComponent(npk)}${nrk ? '&NextRowKey=' + encodeURIComponent(nrk) : ''}` : '';
      } while (next && out.length < limit);
      return out.slice(0, limit);
    }
  };
}

export { quote as odataString };
