import { useState } from 'react';
import {
  IconSearch,
  IconBell,
  IconFilter,
  IconPencil,
} from '@tabler/icons-react';
import type { Conversation } from '../data/mock';
import { conversations } from '../data/mock';
import { Avatar } from './Avatar';
import { ConversationItem } from './ConversationItem';
import { StoriesRow } from './StoriesRow';

interface MessagesViewProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId: string;
  isMobile: boolean;
}

export function MessagesView({ onSelectConversation, selectedConversationId, isMobile }: MessagesViewProps) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase()),
  );

  if (!isMobile) {
    // Desktop chat-list panel
    return (
      <div
        style={{
          width: 300,
          flexShrink: 0,
          background: '#131929',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 16px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 18 }}>
            Chats
          </span>
          <button
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: 8,
              padding: 7,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconFilter size={16} color="#8b9dc3" />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 12px 12px', flexShrink: 0 }}>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              onClick={onSelectConversation}
              isSelected={conv.id === selectedConversationId}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  // Mobile full-panel
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0a0f1e',
        overflow: 'hidden',
      }}
    >
      {/* Mobile top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 12px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials="ME" bg="#4d7af6" size={32} />
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 17 }}>
            FocusChat
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconButton icon={<IconSearch size={20} color="#8b9dc3" />} />
          <IconButton icon={<IconBell size={20} color="#8b9dc3" />} />
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Stories */}
      <div style={{ flexShrink: 0 }}>
        <StoriesRow />
      </div>

      {/* Recent Messages */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
        <div style={{ padding: '4px 16px 8px', flexShrink: 0 }}>
          <span
            style={{ color: '#8b9dc3', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}
          >
            Recent Messages
          </span>
        </div>
        {filtered.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            onClick={onSelectConversation}
            isSelected={conv.id === selectedConversationId}
          />
        ))}
      </div>

      {/* FAB */}
      <button
        style={{
          position: 'absolute',
          bottom: 80,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#4d7af6',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(77,122,246,0.4)',
          zIndex: 10,
        }}
      >
        <IconPencil size={22} color="#fff" />
      </button>
    </div>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#1a2235',
        borderRadius: 20,
        padding: '8px 14px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <IconSearch size={16} color="#8b9dc3" />
      <input
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#ffffff',
          fontSize: 14,
          flex: 1,
          minWidth: 0,
        }}
      />
    </div>
  );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: 'none',
        borderRadius: 8,
        padding: 8,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </button>
  );
}
