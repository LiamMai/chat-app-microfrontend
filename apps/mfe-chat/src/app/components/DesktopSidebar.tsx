import {
  IconRocket,
  IconMessages,
  IconUsers,
  IconUsersGroup,
  IconPhone,
  IconSettings,
} from '@tabler/icons-react';
import { navigateTo } from '../utils/navigate';

interface NavItemConfig {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { icon: <IconMessages size={18} />, label: 'Messages', path: '', isActive: true },
  { icon: <IconUsers size={18} />, label: 'Contacts', path: '/contacts/add-friends' },
  { icon: <IconUsersGroup size={18} />, label: 'Groups', path: '/groups' },
  { icon: <IconPhone size={18} />, label: 'Calls', path: '/calls' },
];

function NavItem({ item }: { item: NavItemConfig }) {
  function handleClick() {
    if (!item.isActive) navigateTo(item.path);
  }

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '10px 12px',
        border: 'none',
        borderRadius: 10,
        cursor: item.isActive ? 'default' : 'pointer',
        background: item.isActive ? 'rgba(77,122,246,0.15)' : 'transparent',
        color: item.isActive ? '#4d7af6' : '#8b9dc3',
        fontWeight: item.isActive ? 600 : 400,
        fontSize: 14,
        transition: 'background 0.15s, color 0.15s',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!item.isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
          (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
        }
      }}
      onMouseLeave={(e) => {
        if (!item.isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = '#8b9dc3';
        }
      }}
    >
      {item.icon}
      <span>{item.label}</span>
    </button>
  );
}

export function DesktopSidebar() {
  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      background: '#131929',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      height: '100%',
    }}>
      {/* Logo */}
      <div style={{ padding: '4px 12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconRocket size={24} color="#4d7af6" />
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 16 }}>ProChat</span>
        </div>
        <span style={{ color: '#4d7af6', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', marginTop: 2, display: 'block' }}>
          ACTIVE NOW
        </span>
      </div>

      {/* Main nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>

      {/* Settings pinned at bottom */}
      <div style={{ marginBottom: 12 }}>
        <NavItem item={{ icon: <IconSettings size={18} />, label: 'Settings', path: '/settings' }} />
      </div>

      {/* User profile card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#4d7af6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 12,
          flexShrink: 0,
        }}>
          AR
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#ffffff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Alex Rivera
          </div>
          <div style={{ color: '#4d7af6', fontSize: 11 }}>Pro Plan</div>
        </div>
      </div>
    </div>
  );
}
