// Display-only mirror of backend/src/users/pending-account-policy.ts's
// day-math — the backend is the sole source of truth for when an account
// actually gets deleted (UserCleanupService); this just renders an estimate
// on the /users admin page so it's not a surprise when a pending row
// disappears. Keep PENDING_ACCOUNT_TTL_DAYS in sync with the backend by hand.
export const PENDING_ACCOUNT_TTL_DAYS = 10;

export function daysRemainingUntilAutoDeletion(createdAt: string, now: Date = new Date()): number {
  const elapsedDays = (now.getTime() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000);
  return Math.max(0, Math.ceil(PENDING_ACCOUNT_TTL_DAYS - elapsedDays));
}
