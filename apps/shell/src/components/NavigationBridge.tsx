'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function NavigationBridge() {
  const router = useRouter();

  useEffect(() => {
    function handleNavigate(e: Event) {
      const path = (e as CustomEvent<{ path: string }>).detail?.path;
      if (!path) return;
      e.preventDefault(); // cancel → tells MFE not to fall back to location.href
      router.push(path);
    }

    window.addEventListener('chatapp:navigate', handleNavigate);
    return () => window.removeEventListener('chatapp:navigate', handleNavigate);
  }, [router]);

  return null;
}
