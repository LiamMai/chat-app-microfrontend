'use client';

import { usePathname, useRouter } from 'next/navigation';
import { IconMessages, IconUsers, IconUserPlus, IconSettings } from '@tabler/icons-react';
import { ROUTES } from '@/lib/constants';

const TABS = [
  { icon: IconMessages, label: 'Messages', path: ROUTES.MESSAGES,          exact: true },
  { icon: IconUsers,    label: 'Contacts', path: ROUTES.CONTACTS_ADD,      exact: false },
  { icon: IconUserPlus, label: 'Requests', path: ROUTES.CONTACTS_REQUESTS, exact: false },
  { icon: IconSettings, label: 'Settings', path: ROUTES.SETTINGS,          exact: false },
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

export function AppMobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '10px 16px',
      background: '#131929',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
    }}>
      {TABS.map(({ icon: Icon, label, path, exact }) => {
        const active = isActive(pathname, path, exact);
        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            aria-label={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            <Icon size={22} color={active ? '#4d7af6' : '#8b9dc3'} />
          </button>
        );
      })}
    </nav>
  );
}
