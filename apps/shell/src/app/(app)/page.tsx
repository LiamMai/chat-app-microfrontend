'use client';

import dynamic from 'next/dynamic';
import { useCurrentUser } from '@/lib/api/queries';

const ChatApp = dynamic(() => import('mfe_chat/Module'), { ssr: false });

export default function Page() {
  // Already cached by the shell (AppSidebar fetches it) — pass it down so the
  // chat MFE doesn't fire a second /me request.
  const { data: currentUser } = useCurrentUser();
  return <ChatApp embedded currentUser={currentUser ?? undefined} />;
}
