'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  IconRocket,
  IconMessages,
  IconUsers,
  IconUserPlus,
  IconSettings,
} from '@tabler/icons-react';
import { ROUTES } from '@/lib/constants';

const NAV_ITEMS = [
  { icon: IconMessages,  label: 'Messages',  path: ROUTES.MESSAGES,          exact: true },
  { icon: IconUsers,     label: 'Contacts',  path: ROUTES.CONTACTS_ADD,      exact: false },
  { icon: IconUserPlus,  label: 'Requests',  path: ROUTES.CONTACTS_REQUESTS, exact: false },
  { icon: IconSettings,  label: 'Settings',  path: ROUTES.SETTINGS,          exact: false },
] as const;

function isActive(pathname: string, path: string, exact: boolean): boolean {
  if (exact) return pathname === path;
  if (path === ROUTES.CONTACTS_ADD) {
    return pathname === ROUTES.CONTACTS || pathname.startsWith(ROUTES.CONTACTS_ADD);
  }
  if (path === ROUTES.CONTACTS_REQUESTS) {
    return pathname.startsWith(ROUTES.CONTACTS_REQUESTS);
  }
  return pathname.startsWith(path);
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside style={{
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

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map(({ icon: Icon, label, path, exact }) => {
          const active = isActive(pathname, path, exact);
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                borderRadius: 10,
                cursor: active ? 'default' : 'pointer',
                background: active ? 'rgba(77,122,246,0.15)' : 'transparent',
                color: active ? '#4d7af6' : '#8b9dc3',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#8b9dc3';
                }
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* User card */}
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
          width: 34, height: 34, borderRadius: '50%',
          background: '#4d7af6', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontWeight: 700,
          fontSize: 12, flexShrink: 0,
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
    </aside>
  );
}
