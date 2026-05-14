// LoginPage — Deep Navy + Gold premium split-screen design
// Left panel auto-transitions between BookMarket content & VCube Credits every 8s
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight, FiInfo, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '📚', label: '500+ Books', sub: 'Across all branches' },
  { icon: '💰', label: 'Best Prices', sub: 'Student-friendly rates' },
  { icon: '⚡', label: '10-min Delivery', sub: 'Lightning fast' },
  { icon: '🎓', label: 'Semester-wise', sub: 'Curated catalog' },
];

const STATS = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Books' },
  { value: '4.9★', label: 'Rating' },
];



// ── Person Avatar ────────────────────────────────────────────────────────────
function PersonAvatar({ initials, color = '#f4b942', size = 48 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 14,
      background: `linear-gradient(135deg, ${color}22, ${color}44)`,
      border: `2px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 800, color,
      letterSpacing: '0.05em', flexShrink: 0,
      fontFamily: "'Playfair Display', serif",
    }}>
      {initials}
    </div>
  );
}

// ── Credits Panel ────────────────────────────────────────────────────────────
// ── Credits Panel ────────────────────────────────────────────────────────────
function CreditsPanel() {
  const vOrange = '#F27405';
  const vBlack = '#000000';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Main Logo Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-block', padding: '1rem', background: 'rgba(242,116,5,0.05)', borderRadius: 24, border: `1px solid ${vOrange}22`, marginBottom: '1.5rem' }}>
          <img
            src="/vcube logo.png"
            alt="VCube Logo"
            style={{ height: 80, width: 'auto', filter: 'drop-shadow(0 0 20px rgba(242,116,5,0.3))' }}
            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=V+CUBE&background=F27405&color=fff&size=128'; }}
          />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.875rem', fontWeight: 900, color: 'white', letterSpacing: '0.02em', margin: 0 }}>
          VCube Software Solutions Pvt. Ltd.
        </h2>
        <div style={{ height: 4, width: 60, background: vOrange, margin: '1rem auto 0' }} />
      </div>

      {/* Board of Directors — Circular Images */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${vOrange}`, boxShadow: `0 0 20px ${vOrange}33`, marginBottom: '0.75rem' }}>
            <img src="/ankalla rao sir.jpeg" alt="Chairman" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Ankala+Rao&background=222&color=F27405'; }} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', margin: 0 }}>Mr.M Ankala Rao</p>
          <p style={{ fontSize: '0.625rem', color: vOrange, fontWeight: 700 }}>Managing Director</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${vOrange}`, boxShadow: `0 0 20px ${vOrange}33`, marginBottom: '0.75rem' }}>
            <img src="/vamsi sir.jpeg" alt="Chairman" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Vamsi+Reddy&background=222&color=F27405'; }} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', margin: 0 }}>Mr.A Vamsi Krishna</p>
          <p style={{ fontSize: '0.625rem', color: vOrange, fontWeight: 700 }}>Director</p>
        </div>
      </div>

      {/* Mentor Section — Box with Photo-Left Info-Right */}
      <div style={{
        background: 'linear-gradient(135deg, #111 0%, #000 100%)',
        border: `1px solid ${vOrange}44`,
        borderRadius: 24,
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 15px 35px rgba(0,0,0,0.4)'
      }}>
        <div style={{ width: 200, height: 200, borderRadius: 16, overflow: 'hidden', border: `2px solid ${vOrange}`, flexShrink: 0 }}>
          <img src="/mentor-bvr.jpeg" alt="Mentor" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=BVR+Manohar&background=F27405&color=fff'; }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white', marginBottom: '0.25rem' }}>Mr. BRV Manohar Rao</h3>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: vOrange, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Testing Mentor & Architect</p>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
            Visionary behind the testing sandbox, providing expert guidance for student skill enhancement.
          </p>
        </div>
      </div>

      {/* Application Info Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 style={{ fontSize: '0.6875rem', fontWeight: 900, color: vOrange, textTransform: 'uppercase', marginBottom: '0.5rem' }}>QA Testing</h4>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, margin: 0 }}>
            Live environment for manual and automation testing practice.
          </p>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 style={{ fontSize: '0.6875rem', fontWeight: 900, color: vOrange, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Live Monitoring</h4>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, margin: 0 }}>
            Real-time activity tracking and log analysis for quality assurance.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── BookMarket Content Panel ─────────────────────────────────────────────────
function BookMarketPanel() {
  return (
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
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

      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: '1.375rem', marginBottom: '0.375rem' }}>{f.icon}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{f.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(200,215,240,0.6)', marginTop: 2 }}>{f.sub}</div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', gap: '0',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              flex: 1, padding: '0.875rem 1rem', textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#f4b942' }}>{s.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(200,215,240,0.5)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Login Page ──────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Left panel state: 'bookmarket' | 'credits'
  const [leftPanel, setLeftPanel] = useState('bookmarket');
  const [panelFade, setPanelFade] = useState(true); // true = visible
  const timerRef = useRef(null);

  const from = '/dashboard';

  useEffect(() => {
    setMounted(true);
    document.title = 'Login - Book Market';
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated]);

  useEffect(() => { if (error) setLocalError(error); }, [error]);

  // Auto-cycle left panel every 8s (bookmarket → credits → bookmarket → …)
  useEffect(() => {
    function cycle() {
      // fade out
      setPanelFade(false);
      setTimeout(() => {
        setLeftPanel(prev => prev === 'bookmarket' ? 'credits' : 'bookmarket');
        setPanelFade(true);
      }, 600); // match CSS transition
    }
    timerRef.current = setInterval(cycle, 8000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Manual toggle via dot indicators
  function goToPanel(panel) {
    if (panel === leftPanel) return;
    clearInterval(timerRef.current);
    setPanelFade(false);
    setTimeout(() => {
      setLeftPanel(panel);
      setPanelFade(true);
      timerRef.current = setInterval(() => {
        setPanelFade(false);
        setTimeout(() => {
          setLeftPanel(prev => prev === 'bookmarket' ? 'credits' : 'bookmarket');
          setPanelFade(true);
        }, 600);
      }, 10000); // Slower cycle for more reading time
    }, 600);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');
    clearError();
    if (!email.trim()) { setLocalError('Email address is required.'); return; }
    if (!password) { setLocalError('Password is required.'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 750));
    const ok = login(email, password, remember);
    setSubmitting(false);
    if (ok) navigate(from, { replace: true });
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Left Panel ───────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col relative overflow-hidden"
        style={{
          width: '48%',
          background: '#000000', // Pure Black Base
          padding: '2.5rem',
          borderRight: '1px solid rgba(242,116,5,0.2)',
        }}
      >
        {/* Dynamic Orange Glows — Mixture of Orange and Black */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(242,116,5,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-5%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(242,116,5,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Development Team Credit — Top Corner */}
        <div style={{
          position: 'relative', zIndex: 10,
          fontSize: '0.6875rem', fontWeight: 800,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: '0.15em',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          <span style={{ width: 20, height: 1, background: 'rgba(242,116,5,0.5)' }} />
          Developed by VCube Development Team(MERN Stack)
        </div>

        {/* Animated panel content */}
        <div style={{
          flex: 1,
          opacity: panelFade ? 1 : 0,
          transform: panelFade ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 600ms ease, transform 600ms ease',
          display: 'flex', flexDirection: 'column',
          position: 'relative', zIndex: 1
        }}>
          {leftPanel === 'bookmarket' ? <BookMarketPanel /> : <CreditsPanel />}
        </div>

        {/* Navigation Dot Control */}
        <div style={{
          position: 'absolute', bottom: '2.5rem', left: '2.5rem',
          display: 'flex', gap: '0.75rem', alignItems: 'center', zIndex: 10,
        }}>
          {['bookmarket', 'credits'].map(p => (
            <button
              key={p}
              onClick={() => goToPanel(p)}
              style={{
                width: leftPanel === p ? 32 : 12,
                height: 4, borderRadius: 2,
                background: leftPanel === p ? '#F27405' : 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 400ms ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-surface)',
        minHeight: '100vh',
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 400ms ease-out, transform 400ms ease-out',
        }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #0a1628, #1e3a6e)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}>📖</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>BookMarket</span>
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Sign in to your BookMarket account
          </p>

          {localError && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              padding: '0.875rem 1rem', marginBottom: '1.25rem',
              background: 'rgba(220,38,38,0.06)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 12, color: '#dc2626',
            }}>
              <FiAlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="input-label">Email address</label>
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
                  placeholder="Password"
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

          

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.25rem', fontSize: '1rem', letterSpacing: '0.01em' }}
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
            marginTop: '1.5rem', padding: '1rem',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            borderRadius: 14, borderLeft: '3px solid #f4b942',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a36010', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demo Credentials
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <code style={{ fontSize: '0.8125rem', fontFamily: "'DM Mono', monospace", color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                student@bookmarket.com
              </code>
              <code style={{ fontSize: '0.8125rem', fontFamily: "'DM Mono', monospace", color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                password123
              </code>
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
            © 2025 BookMarket · Powered by{' '}
            <span style={{ color: '#f4b942', fontWeight: 600 }}>VCube Software Solutions</span>
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