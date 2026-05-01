import { IconPlus } from '@tabler/icons-react';
import type { StoryContact } from '../data/mock';
import { storyContacts } from '../data/mock';

export function StoriesRow() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '8px 16px 12px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {/* Your story */}
      <StoryItem isAdd />

      {/* Contacts */}
      {storyContacts.map((contact) => (
        <StoryItem key={contact.id} contact={contact} />
      ))}
    </div>
  );
}

function StoryItem({
  isAdd = false,
  contact,
}: {
  isAdd?: boolean;
  contact?: StoryContact;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      {isAdd ? (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '2px dashed rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <IconPlus size={20} color="#8b9dc3" />
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Gradient ring */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4d7af6, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: contact!.avatarBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0a0f1e',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {contact!.avatar}
            </div>
          </div>
          {contact!.isOnline && (
            <div
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#22c55e',
                border: '2px solid #0a0f1e',
              }}
            />
          )}
        </div>
      )}
      <span
        style={{
          color: '#8b9dc3',
          fontSize: 11,
          textAlign: 'center',
          maxWidth: 60,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {isAdd ? 'Your Story' : contact!.name}
      </span>
    </div>
  );
}
