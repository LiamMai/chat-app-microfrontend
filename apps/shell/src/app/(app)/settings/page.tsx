'use client';

import { useState } from 'react';

/* ─── Types ─── */
interface Session { device: string; location: string; current?: boolean; lastSeen?: string }
interface Toggle { label: string; sub: string; on: boolean }

/* ─── Mock data ─── */
const SESSIONS: Session[] = [
  { device: 'MacBook Pro 16"', location: 'San Francisco, USA', current: true },
  { device: 'iPhone 15 Pro', location: 'San Francisco, USA', lastSeen: '2h ago' },
  { device: 'iPad Air', location: 'Oakland, USA', lastSeen: '1d ago' },
];

/* ─── Icon components ─── */
function ContactsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function GroupsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function LaptopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M22 17H2l-2 4h24l-2-4z" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function TabletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/* ─── Reusable Toggle ─── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        background: on ? '#4d7af6' : 'rgba(255,255,255,0.15)',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
      aria-checked={on}
      role="switch"
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: on ? 22 : 2,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}

/* ─── Section card wrapper ─── */
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#131929',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ color: '#4d7af6' }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#fff' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Menu row ─── */
function MenuRow({ icon, label, sub, rightEl }: { icon: React.ReactNode; label: string; sub?: string; rightEl?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      cursor: 'pointer',
    }}>
      <span style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: 'rgba(77,122,246,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8b9dc3',
        flexShrink: 0,
      }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#8b9dc3', marginTop: 2 }}>{sub}</div>}
      </div>
      {rightEl ?? <span style={{ color: '#8b9dc3' }}><ChevronRight /></span>}
    </div>
  );
}

