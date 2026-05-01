import { useIsMobile } from './hooks/use-is-mobile';
import { useAppState } from './hooks/use-app-state';
import { MessagesView } from './components/MessagesView';
import { ChatView } from './components/ChatView';

export function App() {
  const isMobile = useIsMobile();
  const { state, selectedConversation, selectConversation, goBack } = useAppState();

  if (isMobile) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#0a0f1e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {state.activeView === 'messages' ? (
          <MessagesView
            onSelectConversation={(conv) => selectConversation(conv.id)}
            selectedConversationId={state.selectedConversationId}
            isMobile
          />
        ) : (
          <ChatView
            conversation={selectedConversation}
            onBack={goBack}
            isMobile
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0f1e', display: 'flex', overflow: 'hidden' }}>
      <MessagesView
        onSelectConversation={(conv) => selectConversation(conv.id)}
        selectedConversationId={state.selectedConversationId}
        isMobile={false}
      />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <ChatView conversation={selectedConversation} onBack={goBack} isMobile={false} />
      </div>
    </div>
  );
}

export default App;
