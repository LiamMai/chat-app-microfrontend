'use client';

import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <style>{`
        @keyframes page-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .page-fade-in {
          animation: page-fade-in 0.2s ease forwards;
          height: 100%;
        }
      `}</style>
      <div key={pathname} className="page-fade-in">
        {children}
      </div>
    </>
  );
}
