import {
  IconMessage2,
  IconUsers,
  IconUserPlus,
  IconSettings,
} from '@tabler/icons-react';
import type { ActiveTab } from '../hooks/use-app-state';
import { navigateTo } from '../utils/navigate';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

interface TabConfig {
  id: ActiveTab;
  label: string;
  path: string;
  icon: (active: boolean) => React.ReactNode;
}

const tabs: TabConfig[] = [
  {
    id: 'chats',
    label: 'Chats',
    path: '',
    icon: (active) => <IconMessage2 size={22} color={active ? '#4d7af6' : '#8b9dc3'} />,
  },
  {
    id: 'contacts',
    label: 'Contacts',
    path: '/contacts/add-friends',
    icon: (active) => <IconUsers size={22} color={active ? '#4d7af6' : '#8b9dc3'} />,
  },
  {
    id: 'requests',
    label: 'Requests',
    path: '/contacts/requests',
    icon: (active) => <IconUserPlus size={22} color={active ? '#4d7af6' : '#8b9dc3'} />,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: (active) => <IconSettings size={22} color={active ? '#4d7af6' : '#8b9dc3'} />,
  },
];

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  function handleTabClick(tab: TabConfig) {
    if (tab.id === 'chats') {
      onTabChange(tab.id);
    } else {
      onTabChange(tab.id);
      navigateTo(tab.path);
    }
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      background: '#131929',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '8px 0 12px',
      flexShrink: 0,
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 16px',
              borderRadius: 8,
              minWidth: 60,
            }}
          >
            {tab.icon(isActive)}
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#4d7af6' : '#8b9dc3',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