/* ─── Page ─── */
export default function SettingsPage() {
  const [toggles, setToggles] = useState<Toggle[]>([
    { label: 'Dark Mode Architecture', sub: '', on: true },
    { label: 'Desktop Notifications', sub: '', on: true },
    { label: 'Glassmorphism Effects', sub: '', on: false },
  ]);

  function flipToggle(i: number) {
    setToggles((prev) => prev.map((t, idx) => idx === i ? { ...t, on: !t.on } : t));
  }

  const sessionIcons = [<LaptopIcon key="l" />, <PhoneIcon key="p" />, <TabletIcon key="t" />];

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#0a0f1e', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Profile Settings</h1>
        </div>

        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }}>

          {/* Row 1: Profile card + Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="settings-top-row">

            {/* Profile card */}
            <div style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px' }}>
              {/* Mobile: centered avatar layout */}
              <div className="settings-profile-mobile" style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                  <div style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4d7af6, #6c3fc4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 auto',
                  }}>A</div>
                  <button style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#4d7af6',
                    border: '2px solid #0a0f1e',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    <EditIcon />
                  </button>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Alex Rivers</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#4d7af6', fontSize: 13, marginBottom: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#4d7af6"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                  Deep Focus Mode Active
                </div>
                <div style={{ fontSize: 13, color: '#8b9dc3', lineHeight: 1.5 }}>
                  Product Designer &amp; Digital Minimalist.<br />Building the future of focused communication.
                </div>
              </div>

              {/* Desktop: side-by-side layout */}
              <div className="settings-profile-desktop" style={{ display: 'none' }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 90,
                      height: 90,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #4d7af6, #6c3fc4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#fff',
                    }}>A</div>
                    <button style={{
                      position: 'absolute',
                      bottom: -8,
                      right: -8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#4d7af6',
                      border: '2px solid #0a0f1e',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <EditIcon />
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Alex Rivera</div>
                    <div style={{ fontSize: 14, color: '#8b9dc3', lineHeight: 1.6, marginBottom: 12 }}>
                      Senior Product Designer focused on creating seamless communication experiences. Passionate about dark UI and glassmorphism.
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['Product Design', 'Remote', 'Coffee Enthusiast'].map((tag) => (
                        <span key={tag} style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(77,122,246,0.12)', color: '#8b9dc3', fontSize: 12 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats (desktop only) */}
            <div className="settings-quick-stats" style={{
              display: 'none',
              background: '#131929',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '24px',
            }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Quick Stats</h2>
              {[['Messages', '12.4k'], ['Contacts', '842'], ['Groups', '15']].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 14, color: '#8b9dc3' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, color: '#8b9dc3', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Member since</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>October 2021</div>
              </div>
            </div>
          </div>

          {/* Mobile stats row */}
          <div className="settings-stats-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['1.2k', 'MESSAGES'], ['42', 'CONTACTS']].map(([val, label]) => (
              <div key={label} style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#4d7af6' }}>{val}</div>
                <div style={{ fontSize: 11, color: '#8b9dc3', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Account Settings + App Preferences row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="settings-mid-row">
            <Section title="Account Settings" icon={<ContactsIcon />}>
              <MenuRow icon={<MailIcon />} label="Email Address" sub="alex.rivera@prochat.io" />
              <MenuRow icon={<LockIcon />} label="Password & Security" sub="Last changed 3 months ago" />
              <MenuRow icon={<ShieldIcon />} label="Two-Factor Auth" sub="Enabled" rightEl={<span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Enabled</span>} />
            </Section>

            <Section title="App Preferences" icon={<GridIcon />}>
              {[
                { label: 'Dark Mode Architecture', sub: '', icon: <MoonIcon /> },
                { label: 'Desktop Notifications', sub: '', icon: <BellIcon /> },
                { label: 'Glassmorphism Effects', sub: '', icon: <GridIcon /> },
              ].map((item, i) => (
                <div key={item.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <span style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(77,122,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b9dc3', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, color: '#fff' }}>{item.label}</span>
                  <Toggle on={toggles[i].on} onChange={() => flipToggle(i)} />
                </div>
              ))}
            </Section>
          </div>

          {/* Active Sessions */}
          <Section title="Active Sessions" icon={<LaptopIcon />}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {SESSIONS.map((s, i) => (
                <div key={s.device} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '14px 16px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}>
                  <span style={{ color: '#8b9dc3', marginTop: 2 }}>{sessionIcons[i]}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.device}</div>
                    <div style={{ fontSize: 12, color: '#8b9dc3' }}>{s.location} • {s.current ? 'Current' : s.lastSeen}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Mobile preferences section */}
          <div className="settings-mobile-prefs" style={{ display: 'none' }}>
            <div style={{ fontSize: 11, color: '#8b9dc3', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Preferences</div>
            <div style={{ background: '#131929', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
              {[
                { icon: <SettingsIcon />, label: 'Settings', sub: 'General app preferences' },
                { icon: <ShieldIcon />, label: 'Account Privacy', sub: 'Security and visibility' },
                { icon: <BellIcon />, label: 'Notifications', sub: 'Alerts and sound' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(77,122,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b9dc3', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#8b9dc3', marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <span style={{ color: '#8b9dc3' }}><ChevronRight /></span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ background: '#131929', border: '1px solid rgba(237,73,86,0.3)', borderRadius: 12, padding: '20px 24px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#ed4956' }}>Danger Zone</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 14, color: '#fff', marginBottom: 2 }}>Delete Account</div>
                <div style={{ fontSize: 12, color: '#8b9dc3' }}>Permanently remove all your data and chat history.</div>
              </div>
              <button style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: '1px solid #ed4956',
                background: 'transparent',
                color: '#ed4956',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}>
                Delete Profile
              </button>
            </div>
          </div>

          {/* Mobile logout */}
          <div className="settings-logout-mobile" style={{ display: 'none' }}>
            <button style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#131929',
              color: '#ed4956',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}>
              <LogoutIcon />
              Log Out
            </button>
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#8b9dc3' }}>
              Version 2.4.0 • FocusChat Enterprise
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .settings-profile-mobile { display: block !important; }
          .settings-profile-desktop { display: none !important; }
          .settings-quick-stats { display: none !important; }
          .settings-top-row { grid-template-columns: 1fr !important; }
          .settings-mid-row { grid-template-columns: 1fr !important; }
          .settings-mobile-prefs { display: block !important; }
          .settings-logout-mobile { display: block !important; }
          .settings-stats-mobile { display: grid !important; }
        }
        @media (min-width: 768px) {
          .settings-top-row { grid-template-columns: 1fr 320px !important; }
          .settings-quick-stats { display: block !important; }
          .settings-profile-mobile { display: none !important; }
          .settings-profile-desktop { display: block !important; }
          .settings-mid-row { grid-template-columns: 1fr 1fr !important; }
          .settings-stats-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
