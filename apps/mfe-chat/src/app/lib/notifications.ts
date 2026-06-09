import type { Conversation } from '../data/mock';
import type { IncomingFriendRequest } from './types';

export type NotifKind =
  | 'message'
  | 'friend_request'
  | 'mention'
  | 'security'
  | 'system'
  | 'archive';

export type NotifGroup = 'today' | 'yesterday' | 'lastweek' | 'older';

export type NotifAccent = 'brand' | 'danger' | 'muted';

export interface NotifAction {
  /** stable id the view switches on */
  key: string;
  label: string;
  variant: 'primary' | 'default' | 'danger';
}

export interface AppNotification {
  kind: NotifKind;
  id: string;
  title: string;
  preview: string;
  timeLabel: string;
  group: NotifGroup;
  accent: NotifAccent;
  unread?: boolean;
  /** avatar (people) */
  avatar?: string;
  avatarBg?: string;
  avatarUrl?: string | null;
  /** icon (system/security/etc.) instead of avatar */
  icon?: 'message' | 'mention' | 'security' | 'system' | 'archive';
  /** message → open this room */
  roomId?: string;
  /** friend_request → accept/decline this requester */
  requesterId?: string;
  count?: number;
  actions?: NotifAction[];
}

const GROUP_ORDER: Record<NotifGroup, number> = {
  today: 0,
  yesterday: 1,
  lastweek: 2,
  older: 3,
};

export const GROUP_LABELS: Record<NotifGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  lastweek: 'Last week',
  older: 'Earlier',
};

const AVATAR_COLORS = ['#4d7af6', '#7c3aed', '#059669', '#db2777', '#d97706', '#dc2626', '#0891b2'];

function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < (seed?.length ?? 0); i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** ISO timestamp → "Today" group + a short relative label. */
function groupAndLabel(iso?: string): { group: NotifGroup; timeLabel: string } {
  if (!iso) return { group: 'today', timeLabel: 'Just now' };
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return { group: 'today', timeLabel: 'Just now' };
  const now = Date.now();
  const diffMs = now - then;
  const min = Math.floor(diffMs / 60_000);
  const hr = Math.floor(diffMs / 3_600_000);
  const day = Math.floor(diffMs / 86_400_000);

  let timeLabel: string;
  if (min < 1) timeLabel = 'Just now';
  else if (min < 60) timeLabel = `${min}m ago`;
  else if (hr < 24) timeLabel = `${hr}h ago`;
  else if (day < 7) timeLabel = `${day}d ago`;
  else timeLabel = new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });

  let group: NotifGroup = 'older';
  if (day < 1) group = 'today';
  else if (day < 2) group = 'yesterday';
  else if (day < 7) group = 'lastweek';
  return { group, timeLabel };
}

/** Roughly infer a group from the conversation's pre-formatted time string. */
function groupFromConvTime(time: string): NotifGroup {
  if (/^\d{1,2}:\d{2}/.test(time)) return 'today';
  if (/yesterday/i.test(time)) return 'yesterday';
  return 'lastweek';
}

/** Unread conversations → message notifications, highest unread first. */
export function buildMessageNotifications(conversations: Conversation[]): AppNotification[] {
  return conversations
    .filter((c) => (c.unread ?? 0) > 0)
    .sort((a, b) => (b.unread ?? 0) - (a.unread ?? 0))
    .map((c) => ({
      kind: 'message' as const,
      id: `msg:${c.id}`,
      title: c.name,
      preview:
        (c.unread ?? 0) > 1
          ? `${c.unread} new messages · ${c.lastMessage || ''}`.trim()
          : c.lastMessage || 'You have a new message',
      timeLabel: c.time,
      group: groupFromConvTime(c.time),
      accent: 'brand',
      unread: true,
      avatar: c.avatar,
      avatarBg: c.avatarBg,
      icon: 'message',
      roomId: c.id,
      count: c.unread ?? 0,
    }));
}

/** Pending incoming friend requests → actionable friend-request notifications. */
export function buildFriendRequestNotifications(
  requests: IncomingFriendRequest[],
): AppNotification[] {
  return requests.map((req) => {
    const r = req.requester;
    const first = r?.firstName ?? req.firstName;
    const last = r?.lastName ?? req.lastName;
    const name = req.name || [first, last].filter(Boolean).join(' ').trim() || r?.email || 'Someone';
    const seed = req.requesterId ?? req.userId ?? req.id;
    const { group, timeLabel } = groupAndLabel(req.createdAt);
    return {
      kind: 'friend_request' as const,
      id: `req:${req.id}`,
      title: name,
      preview: 'Sent you a friend request',
      timeLabel,
      group,
      accent: 'brand',
      unread: true,
      avatar: initials(name),
      avatarBg: pickColor(seed),
      avatarUrl: r?.avatarUrl ?? null,
      requesterId: req.requesterId ?? req.userId ?? '',
      actions: [
        { key: 'accept', label: 'Accept', variant: 'primary' },
        { key: 'decline', label: 'Decline', variant: 'default' },
      ],
    };
  });
}

/**
 * Static, non-data-backed notifications (security / system / archive) to round
 * out the page. These have no backend yet — mocked to match the design.
 */
export function mockSystemNotifications(): AppNotification[] {
  return [
    {
      kind: 'security',
      id: 'mock:security',
      title: 'Security alert',
      preview:
        'A new login was detected from a Chrome browser on Windows (San Francisco, CA). If this wasn’t you, secure your account.',
      timeLabel: 'Yesterday, 11:45 PM',
      group: 'yesterday',
      accent: 'danger',
      icon: 'security',
      actions: [
        { key: 'not_me', label: "It wasn't me", variant: 'danger' },
        { key: 'dismiss', label: 'Dismiss', variant: 'default' },
      ],
    },
    {
      kind: 'system',
      id: 'mock:system',
      title: 'System update',
      preview:
        'ProChat v2.4 is now live. New features include improved glassmorphism effects and enhanced end-to-end encryption for group calls.',
      timeLabel: 'Yesterday, 9:00 AM',
      group: 'yesterday',
      accent: 'muted',
      icon: 'system',
      actions: [{ key: 'release_notes', label: 'Read release notes', variant: 'default' }],
    },
    {
      kind: 'archive',
      id: 'mock:archive',
      title: 'Archive activity',
      preview:
        'Your archived group “Summer Hike 2023” has been inactive for 6 months and is scheduled for cleanup. Keep it?',
      timeLabel: '4 days ago',
      group: 'lastweek',
      accent: 'muted',
      icon: 'archive',
      actions: [
        { key: 'keep', label: 'Keep', variant: 'default' },
        { key: 'remove', label: 'Remove forever', variant: 'danger' },
      ],
    },
  ];
}

/** Sort notifications into display order: by group, unread first, then existing order. */
export function sortNotifications(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => {
    const g = GROUP_ORDER[a.group] - GROUP_ORDER[b.group];
    if (g !== 0) return g;
    return Number(b.unread ?? false) - Number(a.unread ?? false);
  });
}

/** Group notifications into ordered sections for rendering. */
export function groupNotifications(
  items: AppNotification[],
): { group: NotifGroup; label: string; items: AppNotification[] }[] {
  const order: NotifGroup[] = ['today', 'yesterday', 'lastweek', 'older'];
  return order
    .map((group) => ({
      group,
      label: GROUP_LABELS[group],
      items: items.filter((n) => n.group === group),
    }))
    .filter((section) => section.items.length > 0);
}
