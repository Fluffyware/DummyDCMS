'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { loginWithCredentials } = useAuth();
  const router = useRouter();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Silakan isi username dan password Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await loginWithCredentials(usernameInput, passwordInput);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setErrorMessage(res.error || 'Username atau password salah.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page" suppressHydrationWarning>
      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="login-left-graphic" />
        <div className="login-left-graphic-2" />
        <div className="login-left-content">
          <div className="login-company-logo">🏭</div>
          <p className="login-tagline">PT Taka Hydrocore Indonesia</p>
          <h1 className="login-headline">
            QHSSE Document<br />Control &amp; Management System
          </h1>
          <p className="login-body">
            Sistem terpusat pengendalian dokumen Quality, Health, Safety, Security &amp; Environmental. Mengelola dokumen terkendali mulai dari registrasi, peninjauan, hingga distribusi resmi secara aman dan terintegrasi.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {[
              'Siklus hidup dokumen terkendali & terstruktur',
              'Akses terverifikasi berbasis divisi & otorisasi resmi',
              'Pelacakan distribusi & konfirmasi tanda terima dokumen',
              'Jejak audit menyeluruh sesuai standar ISO 9001 & SMK3',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                  ✓
                </div>
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="login-form-wrap" style={{ maxWidth: '420px', width: '100%' }}>
          <p className="login-tagline" style={{ color: 'var(--ink-faint)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-2)' }}>
            PT TAKA HYDROCORE INDONESIA
          </p>
          <h2 className="login-form-title">Sign in</h2>
          <p className="login-form-sub">Masukkan username &amp; password akun Anda untuk mengakses sistem.</p>

          <form onSubmit={handleLogin}>
            {errorMessage && (
              <div style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="login-username" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-username"
                  className="form-input"
                  type="text"
                  required
                  autoComplete="username"
                  value={usernameInput}
                  onChange={e => {
                    setUsernameInput(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Masukkan username Anda"
                  style={{
                    paddingLeft: '38px',
                    height: '46px',
                    fontSize: '14px',
                    borderRadius: '8px',
                  }}
                />
                <User
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" htmlFor="login-password" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Masukkan password Anda"
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '40px',
                    height: '46px',
                    fontSize: '14px',
                    borderRadius: '8px',
                  }}
                />
                <Lock
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                height: 46,
                fontSize: 14.5,
                fontWeight: 600,
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '8px',
              }}
              disabled={loading}
            >
              {loading ? (
                'Memverifikasi...'
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 'var(--sp-6)',
            paddingTop: 'var(--sp-4)',
            borderTop: '1px solid #f1f5f9',
            fontSize: 11.5,
            color: '#94a3b8',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            Akses sistem terbatas untuk personel PT Taka Hydrocore Indonesia yang terotorisasi.
          </div>
        </div>
      </div>
    </div>
  );
}
