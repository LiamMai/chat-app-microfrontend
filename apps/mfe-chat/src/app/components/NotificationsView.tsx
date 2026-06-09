import { useState, type CSSProperties } from 'react';
import { Avatar, Button } from '@mantine/core';
import {
  IconArchive,
  IconArrowLeft,
  IconAt,
  IconBellOff,
  IconMessage,
  IconRocket,
  IconShieldLock,
} from '@tabler/icons-react';
import {
  groupNotifications,
  sortNotifications,
  type AppNotification,
  type NotifAccent,
} from '../lib/notifications';

interface NotificationsViewProps {
  notifications: AppNotification[];
  isMobile: boolean;
  onBack: () => void;
  onSelectRoom: (roomId: string) => void;
  onRespondRequest: (requesterId: string, action: 'accept' | 'decline') => void;
  onMarkAllRead: () => void;
  respondingRequesterId?: string | null;
}

const ACCENT_COLOR: Record<NotifAccent, string> = {
  brand: '#4d7af6',
  danger: '#ef4444',
  muted: 'transparent',
};

const ACCENT_TINT: Record<NotifAccent, string> = {
  brand: 'rgba(77,122,246,0.06)',
  danger: 'rgba(239,68,68,0.06)',
  muted: 'rgba(255,255,255,0.02)',
};

export function NotificationsView({
  notifications,
  isMobile,
  onBack,
  onSelectRoom,
  onRespondRequest,
  onMarkAllRead,
  respondingRequesterId = null,
}: NotificationsViewProps) {
  // Locally-dismissed mock notifications (security/system/archive have no backend).
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  function dismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  const visible = sortNotifications(notifications).filter((n) => !dismissed.has(n.id));
  const sections = groupNotifications(visible);

  function handleAction(n: AppNotification, key: string) {
    if (n.kind === 'friend_request' && n.requesterId) {
      if (key === 'accept') onRespondRequest(n.requesterId, 'accept');
      if (key === 'decline') onRespondRequest(n.requesterId, 'decline');
      return;
    }
    // Mock actions (security / system / archive): dismiss locally.
    dismiss(n.id);
  }

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        background: '#0a0f1e',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: isMobile ? '16px 16px 12px' : '24px 28px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {isMobile && (
              <button onClick={onBack} aria-label="Back" style={iconBtnStyle}>
                <IconArrowLeft size={18} color="#8b9dc3" />
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, color: '#fff', fontSize: isMobile ? 18 : 24, fontWeight: 700 }}>
                Notifications
              </h1>
              {!isMobile && (
                <p style={{ margin: '4px 0 0', color: '#8b9dc3', fontSize: 13 }}>
                  Stay updated with your community and security.
                </p>
              )}
            </div>
          </div>
          <button onClick={onMarkAllRead} style={markAllStyle}>
            Mark all as read
          </button>
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', padding: isMobile ? '8px 12px 24px' : '12px 28px 28px' }}>
        {sections.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {sections.map((section) => (
              <div key={section.group} style={{ marginBottom: 8 }}>
                <div style={sectionLabelStyle}>{section.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {section.items.map((n) => (
                    <NotificationCard
                      key={n.id}
                      n={n}
                      onOpen={() => n.roomId && onSelectRoom(n.roomId)}
                      onAction={(key) => handleAction(n, key)}
                      pending={!!n.requesterId && respondingRequesterId === n.requesterId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  n,
  onOpen,
  onAction,
  pending,
}: {
  n: AppNotification;
  onOpen: () => void;
  onAction: (key: string) => void;
  pending: boolean;
}) {
  const clickable = n.kind === 'message' && !!n.roomId;

  return (
    <div
      onClick={clickable ? onOpen : undefined}
      style={{
        position: 'relative',
        borderRadius: 14,
        background: ACCENT_TINT[n.accent],
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${ACCENT_COLOR[n.accent]}`,
        padding: 16,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <NotifIcon n={n} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{n.title}</span>
            <span style={{ color: '#8b9dc3', fontSize: 11, flexShrink: 0, whiteSpace: 'nowrap' }}>
              {n.timeLabel}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', color: '#a0b4d6', fontSize: 13, lineHeight: 1.5 }}>
            {n.preview}
          </p>

          {n.actions && n.actions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {n.actions.map((a) => (
                <Button
                  key={a.key}
                  size="xs"
                  radius="md"
                  loading={pending && (a.key === 'accept' || a.key === 'decline')}
                  variant={a.variant === 'default' ? 'default' : 'filled'}
                  color={a.variant === 'danger' ? 'red' : a.variant === 'primary' ? 'brand' : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(a.key);
                  }}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotifIcon({ n }: { n: AppNotification }) {
  // People notifications use an avatar; system ones use a colored icon chip.
  if (n.kind === 'message' || n.kind === 'friend_request') {
    return (
      <Avatar size={42} radius="xl" src={n.avatarUrl ?? undefined} style={{ background: n.avatarBg, flexShrink: 0 }}>
        <span className="text-sm font-bold text-white">{n.avatar}</span>
      </Avatar>
    );
  }

  const color = n.accent === 'danger' ? '#ef4444' : n.accent === 'brand' ? '#4d7af6' : '#8b9dc3';
  const bg =
    n.accent === 'danger'
      ? 'rgba(239,68,68,0.15)'
      : n.accent === 'brand'
      ? 'rgba(77,122,246,0.15)'
      : 'rgba(255,255,255,0.06)';

  const Icon =
    n.icon === 'security'
      ? IconShieldLock
      : n.icon === 'system'
      ? IconRocket
      : n.icon === 'archive'
      ? IconArchive
      : n.icon === 'mention'
      ? IconAt
      : IconMessage;

  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={20} color={color} />
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        height: '100%',
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        color: '#8b9dc3',
      }}
    >
      <IconBellOff size={40} color="#3a4a66" />
      <span style={{ fontSize: 14 }}>You&apos;re all caught up</span>
    </div>
  );
}

const iconBtnStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: 'none',
  borderRadius: 8,
  padding: 7,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const markAllStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#4d7af6',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const sectionLabelStyle: CSSProperties = {
  color: '#8b9dc3',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  padding: '8px 4px',
};
