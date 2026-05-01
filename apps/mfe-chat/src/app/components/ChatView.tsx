import { useState } from 'react';
import {
  IconArrowLeft,
  IconVideo,
  IconPhone,
  IconDotsVertical,
  IconPlus,
  IconMoodSmile,
  IconSend,
  IconChecks,
} from '@tabler/icons-react';
import type { Conversation } from '../data/mock';
import { messages } from '../data/mock';
import { Avatar } from './Avatar';
import { TypingIndicator } from './TypingIndicator';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  isMobile: boolean;
}

export function ChatView({ conversation, onBack, isMobile }: ChatViewProps) {
  const [inputValue, setInputValue] = useState('');

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0a0f1e',
        overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: '#131929',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isMobile && (
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
                borderRadius: 8,
                marginRight: 2,
              }}
            >
              <IconArrowLeft size={22} color="#ffffff" />
            </button>
          )}
          <Avatar
            initials={conversation.avatar}
            bg={conversation.avatarBg}
            size={38}
            isOnline={conversation.isOnline}
          />
          <div>
            <div
              style={{
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 15,
                lineHeight: 1.2,
              }}
            >
              {conversation.name}
            </div>
            <div style={{ color: '#22c55e', fontSize: 12 }}>
              {conversation.isOnline ? 'Online' : 'Last seen recently'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <TopBarIcon icon={<IconVideo size={20} color="#8b9dc3" />} />
          <TopBarIcon icon={<IconPhone size={20} color="#8b9dc3" />} />
          <TopBarIcon icon={<IconDotsVertical size={20} color="#8b9dc3" />} />
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          scrollbarWidth: 'thin',
        }}
      >
        {/* Date separator */}
        <DateSeparator label="Today" />

        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{ maxWidth: '75%', minWidth: 80 }}>
                <div
                  style={{
                    background: msg.sender === 'me' ? '#4d7af6' : '#1e2a3d',
                    color: '#ffffff',
                    borderRadius:
                      msg.sender === 'me'
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                    padding: '10px 14px',
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {msg.text}
                </div>

                {/* Timestamp + read receipt */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 4,
                    justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ color: '#8b9dc3', fontSize: 11 }}>{msg.time}</span>
                  {msg.sender === 'me' && (
                    <IconChecks size={14} color="#4d7af6" />
                  )}
                </div>
              </div>
            </div>

            {/* Reaction pill */}
            {msg.reaction && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    background: '#1a2235',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 20,
                    padding: '3px 10px',
                    fontSize: 12,
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {msg.reaction}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        <TypingIndicator />
      </div>

      {/* Message input */}
      <div
        style={{
          padding: '12px 16px',
          background: '#131929',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconPlus size={18} color="#8b9dc3" />
        </button>

        <button
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            flexShrink: 0,
          }}
        >
          <IconMoodSmile size={22} color="#8b9dc3" />
        </button>

        <div
          style={{
            flex: 1,
            background: '#1a2235',
            borderRadius: 20,
            padding: '9px 16px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: 14,
              width: '100%',
            }}
          />
        </div>

        <button
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#4d7af6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 12px rgba(77,122,246,0.35)',
          }}
        >
          <IconSend size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '4px 0 8px',
      }}
    >
      <span
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '3px 14px',
          color: '#8b9dc3',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function TopBarIcon({ icon }: { icon: React.ReactNode }) {
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
