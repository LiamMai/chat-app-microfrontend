import { useEffect, useMemo, useState } from 'react';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { theme } from './lib/theme';
import { useIsMobile } from './hooks/useIsMobile';
import { useChatSocket } from './hooks/useChatSocket';
import { MessagesView } from './components/MessagesView';
import { ChatView } from './components/ChatView';
import { queryClient } from './lib/queryClient';
import {
  chatKeys,
  useCurrentUser,
  useCurrentUserId,
  useIncomingRequests,
  useLastMessagePerRoom,
  useMarkRoomRead,
  useRespondToFriendRequest,
  useRoomsQuery,
} from './lib/queries';
import { displayNameForMember, roomToConversation } from './lib/adapters';
import { RoomType } from './lib/types';
import { chatApi } from './lib/api';
import {
  buildFriendRequestNotifications,
  buildMessageNotifications,
  mockSystemNotifications,
} from './lib/notifications';
import { NotificationsView } from './components/NotificationsView';
// Imported here (not just in bootstrap) so the stylesheet ships inside the
// federated chunk and is injected when the shell host lazy-loads this module.
import '../styles.scss';

type ActiveView = 'messages' | 'chat' | 'notifications';

function AppShell() {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<ActiveView>('messages');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const qc = useQueryClient();
  const { data: currentUserId = null } = useCurrentUserId();
  const { data: currentUser = null } = useCurrentUser();
  const { data: rooms = [], isLoading } = useRoomsQuery();
  const { data: incomingRequests = [] } = useIncomingRequests();
  const lastMessagePerRoom = useLastMessagePerRoom();
  const respondToRequest = useRespondToFriendRequest();
  const markRoomRead = useMarkRoomRead();

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

  const { sendViaSocket, typingPerRoom, notifyLocalTyping, stopLocalTyping } =
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

  // Latest-activity timestamp for a room — prefer the live cached message,
  // then the server's lastMessage, then room activity.
  const activityIso = (r: (typeof rooms)[number]) =>
    lastMessagePerRoom[r._id]?.createdAt ?? r.lastMessage?.createdAt ?? r.updatedAt ?? r.createdAt;

  const conversations = [...rooms]
    .sort((a, b) => new Date(activityIso(b)).getTime() - new Date(activityIso(a)).getTime())
    .map((r) => {
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

      return roomToConversation(r, currentUserId, lastMessage, r.unreadCount ?? 0, activityIso(r));
    });
  const selectedRoom = rooms.find((r) => r._id === selectedRoomId) ?? null;
  const selectedConversation = selectedRoom
    ? roomToConversation(selectedRoom, currentUserId)
    : null;

  const totalUnread = rooms.reduce((sum, r) => sum + (r.unreadCount ?? 0), 0);

  const notifications = useMemo(
    () => [
      ...buildMessageNotifications(conversations),
      ...buildFriendRequestNotifications(incomingRequests),
      ...mockSystemNotifications(),
    ],
    [conversations, incomingRequests],
  );
  const notificationBadgeCount = totalUnread + incomingRequests.length;

  const handleSelect = (id: string) => {
    markRoomRead.mutate(id); // optimistically clears unread + persists server-side
    setSelectedRoomId(id);
    setActiveView('chat');
  };

  const handleBack = () => setActiveView('messages');
  const handleOpenNotifications = () => setActiveView('notifications');

  const handleMarkAllRead = () => {
    for (const r of rooms) {
      if ((r.unreadCount ?? 0) > 0) markRoomRead.mutate(r._id);
    }
  };

  const handleRespondRequest = (requesterId: string, action: 'accept' | 'decline') => {
    respondToRequest.mutate({ requesterId, action });
  };
  const respondingRequesterId = respondToRequest.isPending
    ? respondToRequest.variables?.requesterId ?? null
    : null;

  if (isMobile) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#0a0f1e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeView === 'notifications' ? (
          <NotificationsView
            notifications={notifications}
            isMobile
            onBack={handleBack}
            onSelectRoom={handleSelect}
            onRespondRequest={handleRespondRequest}
            onMarkAllRead={handleMarkAllRead}
            respondingRequesterId={respondingRequesterId}
          />
        ) : activeView === 'messages' || !selectedConversation ? (
          <MessagesView
            conversations={conversations}
            isLoading={isLoading}
            onSelectConversation={(c) => handleSelect(c.id)}
            selectedConversationId={selectedRoomId ?? ''}
            isMobile
            typingLabels={typingLabels}
            currentUser={currentUser}
            notificationBadgeCount={notificationBadgeCount}
            onOpenNotifications={handleOpenNotifications}
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
        typingLabels={typingLabels}
        currentUser={currentUser}
        notificationBadgeCount={notificationBadgeCount}
        onOpenNotifications={handleOpenNotifications}
      />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {activeView === 'notifications' ? (
          <NotificationsView
            notifications={notifications}
            isMobile={false}
            onBack={handleBack}
            onSelectRoom={handleSelect}
            onRespondRequest={handleRespondRequest}
            onMarkAllRead={handleMarkAllRead}
            respondingRequesterId={respondingRequesterId}
          />
        ) : selectedConversation && selectedRoom ? (
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
    <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
