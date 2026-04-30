import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page-root">
      {/* Desktop navbar — hidden on mobile */}
      <nav className="auth-navbar">
        <div className="auth-navbar-inner">
          <Link href="/" className="auth-navbar-logo">
            <ChatIcon size={20} />
            <span>ChatApp</span>
          </Link>
          <div className="auth-navbar-links">
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">Enterprise</a>
            <a href="#">Support</a>
          </div>
          <div className="auth-navbar-actions">
            <Link href="/login" className="auth-navbar-btn-ghost">Login</Link>
            <Link href="/register" className="auth-navbar-btn-blue">Register</Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="auth-main">
        <div className="auth-bg-glow" />
        {children}
      </main>

      {/* Footer */}
      <footer className="auth-footer">
        <div className="auth-footer-inner">
          <div className="auth-footer-logo">
            <ChatIcon size={14} />
            <span>ChatApp</span>
          </div>
          <p>© 2026 ChatApp Inc. Built for deep focus.</p>
          <div className="auth-footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Status</a>
            <a href="#">Security</a>
          </div>
        </div>
      </footer>

      <style>{`
        .auth-page-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--ig-bg);
          font-family: var(--ig-font-system);
        }
        .auth-navbar {
          display: none;
          border-bottom: 1px solid var(--ig-border);
          padding: 0 24px;
        }
        @media (min-width: 768px) { .auth-navbar { display: block; } }
        .auth-navbar-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          height: 56px;
          gap: 32px;
        }
        .auth-navbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--ig-primary);
          font-weight: 700;
          font-size: 16px;
          text-decoration: none;
        }
        .auth-navbar-links {
          display: flex;
          gap: 24px;
          flex: 1;
        }
        .auth-navbar-links a {
          color: var(--ig-secondary);
          font-size: 14px;
          text-decoration: none;
          transition: color 0.15s;
        }
        .auth-navbar-links a:hover { color: var(--ig-primary); }
        .auth-navbar-actions { display: flex; gap: 8px; align-items: center; }
        .auth-navbar-btn-ghost {
          color: var(--ig-primary);
          font-size: 14px;
          font-weight: 500;
          padding: 6px 16px;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .auth-navbar-btn-ghost:hover { background: rgba(255,255,255,0.06); }
        .auth-navbar-btn-blue {
          background: var(--ig-blue);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          padding: 7px 18px;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .auth-navbar-btn-blue:hover { background: var(--ig-blue-hover); }
        .auth-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          position: relative;
          overflow: hidden;
        }
        .auth-bg-glow {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(77,122,246,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-footer {
          border-top: 1px solid var(--ig-border);
          padding: 20px 24px;
          font-size: 12px;
          color: var(--ig-secondary);
        }
        .auth-footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          justify-content: space-between;
        }
        .auth-footer-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: var(--ig-primary);
          font-size: 13px;
        }
        .auth-footer-links { display: flex; gap: 16px; }
        .auth-footer-links a { color: var(--ig-secondary); text-decoration: none; }
        .auth-footer-links a:hover { color: var(--ig-primary); }
      `}</style>
    </div>
  );
}

function ChatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="15" rx="3" fill="#4d7af6" />
      <path d="M8 21l4-3h6a2 2 0 0 0 2-2V6" stroke="#4d7af6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="10.5" r="1.2" fill="white" />
      <circle cx="12" cy="10.5" r="1.2" fill="white" />
      <circle cx="16" cy="10.5" r="1.2" fill="white" />
    </svg>
  );
}
