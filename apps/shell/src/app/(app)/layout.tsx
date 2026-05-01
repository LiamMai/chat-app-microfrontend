import { AppSidebar } from '@/components/AppSidebar';
import { AppMobileNav } from '@/components/AppMobileNav';
import { PageTransition } from '@/components/PageTransition';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100dvh', background: '#0a0f1e', overflow: 'hidden' }}>
      {/* Desktop sidebar — hidden on mobile via media query */}
      <div style={{ display: 'none' }} className="lg-sidebar">
        <AppSidebar />
      </div>

      {/* Main content + mobile nav stack */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <main style={{ flex: 1, overflow: 'hidden' }}>
          <PageTransition>{children}</PageTransition>
        </main>
        {/* Mobile bottom nav */}
        <div className="mobile-nav">
          <AppMobileNav />
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 1023px) {
          .lg-sidebar { display: none !important; }
          .mobile-nav { display: block !important; }
        }
      `}</style>
    </div>
  );
}
