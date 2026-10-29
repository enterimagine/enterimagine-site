// HTTP routes for the Collective Minds idea wall (Azure Functions v4 programming model).
// Access for /api/moderation/* is enforced twice: by staticwebapp.config.json route rules
// (role "moderator") and again inside the handlers.
import { app } from '@azure/functions';
import { createHash } from 'node:crypto';
import { createTableClient } from '../lib/table.js';
import { createHandlers } from '../lib/ideas.js';

let handlers;
function get() {
  if (!handlers) {
    const cs = process.env.IDEAS_STORAGE;
    const secret = createHash('sha256').update('imagine-ratelimit|' + (cs || '')).digest('hex');
    handlers = createHandlers(createTableClient(cs), { secret });
  }
  return handlers;
}
const safe = fn => async (request, context) => {
  try { return await fn(get(), request); }
  catch (error) {
    context.error(error.message);
    return { status: 503, jsonBody: { error: 'The idea wall is temporarily unavailable. Please try again later.' }, headers: { 'Cache-Control': 'no-store' } };
  }
};

app.http('ideas', { route: 'ideas', methods: ['GET', 'POST'], authLevel: 'anonymous',
  handler: safe((h, req) => req.method === 'POST' ? h.submit(req) : h.listPublic(req)) });
app.http('ideas-withdraw', { route: 'ideas/withdraw', methods: ['POST'], authLevel: 'anonymous', handler: safe((h, req) => h.withdraw(req)) });
app.http('moderation-ideas', { route: 'moderation/ideas', methods: ['GET'], authLevel: 'anonymous', handler: safe((h, req) => h.listForModeration(req)) });
app.http('moderation-decision', { route: 'moderation/decision', methods: ['POST'], authLevel: 'anonymous', handler: safe((h, req) => h.decide(req)) });
