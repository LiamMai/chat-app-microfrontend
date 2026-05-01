import { useReducer, useCallback } from 'react';
import { conversations } from '../data/mock';

export type ActiveView = 'messages' | 'chat';
export type ActiveTab = 'chats' | 'contacts' | 'requests' | 'settings';

interface AppState {
  activeView: ActiveView;
  selectedConversationId: string;
  activeTab: ActiveTab;
}

type Action =
  | { type: 'SELECT_CONVERSATION'; id: string }
  | { type: 'BACK' }
  | { type: 'SET_TAB'; tab: ActiveTab };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_CONVERSATION':
      return { ...state, activeView: 'chat', selectedConversationId: action.id };
    case 'BACK':
      return { ...state, activeView: 'messages' };
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
  }
}

const INITIAL: AppState = {
  activeView: 'messages',
  selectedConversationId: conversations[0].id,
  activeTab: 'chats',
};

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const selectConversation = useCallback((id: string) => {
    dispatch({ type: 'SELECT_CONVERSATION', id });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'BACK' });
  }, []);

  const setTab = useCallback((tab: ActiveTab) => {
    dispatch({ type: 'SET_TAB', tab });
  }, []);

  const selectedConversation = conversations.find(
    (c) => c.id === state.selectedConversationId,
  ) ?? conversations[0];

  return { state, selectedConversation, selectConversation, goBack, setTab };
}
