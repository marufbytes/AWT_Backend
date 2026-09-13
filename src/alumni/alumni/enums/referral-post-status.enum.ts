// Lifecycle of a referral post created by an alumni. Every post starts as
// PENDING and waits for an admin to review it before students can see it.
export enum ReferralPostStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
