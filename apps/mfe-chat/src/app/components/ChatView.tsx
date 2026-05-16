import { useEffect, useRef, useState } from 'react';
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
import { Avatar } from './Avatar';
import { TypingIndicator } from './TypingIndicator';
import { useMessagesQuery, useSendMessageMutation } from '../lib/queries';
import { messageToUiMessage } from '../lib/adapters';

interface ChatViewProps {
  conversation: Conversation;
  roomId: string;
  currentUserId: string | null;
  sendViaSocket: (content: string) => boolean;
  typingUsers: string[];
  notifyLocalTyping: () => void;
  stopLocalTyping: () => void;
  onBack: () => void;
  isMobile: boolean;
}

function buildTypingLabel(typingUsers: string[]): string {
  if (typingUsers.length === 0) return '';
  if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
  if (typingUsers.length === 2) {
    return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  }

  const [first, second, ...rest] = typingUsers;
  return `${first}, ${second}, and ${rest.length} others are typing...`;
}

export function ChatView({
  conversation,
  roomId,
  currentUserId,
  sendViaSocket,
  typingUsers,
  notifyLocalTyping,
  stopLocalTyping,
  onBack,
  isMobile,
}: ChatViewProps) {
  const [inputValue, setInputValue] = useState('');
  const { data: rawMessages = [], isLoading } = useMessagesQuery(roomId);
  const sendMutation = useSendMessageMutation(roomId);
  
  const messages = rawMessages.map((m) => messageToUiMessage(m, currentUserId));
  const typingLabel = buildTypingLabel(typingUsers);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, typingLabel]);

  function submit() {
    const content = inputValue.trim();
    if (!content) return;
    setInputValue('');
    stopLocalTyping();
    if (!sendViaSocket(content)) {
      sendMutation.mutate(content);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setInputValue(next);
    if (next.length === 0) stopLocalTyping();
    else notifyLocalTyping();
  }

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
        ref={scrollRef}
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

        {isLoading && (
          <div style={{ color: '#8b9dc3', fontSize: 13, textAlign: 'center', padding: 12 }}>
            Loading messages…
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div style={{ color: '#8b9dc3', fontSize: 13, textAlign: 'center', padding: 12 }}>
            No messages yet — say hi
          </div>
        )}

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

        {/* Typing indicator — driven by socket events, only renders when label non-empty */}
        <TypingIndicator label={typingLabel} />
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
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
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
          onClick={submit}
          disabled={!inputValue.trim() || sendMutation.isPending}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#4d7af6',
            border: 'none',
            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 12px rgba(77,122,246,0.35)',
            opacity: inputValue.trim() ? 1 : 0.5,
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
