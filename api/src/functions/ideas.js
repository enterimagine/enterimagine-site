// HTTP routes for Collective Minds: the idea wall, member cards (passkeys) and moderation
// (Azure Functions v4 programming model). Access for /api/moderation/* is enforced twice:
// by staticwebapp.config.json route rules (role "moderator") and again inside the handlers.
import { app } from '@azure/functions';
import { createHash } from 'node:crypto';
import { createTableClient, withTablePrefix } from '../lib/table.js';
import { createHandlers, LIMITS } from '../lib/ideas.js';
import { createMemberHandlers } from '../lib/members.js';
import { createDrafter, createNotifier, createProfileChecker } from '../lib/agent.js';
import { createMailer } from '../lib/mailer.js';

let handlers;
function get() {
  if (!handlers) {
    const cs = process.env.IDEAS_STORAGE;
    const derive = label => createHash('sha256').update(label + '|' + (cs || '')).digest('hex');
    const store = withTablePrefix(createTableClient(cs), process.env.TABLE_PREFIX || '');
    // Agent drafts for ideas and checks of member cards share one daily cap.
    const draftCap = async () => {
      const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const used = Number((await store.get('ratelimit', day, 'agent-drafts'))?.count || 0);
      if (used >= LIMITS.draftsPerDay) return false;
      await store.upsert('ratelimit', { PartitionKey: day, RowKey: 'agent-drafts', count: used + 1 });
      return true;
    };
    const members = createMemberHandlers(store, { secret: derive('imagine-session'), checker: createProfileChecker(process.env.ANTHROPIC_API_KEY), draftCap,
      mailer: createMailer(process.env.EMAIL_CONNECTION) });
    const ideas = createHandlers(store, { secret: derive('imagine-ratelimit'), memberOf: members.currentMember, onReply: members.notifyReply,
      drafter: createDrafter(process.env.ANTHROPIC_API_KEY), notifier: createNotifier(process.env.IDEA_ALERTS_TOPIC) });
    handlers = { ideas, members };
  }
  return handlers;
}
const safe = fn => async (request, context) => {
  try { return await fn(get(), request); }
  catch (error) {
    context.error(error.message);
    return { status: 503, jsonBody: { error: 'Collective Minds is temporarily unavailable. Please try again later.' }, headers: { 'Cache-Control': 'no-store' } };
  }
};
const route = (name, path, methods, fn) => app.http(name, { route: path, methods, authLevel: 'anonymous', handler: safe(fn) });

route('ideas', 'ideas', ['GET', 'POST'], (h, req) => req.method === 'POST' ? h.ideas.submit(req) : h.ideas.listPublic(req));
route('ideas-withdraw', 'ideas/withdraw', ['POST'], (h, req) => h.ideas.withdraw(req));
route('moderation-ideas', 'moderation/ideas', ['GET'], (h, req) => h.ideas.listForModeration(req));
route('moderation-decision', 'moderation/decision', ['POST'], (h, req) => h.ideas.decide(req));
route('moderation-draft', 'moderation/draft', ['POST'], (h, req) => h.ideas.draft(req));

route('members', 'members', ['GET'], (h, req) => h.members.listPublic(req));
route('members-me', 'members/me', ['GET'], (h, req) => h.members.me(req));
route('members-join-options', 'members/join/options', ['POST'], (h, req) => h.members.joinOptions(req));
route('members-join-verify', 'members/join/verify', ['POST'], (h, req) => h.members.joinVerify(req));
route('members-login-options', 'members/login/options', ['POST'], (h, req) => h.members.loginOptions(req));
route('members-login-verify', 'members/login/verify', ['POST'], (h, req) => h.members.loginVerify(req));
route('members-email-verify', 'members/email/verify', ['POST'], (h, req) => h.members.verifyEmail(req));
route('members-email-resend', 'members/email/resend', ['POST'], (h, req) => h.members.resendVerification(req));
route('members-email-change', 'members/email/change', ['POST'], (h, req) => h.members.changeEmail(req));
route('members-email-signin-request', 'members/email/signin-request', ['POST'], (h, req) => h.members.requestSignIn(req));
route('members-email-signin', 'members/email/signin', ['POST'], (h, req) => h.members.signInWithLink(req));
route('members-email-unsubscribe', 'members/email/unsubscribe', ['POST'], (h, req) => h.members.unsubscribe(req));
route('members-notifications', 'members/notifications', ['POST'], (h, req) => h.members.setNotifications(req));
route('members-passkey-options', 'members/passkey/options', ['POST'], (h, req) => h.members.passkeyOptions(req));
route('members-passkey-verify', 'members/passkey/verify', ['POST'], (h, req) => h.members.passkeyVerify(req));
route('members-profile', 'members/profile', ['POST'], (h, req) => h.members.updateProfile(req));
route('members-seen', 'members/seen', ['POST'], (h, req) => h.members.seen(req));
route('members-remove-idea', 'members/ideas/remove', ['POST'], (h, req) => h.members.removeIdea(req));
route('members-spark', 'members/spark', ['POST'], (h, req) => h.members.spark(req));
route('members-logout', 'members/logout', ['POST'], (h, req) => h.members.logout(req));
route('members-delete', 'members/delete', ['POST'], (h, req) => h.members.deleteAccount(req));
route('moderation-members', 'moderation/members', ['GET'], (h, req) => h.members.listForModeration(req));
route('moderation-member-check', 'moderation/member-check', ['POST'], (h, req) => h.members.check(req));
route('moderation-member-decision', 'moderation/member-decision', ['POST'], (h, req) => h.members.decide(req));
route('moderation-member-export', 'moderation/member-export', ['POST'], (h, req) => h.members.exportMember(req));
