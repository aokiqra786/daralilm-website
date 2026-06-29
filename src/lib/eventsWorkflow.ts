// Shared constants + helpers for the event approval/budget workflow.
// Server-safe (no client-only imports) so it can be used in actions and pages.

export type EventStatus =
  | "draft"
  | "pending_board"
  | "changes_requested"
  | "pending_treasurer"
  | "on_hold"
  | "approved"
  | "published"
  | "declined"
  | "cancelled"
  | "completed";

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  pending_board: "Pending Board",
  changes_requested: "Changes Requested",
  pending_treasurer: "Pending Treasurer",
  on_hold: "On Hold",
  approved: "Approved",
  published: "Published",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

// Tailwind classes (green/gold design system) for status chips.
export const STATUS_CHIP: Record<EventStatus, string> = {
  draft: "bg-line text-ink",
  pending_board: "bg-gold/15 text-gold-deep",
  changes_requested: "bg-gold/15 text-gold-deep",
  pending_treasurer: "bg-gold/15 text-gold-deep",
  on_hold: "bg-gold/15 text-gold-deep",
  approved: "bg-green/10 text-green",
  published: "bg-green text-cream",
  declined: "bg-danger/10 text-danger",
  cancelled: "bg-danger/10 text-danger",
  completed: "bg-navy/10 text-navy",
};

// Pipeline columns (left → right).
export const PIPELINE_ORDER: EventStatus[] = [
  "draft",
  "pending_board",
  "changes_requested",
  "pending_treasurer",
  "on_hold",
  "approved",
  "published",
];

export const BUDGET_CATEGORIES = [
  "Venue/Facility",
  "Materials/Supplies",
  "Food/Refreshments",
  "Marketing/Printing",
  "Honoraria/Stipends",
  "Equipment/Rental",
  "Misc",
] as const;

export const EVENT_TYPES = [
  "community",
  "fundraiser",
  "academic",
  "youth",
  "open house",
  "other",
] as const;

export function formatMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n));
}

// Estimated revenue = attendee fee × expected attendees; net = revenue − expenses.
export function estimatedNet(
  attendeeFee: number,
  expectedAttendees: number,
  expensesTotal: number
): { revenue: number; net: number } {
  const revenue = (Number(attendeeFee) || 0) * (Number(expectedAttendees) || 0);
  return { revenue, net: revenue - (Number(expensesTotal) || 0) };
}
