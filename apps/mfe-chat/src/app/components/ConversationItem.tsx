import { IconUsersGroup } from '@tabler/icons-react';
import type { Conversation } from '../data/mock';
import { Avatar } from './Avatar';
import { StatusIcon } from './StatusIcon';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: (conversation: Conversation) => void;
  isSelected?: boolean;
  compact?: boolean;
  typingLabel?: string;
}

export function ConversationItem({
  conversation,
  onClick,
  isSelected = false,
  compact = false,
  typingLabel,
}: ConversationItemProps) {
  const avatarSize = compact ? 42 : 48;
  const hasUnread = (conversation.unread ?? 0) > 0;
  // Selected and unread rows both get the blue left accent (unread = subtler tint).
  const accented = isSelected || hasUnread;
  const restingBg = isSelected
    ? 'rgba(77,122,246,0.12)'
    : hasUnread
    ? 'rgba(77,122,246,0.06)'
    : 'transparent';

  return (
    <button
      onClick={() => onClick(conversation)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: compact ? '8px 12px' : '10px 16px',
        background: restingBg,
        border: 'none',
        borderLeft: accented ? '3px solid #4d7af6' : '3px solid transparent',
        cursor: 'pointer',
        textAlign: 'left',
        borderRadius: accented ? '0 12px 12px 0' : 12,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLButtonElement).style.background = restingBg;
      }}
    >
      {/* Avatar with optional group badge */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar
          initials={conversation.avatar}
          bg={conversation.avatarBg}
          size={avatarSize}
          isOnline={conversation.isOnline}
        />
        {conversation.isGroup && (
          <div style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#1a2235',
            border: '1.5px solid #131929',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <IconUsersGroup size={10} color="#8b9dc3" />
          </div>
        )}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{
            color: '#ffffff',
            fontWeight: isSelected || hasUnread ? 700 : 600,
            fontSize: compact ? 13 : 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 160,
          }}>
            {conversation.name}
          </span>
          <span style={{ color: isSelected ? '#8b9dc3' : '#8b9dc3', fontSize: 11, flexShrink: 0, marginLeft: 8 }}>
            {conversation.time}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {typingLabel ? (
            <span style={{
              color: '#4d7af6',
              fontSize: 12,
              flex: 1,
              fontStyle: 'italic',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {typingLabel}
            </span>
          ) : (
            <span style={{
              color: hasUnread ? '#c7d4ea' : isSelected ? '#a0b4d6' : '#8b9dc3',
              fontWeight: hasUnread ? 600 : 400,
              fontSize: 12,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {conversation.lastMessage}
            </span>
          )}
          <div style={{ marginLeft: 8, flexShrink: 0 }}>
            <StatusIcon statusIcon={conversation.statusIcon} unread={conversation.unread} />
          </div>
        </div>
      </div>
    </button>
  );
}
