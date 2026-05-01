'use client';

import dynamic from 'next/dynamic';

const ChatApp = dynamic(() => import('mfe_chat/Module'), { ssr: false });

export default function Page() {
  return <ChatApp />;
}
