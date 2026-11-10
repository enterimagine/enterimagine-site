// Azure Communication Services Email: minimal REST client (HMAC-SHA256 signed), no third-party dependencies.
// Configured from the EMAIL_CONNECTION connection string ("endpoint=https://...;accesskey=...").
import { createHash, createHmac } from 'node:crypto';

const API_VERSION = '2023-03-31';
export const SENDER = 'DoNotReply@enterimagine.com';
// Replies from members reach IMAGINE (forwarded by Easyhost to the IMAGINE Gmail inbox).
export const REPLY_TO = 'EnterImagine.media@enterimagine.com';

export function parseEmailConnection(cs) {
  const parts = Object.fromEntries(String(cs || '').split(';').filter(Boolean).map(kv => {
    const i = kv.indexOf('='); return [kv.slice(0, i).trim().toLowerCase(), kv.slice(i + 1).trim()];
  }));
  if (!parts.endpoint || !parts.accesskey) return null;
  const url = new URL(parts.endpoint);
  return { host: url.host, origin: url.origin, key: Buffer.from(parts.accesskey, 'base64') };
}

export function createMailer(connectionString, { fetchImpl = fetch, sender = SENDER, replyTo = REPLY_TO } = {}) {
  const cfg = parseEmailConnection(connectionString);
  if (!cfg) return null;
  return async function send({ to, subject, text, html }) {
    const path = `/emails:send?api-version=${API_VERSION}`;
    const body = JSON.stringify({
      senderAddress: sender,
      recipients: { to: [{ address: to }] },
      ...(replyTo ? { replyTo: [{ address: replyTo }] } : {}),
      content: { subject, plainText: text, html },
      userEngagementTrackingDisabled: true
    });
    const date = new Date().toUTCString();
    const contentHash = createHash('sha256').update(body, 'utf8').digest('base64');
    const toSign = `POST\n${path}\n${date};${cfg.host};${contentHash}`;
    const signature = createHmac('sha256', cfg.key).update(toSign, 'utf8').digest('base64');
    const res = await fetchImpl(cfg.origin + path, {
      method: 'POST', signal: AbortSignal.timeout(15000), body,
      headers: { 'Content-Type': 'application/json', 'x-ms-date': date, 'x-ms-content-sha256': contentHash,
        Authorization: `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${signature}` }
    });
    if (res.status !== 202) throw new Error('Email send failed: HTTP ' + res.status + ' ' + (await res.text().catch(() => '')).slice(0, 300));
  };
}

// --- Email texts (plain and simple HTML; no tracking pixels, no remote images) -----------------
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const frame = (title, paragraphs, button) => {
  const text = [title, '', ...paragraphs, '', button ? `${button.label}: ${button.url}` : '', '', '— IMAGINE · Powering Up Our Future · enterimagine.com'].join('\n');
  const html = `<!doctype html><html><body style="margin:0;background:#07121b;font-family:Arial,Helvetica,sans-serif;color:#e6f1f5">` +
    `<div style="max-width:520px;margin:0 auto;padding:32px 24px"><p style="letter-spacing:.2em;font-weight:700;color:#7fe7f2;margin:0 0 24px">IMAGINE</p>` +
    `<h1 style="font-size:22px;font-weight:600;margin:0 0 16px">${esc(title)}</h1>` +
    paragraphs.map(p => `<p style="font-size:15px;line-height:1.6;margin:0 0 14px;color:#c6d6dd">${esc(p)}</p>`).join('') +
    (button ? `<p style="margin:24px 0"><a href="${esc(button.url)}" style="display:inline-block;background:#7fe7f2;color:#07121b;padding:12px 20px;text-decoration:none;font-weight:700">${esc(button.label)}</a></p><p style="font-size:12px;color:#86a0ab;word-break:break-all">${esc(button.url)}</p>` : '') +
    `<p style="font-size:12px;color:#86a0ab;margin-top:32px">IMAGINE · Powering Up Our Future · enterimagine.com</p></div></body></html>`;
  return { text, html };
};

export const emails = {
  verify: (name, url) => ({ subject: 'Confirm your email for IMAGINE Collective Minds',
    ...frame(`Welcome to the Collective, ${name}`, ['Please confirm your email address. We use it only to let you sign in if you lose your device and, if you wish, to tell you when a founding mind replies to your idea.', 'The link works once and expires in 24 hours. If you did not join, you can ignore this email. Questions? Just reply to this email.'], { label: 'Confirm my email', url }) }),
  signIn: url => ({ subject: 'Your IMAGINE sign-in link',
    ...frame('Sign in to Collective Minds', ['Use this link to sign in to your Collective Minds card, for example on a new device. You can then add a passkey there.', 'The link works once and expires in 30 minutes. If you did not ask for it, you can ignore this email.'], { label: 'Sign in', url }) }),
  reply: (founderName, ideaText, url, unsubscribeUrl) => ({ subject: `${founderName} replied to your idea`,
    ...frame(`${founderName} replied to your idea`, [`Your idea: “${ideaText}”`, 'Read the reply on your Collective Minds card.', `To stop these emails: ${unsubscribeUrl}`], { label: 'Read the reply', url }) })
};
