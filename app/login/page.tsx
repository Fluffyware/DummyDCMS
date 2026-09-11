'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ALL_USERS, UserProfile } from '@/lib/mock-data';

export default function LoginPage() {
  const { loginAsUser } = useAuth();
  const router = useRouter();

  // Category tab: 'admin' | 'staff'
  const [accountType, setAccountType] = useState<'admin' | 'staff'>('admin');
  const [selectedUserId, setSelectedUserId] = useState<string>('admin-rizal');
  const [loading, setLoading] = useState(false);

  const adminUsers = ALL_USERS.filter(u => u.role === 'admin');
  const staffUsers = ALL_USERS.filter(u => u.role === 'staff');

  const selectedUser = ALL_USERS.find(u => u.id === selectedUserId) || ALL_USERS[0];

  const handleSelectAccount = (user: UserProfile) => {
    setSelectedUserId(user.id);
  };

  const handleSwitchTab = (type: 'admin' | 'staff') => {
    setAccountType(type);
    if (type === 'admin') {
      setSelectedUserId('admin-rizal');
    } else {
      setSelectedUserId('staff-geo');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    await loginAsUser(selectedUserId);
    router.push('/dashboard');
  };

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
            Centralized platform for quality, health, safety, security &amp; environmental document control. Manage controlled documents from creation to archival with full traceability.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {[
              'Document lifecycle management',
              'Alur terverifikasi: Admin QMS (Rizal & Khabil) & PIC Departemen',
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
        <div className="login-form-wrap" style={{ maxWidth: '480px' }}>
          <p className="login-tagline" style={{ color: 'var(--ink-faint)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--sp-2)' }}>
            PT Taka Hydrocore Indonesia
          </p>
          <h2 className="login-form-title">Sign in</h2>
          <p className="login-form-sub">Pilih akun untuk masuk ke portal QHSSE DMS.</p>

          {/* Email/Password Fields (Auto-filled by selection) */}
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              value={selectedUser.email}
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              value="••••••••••••"
              readOnly
            />
          </div>

          <div className="login-divider">Pilih Akun Pengguna</div>

          {/* Account Type Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', marginBottom: '14px', gap: '3px' }}>
            <button
              type="button"
              onClick={() => handleSwitchTab('admin')}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: accountType === 'admin' ? 700 : 500,
                background: accountType === 'admin' ? '#ffffff' : 'transparent',
                color: accountType === 'admin' ? '#071c2c' : '#64748b',
                boxShadow: accountType === 'admin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              👑 Admin QMS (2 Akun)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('staff')}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: accountType === 'staff' ? 700 : 500,
                background: accountType === 'staff' ? '#ffffff' : 'transparent',
                color: accountType === 'staff' ? '#071c2c' : '#64748b',
                boxShadow: accountType === 'staff' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🏢 Akun Tiap Dept ({staffUsers.length})
            </button>
          </div>

          {/* Accounts List */}
          {accountType === 'admin' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {adminUsers.map(user => {
                const isActive = selectedUserId === user.id;
                return (
                  <div
                    key={user.id}
                    id={`account-${user.id}`}
                    onClick={() => handleSelectAccount(user)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isActive ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isActive ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: isActive ? '#0284c7' : '#071c2c',
                        color: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 800,
                      }}>
                        {user.avatar}
                      </div>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
                        Admin QMS
                      </span>
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#071c2c' }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{user.position}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              maxHeight: '220px',
              overflowY: 'auto',
              marginBottom: '14px',
              paddingRight: '4px',
            }}>
              {staffUsers.map(user => {
                const isActive = selectedUserId === user.id;
                return (
                  <div
                    key={user.id}
                    id={`account-${user.id}`}
                    onClick={() => handleSelectAccount(user)}
                    style={{
                      padding: '9px 11px',
                      borderRadius: '8px',
                      border: isActive ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isActive ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '5px',
                        background: isActive ? '#0284c7' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#334155',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700, flexShrink: 0,
                      }}>
                        {user.avatar}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#071c2c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.department}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                          1 Akun Staff
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Preview */}
          <div className="role-selected-preview" style={{ marginBottom: '14px' }}>
            Signing in as: <strong>{selectedUser.name}</strong> ({selectedUser.department} &bull; {selectedUser.roleName})
          </div>

          <button
            id="login-submit"
            className="btn btn-primary"
            style={{ width: '100%', height: 46, fontSize: 14, justifyContent: 'center' }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in…' : `Sign in as ${selectedUser.name} →`}
          </button>

          <p style={{ marginTop: 'var(--sp-4)', fontSize: 12, color: 'var(--ink-faint)', textAlign: 'center', lineHeight: 1.6 }}>
            Demo Sistem QHSSE DMS &bull; 2 Akun Admin QMS (Rizal &amp; Khabil) + 1 Akun Tiap Dept
          </p>
        </div>
      </div>
    </div>
  );
}
