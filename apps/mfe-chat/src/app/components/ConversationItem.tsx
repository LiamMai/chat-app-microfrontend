import { IconUsersGroup } from '@tabler/icons-react';
import type { Conversation } from '../data/mock';
import { Avatar } from './Avatar';
import { StatusIcon } from './StatusIcon';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: (conversation: Conversation) => void;
  isSelected?: boolean;
  compact?: boolean;
}

export function ConversationItem({
  conversation,
  onClick,
  isSelected = false,
  compact = false,
}: ConversationItemProps) {
  const avatarSize = compact ? 42 : 48;

  return (
    <button
      onClick={() => onClick(conversation)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: compact ? '8px 12px' : '10px 16px',
        background: isSelected ? 'rgba(77,122,246,0.12)' : 'transparent',
        border: 'none',
        borderLeft: isSelected ? '3px solid #4d7af6' : '3px solid transparent',
        cursor: 'pointer',
        textAlign: 'left',
        borderRadius: isSelected ? '0 12px 12px 0' : 12,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
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
            color: isSelected ? '#ffffff' : '#ffffff',
            fontWeight: isSelected ? 700 : 600,
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
          <span style={{
            color: isSelected ? '#a0b4d6' : '#8b9dc3',
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {conversation.lastMessage}
          </span>
          <div style={{ marginLeft: 8, flexShrink: 0 }}>
            <StatusIcon statusIcon={conversation.statusIcon} unread={conversation.unread} />
          </div>
        </div>
      </div>
    </button>
  );
}
