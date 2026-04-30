'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/client';
import { useAsyncAction } from '@/hooks/use-async-action';
import { useFormState } from '@/hooks/use-form-state';

/* ─── Icon components (all inline SVG, zero external deps) ─── */

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Reusable InputField ─── */
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  /** When true renders an eye-toggle button on the right */
  passwordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

function InputField({ icon, passwordToggle, showPassword, onTogglePassword, ...props }: InputFieldProps) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute',
        left: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--ig-secondary)',
        display: 'flex',
        pointerEvents: 'none',
      }}>
        {icon}
      </span>
      <input
        className="ig-input"
        style={passwordToggle ? { paddingRight: 44 } : undefined}
        {...props}
      />
      {passwordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ig-secondary)',
            display: 'flex',
            padding: 0,
          }}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
  );
}

/* ─── Label style ─── */
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: 'var(--ig-label)',
  textTransform: 'uppercase',
  marginBottom: 6,
  display: 'block',
};

/* ─── Page component ─── */
export default function RegisterPage() {
  const router = useRouter();

  const [form, setField] = useFormState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '',
    showPassword: false, showConfirm: false, agreed: false,
  });
  const { isLoading, error, setError, execute } = useAsyncAction();

  const passwordValid  = form.password.length >= 8;
  const passwordsMatch = form.password === form.confirmPassword;
  const showMismatch   = form.confirmPassword.length > 0 && !passwordsMatch;

  const canSubmit =
    form.firstName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    passwordValid &&
    passwordsMatch &&
    form.agreed;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    execute(async () => {
      const json = await authApi.register({
        email:     form.email,
        password:  form.password,
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim() || undefined,
      });
      if (json.success) {
        router.push('/onboarding');
      } else {
        setError(json.message ?? 'Registration failed. Please try again.');
      }
    });
  }

  return (
    <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
         className="auth-animate ig-card">
      <div style={{ padding: '40px 36px' }}>

        {/* Heading */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--ig-primary)',
          letterSpacing: '-0.02em',
          marginBottom: 6,
        }}>
          Create Account
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ig-secondary)', marginBottom: 28 }}>
          Start your journey with ChatApp today.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* 2-col grid on sm+ */}
          <div className="reg-field-grid">

            {/* First Name */}
            <div>
              <label style={labelStyle}>First Name</label>
              <InputField
                icon={<PersonIcon />}
                type="text"
                placeholder="Jane"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Last Name */}
            <div>
              <label style={labelStyle}>Last Name <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
              <InputField
                icon={<PersonIcon />}
                type="text"
                placeholder="Doe"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div className="reg-col-full">
              <label style={labelStyle}>Email Address</label>
              <InputField
                icon={<MailIcon />}
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <InputField
                icon={<LockIcon />}
                type={form.showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                disabled={isLoading}
                passwordToggle
                showPassword={form.showPassword}
                onTogglePassword={() => setField("showPassword", !form.showPassword)}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <InputField
                icon={<ShieldIcon />}
                type={form.showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                disabled={isLoading}
                style={showMismatch ? { borderColor: 'var(--ig-error)' } : undefined}
                passwordToggle
                showPassword={form.showConfirm}
                onTogglePassword={() => setField("showConfirm", !form.showConfirm)}
              />
              {showMismatch && (
                <p style={{ fontSize: 12, color: 'var(--ig-error)', marginTop: 4, marginBottom: 0 }}>
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          {/* Terms checkbox — full width */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '20px 0 0' }}>
            <input
              id="reg-terms"
              type="checkbox"
              checked={form.agreed}
              onChange={(e) => setField("agreed", e.target.checked)}
              disabled={isLoading}
              style={{
                marginTop: 2,
                accentColor: 'var(--ig-blue)',
                width: 15,
                height: 15,
                flexShrink: 0,
                cursor: 'pointer',
              }}
            />
            <label htmlFor="reg-terms" style={{ fontSize: 13, color: 'var(--ig-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
              I agree to the{' '}
              <a href="#" style={{ color: 'var(--ig-link)', textDecoration: 'none', fontWeight: 500 }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" style={{ color: 'var(--ig-link)', textDecoration: 'none', fontWeight: 500 }}>
                Privacy Policy
              </a>
            </label>
          </div>

          {/* API error */}
          {error && (
            <p style={{ fontSize: 13, color: 'var(--ig-error)', margin: '12px 0 0', textAlign: 'center' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="ig-btn-primary"
            disabled={!canSubmit || isLoading}
            style={{ marginTop: 20 }}
          >
            {isLoading ? <SpinnerIcon /> : null}
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {/* Log in link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ig-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--ig-link)', fontWeight: 600, textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </div>

      {/* Responsive grid styles */}
      <style>{`
        .reg-field-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .reg-col-full { grid-column: 1 / -1; }
        @media (min-width: 640px) {
          .reg-field-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
