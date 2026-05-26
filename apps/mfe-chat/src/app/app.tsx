import { useEffect, useMemo, useState } from 'react';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from './hooks/useIsMobile';
import { useChatSocket } from './hooks/useChatSocket';
import { MessagesView } from './components/MessagesView';
import { ChatView } from './components/ChatView';
import { queryClient } from './lib/queryClient';
import { chatKeys, useCurrentUser, useCurrentUserId, useLastMessagePerRoom, useRoomsQuery } from './lib/queries';
import { displayNameForMember, roomToConversation } from './lib/adapters';
import { RoomType } from './lib/types';
import { chatApi } from './lib/api';

type ActiveView = 'messages' | 'chat';

function AppShell() {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<ActiveView>('messages');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const qc = useQueryClient();
  const { data: currentUserId = null } = useCurrentUserId();
  const { data: currentUser = null } = useCurrentUser();
  const { data: rooms = [], isLoading } = useRoomsQuery();
  const lastMessagePerRoom = useLastMessagePerRoom();

  useEffect(() => {
    for (const room of rooms) {
      if (room.lastMessage) continue;
      qc.prefetchQuery({
        queryKey: chatKeys.messages(room._id),
        queryFn: async () => (await chatApi.getMessages(room._id)).data.slice().reverse(),
        staleTime: 60_000,
      });
    }
  }, [rooms, qc]);

  const roomIds = useMemo(() => rooms.map((r) => r._id), [rooms]);

  const { sendViaSocket, typingPerRoom, notifyLocalTyping, stopLocalTyping, unreadCounts, clearUnread } =
    useChatSocket(selectedRoomId, currentUserId, roomIds);

  const activeTypingUsers = typingPerRoom[selectedRoomId ?? ''] ?? [];

  const typingLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const [roomId, users] of Object.entries(typingPerRoom)) {
      if (users.length === 0) continue;
      const names = users.map((u) => u.userName);
      if (names.length === 1) labels[roomId] = `${names[0]} is typing...`;
      else if (names.length === 2) labels[roomId] = `${names[0]} and ${names[1]} are typing...`;
      else labels[roomId] = `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`;
    }
    return labels;
  }, [typingPerRoom]);

  const conversations = rooms.map((r) => {
    const cached = lastMessagePerRoom[r._id];
    const content = cached?.content ?? r.lastMessage?.content ?? '';
    const senderId = cached?.senderId ?? r.lastMessage?.senderId ?? null;

    let lastMessage = content;
    if (r.type === RoomType.Group && content && senderId) {
      const name = senderId === currentUserId
        ? 'You'
        : displayNameForMember(r, currentUserId, senderId);
      lastMessage = `${name}: ${content}`;
    }

    return roomToConversation(r, currentUserId, lastMessage, unreadCounts[r._id]);
  });
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
            typingLabels={typingLabels}
            currentUser={currentUser}
          />
        ) : (
          <ChatView
            conversation={selectedConversation}
            roomId={selectedRoom!._id}
            currentUserId={currentUserId}
            sendViaSocket={sendViaSocket}
            typingUsers={activeTypingUsers.map((u) => u.userName)}
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
        typingLabels={typingLabels}
        currentUser={currentUser}
      />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {selectedConversation && selectedRoom ? (
          <ChatView
            conversation={selectedConversation}
            roomId={selectedRoom._id}
            currentUserId={currentUserId}
            sendViaSocket={sendViaSocket}
            typingUsers={activeTypingUsers.map((u) => u.userName)}
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
