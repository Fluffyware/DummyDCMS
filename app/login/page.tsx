'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DEMO_USERS } from '@/lib/mock-data';

const ROLES = [
  { key: 'admin', icon: '👑', name: 'Admin QHSE', desc: 'Otoritas penuh, approval manual dokumen & kontrol sistem QHSE' },
  { key: 'staff', icon: '👤', name: 'Staff',      desc: 'Akses Masterlist Dokumen Terkontrol & Pengajuan Saran & Ide' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    const user = Object.values(DEMO_USERS).find(u => u.role === selectedRole);
    if (!user) return;
    setLoading(true);
    setTimeout(() => {
      login(user.role as any, '', '');
      if (user.role === 'staff') {
        router.push('/dashboard/masterlist');
      } else {
        router.push('/dashboard');
      }
    }, 600);
  };

  const selected = ROLES.find(r => r.key === selectedRole);

  return (
    <div className="login-page">
      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="login-left-graphic" />
        <div className="login-left-graphic-2" />
        <div className="login-left-content">
          <div className="login-company-logo">🏭</div>
          <p className="login-tagline">PT Taka Hydrocore Indonesia</p>
          <h1 className="login-headline">
            QHSSE Document<br />Management System
          </h1>
          <p className="login-body">
            Centralized platform for quality, health, safety, security & environmental document control. Manage controlled documents from creation to archival with full traceability.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {[
              'Document lifecycle management',
              'Alur manual approval terverifikasi (Staff → Admin QHSE)',
              'Distribution & acknowledgement tracking',
              'Complete audit trail & compliance',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                  ✓
                </div>
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="login-form-wrap">
          <p className="login-tagline" style={{ color: 'var(--ink-faint)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-2)' }}>
            PT Taka Hydrocore Indonesia
          </p>
          <h2 className="login-form-title">Sign in</h2>
          <p className="login-form-sub">Select your role to continue with the demo system.</p>

          {/* Email/Password (decorative) */}
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              defaultValue="demo@thi.co.id"
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              defaultValue="demo1234"
              readOnly
            />
          </div>

          <div className="login-divider">Demo Mode — Select a role</div>

          {/* Role grid */}
          <div className="role-grid">
            {ROLES.map(role => (
              <div
                key={role.key}
                id={`role-${role.key}`}
                className={`role-card ${selectedRole === role.key ? 'active' : ''}`}
                onClick={() => setSelectedRole(role.key)}
              >
                <div className="role-card-icon">{role.icon}</div>
                <div className="role-card-name">{role.name}</div>
                <div className="role-card-desc">{role.desc}</div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="role-selected-preview">
              Signing in as: <strong>{selected.icon} {selected.name}</strong>
            </div>
          )}

          <button
            id="login-submit"
            className="btn btn-primary"
            style={{ width: '100%', height: 46, fontSize: 14, justifyContent: 'center' }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in to QHSSE DMS →'}
          </button>

          <p style={{ marginTop: 'var(--sp-5)', fontSize: 12, color: 'var(--ink-faint)', textAlign: 'center', lineHeight: 1.6 }}>
            This is a demonstration system.<br />
            No real data is stored or transmitted.
          </p>
        </div>
      </div>
    </div>
  );
}
