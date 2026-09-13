'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldAlert, Info } from 'lucide-react';

export default function LoginPage() {
  const { loginWithCredentials } = useAuth();
  const router = useRouter();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please enter your email or username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await loginWithCredentials(usernameInput, passwordInput);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setErrorMessage(res.error || 'Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F7F5',
        fontFamily: 'var(--font-sans, Inter, -apple-system, BlinkMacSystemFont, sans-serif)',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* ── EXPANDED FULL-HEIGHT FLOATING CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '1580px',
          height: 'calc(100vh - 32px)',
          minHeight: '660px',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #EAEAEA',
          boxShadow: '0 25px 50px -15px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          padding: '24px 28px',
          gap: '32px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* ── LEFT SECTION: LOGIN FORM ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12px 24px 12px 12px',
            height: '100%',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          {/* Top Bar: Company Logo & Contact Support (No Social Media) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '36px',
            }}
          >
            {/* Minimalist Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/thi-logo-official.png"
                alt="PT Taka Hydrocore Indonesia"
                style={{
                  height: '32px',
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
            </div>

          </div>

          {/* Form Content Area */}
          <div style={{ maxWidth: '500px', width: '100%', margin: 'auto 0' }}>
            {/* Breadcrumb / Section Indicator */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#9CA3AF',
                letterSpacing: '0.04em',
                marginBottom: '16px',
              }}
            >
              01 / Login
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(40px, 4.4vw, 54px)',
                fontWeight: 500,
                color: '#111827',
                letterSpacing: '-0.035em',
                lineHeight: 1.08,
                margin: '0 0 16px 0',
              }}
            >
              Welcome back
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: '15.5px',
                color: '#6B7280',
                lineHeight: 1.55,
                margin: '0 0 38px 0',
                maxWidth: '460px',
              }}
            >
              Sign in to access the Document Control Management System.
            </p>

            {/* Form Fields */}
            <form onSubmit={handleLogin}>
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 18 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      padding: '10px 14px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      color: '#DC2626',
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <ShieldAlert size={15} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username Field */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="login-username"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#111827',
                    marginBottom: '8px',
                  }}
                >
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={usernameInput}
                  onChange={e => {
                    setUsernameInput(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0 8px 0',
                    borderRadius: '0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #E5E7EB',
                    color: '#111827',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = '#111827')}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = '#E5E7EB')}
                />
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '22px' }}>
                <label
                  htmlFor="login-password"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#111827',
                    marginBottom: '8px',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={passwordInput}
                    onChange={e => {
                      setPasswordInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 36px 8px 0',
                      borderRadius: '0',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #E5E7EB',
                      color: '#111827',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.currentTarget.style.borderBottomColor = '#111827')}
                    onBlur={e => (e.currentTarget.style.borderBottomColor = '#E5E7EB')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0',
                      bottom: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox & Forgot Password Link */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: '#6B7280',
                  marginBottom: '32px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{
                      width: '15px',
                      height: '15px',
                      accentColor: '#111827',
                      cursor: 'pointer',
                      borderRadius: '3px',
                    }}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Large Black Rounded Button */}
              <motion.button
                id="login-submit"
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                style={{
                  width: 'auto',
                  minWidth: '140px',
                  height: '44px',
                  padding: '0 26px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#111827',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'background 0.15s ease',
                  opacity: loading ? 0.75 : 1,
                  marginBottom: '18px',
                }}
                onMouseEnter={e => {
                  if (!loading) e.currentTarget.style.background = '#1F2937';
                }}
                onMouseLeave={e => {
                  if (!loading) e.currentTarget.style.background = '#111827';
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </motion.button>
            </form>

            {/* Subtle Informational Line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                color: '#9CA3AF',
                marginTop: '4px',
              }}
            >
              <Info size={13} style={{ flexShrink: 0, color: '#9CA3AF' }} />
              <span>Authorized personnel only.</span>
            </div>
          </div>

          {/* Bottom subtle copyright */}
          <div
            style={{
              fontSize: '11.5px',
              color: '#9CA3AF',
              marginTop: '24px',
            }}
          >
            &copy; 2026 PT Taka Hydrocore Indonesia &bull; Document Control
          </div>
        </div>

        {/* ── RIGHT SECTION: EXPANDED VESSEL PHOTO PANEL (NO OVERLAY TEXT) ── */}
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            height: '100%',
            minHeight: '460px',
            background: '#071C2C',
            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Pristine Vessel Photography (Clean, No Vessel Name Badge) */}
          <motion.img
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            src="/thi-vessel-geodrill.jpg"
            alt="Offshore Geotechnical Operations"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 45%',
              display: 'block',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
