import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useIsMobile } from './hooks/useIsMobile';
import { useChatSocket } from './hooks/useChatSocket';
import { MessagesView } from './components/MessagesView';
import { ChatView } from './components/ChatView';
import { queryClient } from './lib/queryClient';
import { useCurrentUserId, useRoomsQuery } from './lib/queries';
import { roomToConversation } from './lib/adapters';

type ActiveView = 'messages' | 'chat';

function AppShell() {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<ActiveView>('messages');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { data: currentUserId = null } = useCurrentUserId();
  const { data: rooms = [], isLoading } = useRoomsQuery();

  const { sendViaSocket, typingUserData, notifyLocalTyping, stopLocalTyping, unreadCounts, clearUnread } =
    useChatSocket(selectedRoomId, currentUserId);

  const conversations = rooms.map((r) => roomToConversation(r, currentUserId, undefined, unreadCounts[r._id]));
  const selectedRoom = rooms.find((r) => r._id === selectedRoomId) ?? null;
  const selectedConversation = selectedRoom
    ? roomToConversation(selectedRoom, currentUserId)
    : null;

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  const handleSelect = (id: string) => {
    clearUnread(id);
    setSelectedRoomId(id);
    setActiveView('chat');
  };

  const handleBack = () => setActiveView('messages');

  if (isMobile) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#0a0f1e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeView === 'messages' || !selectedConversation ? (
          <MessagesView
            conversations={conversations}
            isLoading={isLoading}
            onSelectConversation={(c) => handleSelect(c.id)}
            selectedConversationId={selectedRoomId ?? ''}
            isMobile
            totalUnread={totalUnread}
          />
        ) : (
          <ChatView
            conversation={selectedConversation}
            roomId={selectedRoom!._id}
            currentUserId={currentUserId}
            sendViaSocket={sendViaSocket}
            typingUsers={typingUserData.map((u) => u.userName)}
            notifyLocalTyping={notifyLocalTyping}
            stopLocalTyping={stopLocalTyping}
            onBack={handleBack}
            isMobile
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0f1e', display: 'flex', overflow: 'hidden' }}>
      <MessagesView
        conversations={conversations}
        isLoading={isLoading}
        onSelectConversation={(c) => handleSelect(c.id)}
        selectedConversationId={selectedRoomId ?? ''}
        isMobile={false}
        totalUnread={totalUnread}
      />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {selectedConversation && selectedRoom ? (
          <ChatView
            conversation={selectedConversation}
            roomId={selectedRoom._id}
            currentUserId={currentUserId}
            sendViaSocket={sendViaSocket}
            typingUsers={typingUserData.map((u) => u.userName)}
            notifyLocalTyping={notifyLocalTyping}
            stopLocalTyping={stopLocalTyping}
            onBack={handleBack}
            isMobile={false}
          />
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  );
}

function EmptyChatState() {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#8b9dc3', fontSize: 14,
    }}>
      Select a conversation to start chatting
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}

export default App;
