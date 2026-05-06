// LoginPage — Deep Navy + Gold premium split-screen design
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '📚', label: '500+ Books',   sub: 'Across all branches' },
  { icon: '💰', label: 'Best Prices',  sub: 'Student-friendly rates' },
  { icon: '⚡', label: '10-min Delivery', sub: 'Lightning fast' },
  { icon: '🎓', label: 'Semester-wise', sub: 'Curated catalog' },
];

const STATS = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Books' },
  { value: '4.9★', label: 'Rating' },
];

export default function LoginPage() {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [mounted, setMounted]   = useState(false);

  // Always redirect to /dashboard after login — never restore previous protected pages like /cart
  const from = '/dashboard';

  useEffect(() => { setMounted(true); if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

  useEffect(() => { if (error) setLocalError(error); }, [error]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');
    clearError();
    if (!email.trim()) { setLocalError('Email address is required.'); return; }
    if (!password)     { setLocalError('Password is required.'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 750));
    const ok = login(email, password, remember);
    setSubmitting(false);
    if (ok) navigate(from, { replace: true });
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Left Panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{
          width: '48%',
          background: 'linear-gradient(150deg, #050d1a 0%, #0a1628 40%, #0f2040 70%, #1a3055 100%)',
          padding: '3rem',
        }}
      >
        {/* Decorative gold glow */}
        <div style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: '320px', height: '320px',
          background: 'radial-gradient(circle, rgba(244,185,66,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '20%', left: '-40px',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, rgba(41,82,163,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        {/* Grid texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(244,185,66,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(244,185,66,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3.5rem' }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, rgba(244,185,66,0.2), rgba(244,185,66,0.05))',
              border: '1px solid rgba(244,185,66,0.3)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem',
            }}>📖</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.375rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                BookMarket
              </div>
              <div style={{ fontSize: '0.625rem', color: 'rgba(244,185,66,0.7)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>
                Engineering Books
              </div>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Your Academic<br />
            <span style={{ color: '#f4b942' }}>Journey Starts</span><br />
            Here.
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(200,215,240,0.75)', lineHeight: 1.7, maxWidth: 360 }}>
            Get all your semester textbooks in one beautifully curated marketplace, built exclusively for engineering students.
          </p>
        </div>

        {/* Feature grid */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                backdropFilter: 'blur(8px)',
                transition: 'background 200ms',
              }}>
                <div style={{ fontSize: '1.375rem', marginBottom: '0.375rem' }}>{f.icon}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{f.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(200,215,240,0.6)', marginTop: 2 }}>{f.sub}</div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            gap: '0',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{
                flex: 1,
                padding: '0.875rem 1rem',
                textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#f4b942' }}>{s.value}</div>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(200,215,240,0.5)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-surface)',
        minHeight: '100vh',
      }}>
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 400ms ease-out, transform 400ms ease-out',
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #0a1628, #1e3a6e)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>📖</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              BookMarket
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              marginBottom: '0.5rem',
            }}>
              Welcome back 👋
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
              Sign in to your student account to continue
            </p>
          </div>

          {/* Error alert */}
          {localError && (
            <div
              id="login-error"
              role="alert"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                padding: '0.875rem 1rem',
                background: 'var(--error-bg)',
                border: '1px solid var(--error-border)',
                borderRadius: 14,
                marginBottom: '1.25rem',
                animation: 'fadeIn 200ms ease-out',
              }}
            >
              <FiAlertCircle size={16} style={{ color: 'var(--error-text)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--error-text)' }}>{localError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="input-label">Email Address</label>
              <div className="input-wrap">
                <FiMail size={16} className="input-icon input-icon-left" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (localError) setLocalError(''); }}
                  className="input-field has-icon-left"
                  placeholder="Enter your email address"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="login-password" className="input-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'not-allowed', opacity: 0.6 }}
                  title="Password reset coming soon"
                  aria-label="Forgot password (coming soon)"
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-wrap">
                <FiLock size={16} className="input-icon input-icon-left" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (localError) setLocalError(''); }}
                  className="input-field has-icon-left has-icon-right"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-password"
                  className="input-icon-btn"
                  onClick={() => setShowPass(p => !p)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="remember-me"
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#0a1628', cursor: 'pointer' }}
              />
              <label htmlFor="remember-me" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '0.25rem',
                fontSize: '1rem',
                letterSpacing: '0.01em',
              }}
            >
              {submitting ? (
                <>
                  <svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing you in…
                </>
              ) : (
                <>Sign In <FiArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            borderRadius: 14,
            borderLeft: '3px solid #f4b942',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a36010', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demo Credentials
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <code style={{
                fontSize: '0.8125rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)',
                padding: '0.25rem 0.5rem',
                borderRadius: 6,
                border: '1px solid var(--border-default)',
              }}>
                student@bookmarket.com
              </code>
              <code style={{
                fontSize: '0.8125rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface)',
                padding: '0.25rem 0.5rem',
                borderRadius: 6,
                border: '1px solid var(--border-default)',
              }}>
                password123
              </code>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
            © 2025 BookMarket · Built for Engineering Students
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}