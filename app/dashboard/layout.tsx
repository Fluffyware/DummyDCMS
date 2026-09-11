'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DEMO_USERS } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FlaskConical,
  FileText,
  FilePlus,
  CheckSquare,
  Share2,
  ShieldCheck,
  Settings,
  Bell,
  ChevronRight,
  Lightbulb,
  Briefcase,
  Menu,
  X,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────── */
interface NavItemDef {
  href: string;
  key: string;
  label: string;
  badge?: number | string;
  badgeType?: 'alert' | 'info';
  section: 'core' | 'docs' | 'governance';
  icon: React.ReactNode;
}

/* ─── Nav data ────────────────────────────────────────────────── */
const ALL_NAV: Record<string, NavItemDef> = {
  dashboard:     { href: '/dashboard',              key: 'dashboard',     label: 'Dashboard',       section: 'core',       icon: <LayoutDashboard size={16} strokeWidth={1.75} /> },
  concepts:      { href: '/dashboard/concepts',     key: 'concepts',      label: 'Management System', section: 'core', icon: <Briefcase size={16} strokeWidth={1.75} /> },
  masterlist:    { href: '/dashboard/masterlist',   key: 'masterlist',    label: 'Masterlist Documents', section: 'docs',       icon: <FileText size={16} strokeWidth={1.75} /> },
  registration:  { href: '/dashboard/registration', key: 'registration',  label: 'Registrasi Dokumen',   section: 'docs',       icon: <FilePlus size={16} strokeWidth={1.75} /> },
  distribution:  { href: '/dashboard/distribution', key: 'distribution',  label: 'Distribusi Dokumen',   section: 'docs',       icon: <Share2 size={16} strokeWidth={1.75} /> },
  approval:      { href: '/dashboard/approval',     key: 'approval',      label: 'Approval Queue',       section: 'docs',       icon: <CheckSquare size={16} strokeWidth={1.75} />,    badge: 3, badgeType: 'alert' },
  suggestions:   { href: '/dashboard/suggestions',  key: 'suggestions',   label: 'Saran & Ide',          section: 'docs',       icon: <Lightbulb size={16} strokeWidth={1.75} /> },
  settings:      { href: '/dashboard/settings',     key: 'settings',      label: 'System Settings',      section: 'governance', icon: <Settings size={16} strokeWidth={1.75} /> },
};

const ROLE_NAV: Record<string, string[]> = {
  staff: ['masterlist', 'suggestions'],
  admin: ['dashboard', 'concepts', 'masterlist', 'distribution', 'suggestions', 'settings'],
};

const SECTIONS: { id: 'core' | 'docs' | 'governance'; title: string }[] = [
  { id: 'core',       title: 'Core' },
  { id: 'docs',       title: 'Documents' },
  { id: 'governance', title: 'Governance' },
];

const ROLE_LABELS: Record<string, string> = {
  staff: 'Staff',
  admin: 'Admin QHSE',
};

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':              'Dashboard',
  '/dashboard/concepts':     'Management System',
  '/dashboard/masterlist':   'Controlled Masterlist',
  '/dashboard/registration': 'Registrasi Dokumen',
  '/dashboard/distribution': 'Distribusi Dokumen',
  '/dashboard/approval':     'Approval Queue',
  '/dashboard/suggestions':  'Saran & Ide Perbaikan',
  '/dashboard/settings':     'System Configuration',
};

const EXPANDED_W = 240;
const COLLAPSED_W = 60;
const TRANSITION = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] };

/* ─── Main Layout ─────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    Object.values(ALL_NAV).forEach(item => {
      router.prefetch(item.href);
    });
  }, [router]);

  const activeUser = user || DEMO_USERS.admin;

  const navKeys  = ROLE_NAV[activeUser.role] || ROLE_NAV.admin;
  const navItems = navKeys.map(k => ALL_NAV[k]).filter(Boolean);

  useEffect(() => {
    if (activeUser.role === 'staff') {
      const allowedHrefs = ROLE_NAV.staff.map(k => ALL_NAV[k]?.href).filter(Boolean);
      if (!allowedHrefs.includes(pathname)) {
        router.replace('/dashboard/masterlist');
      }
    }
  }, [activeUser.role, pathname, router]);
  const currentTitle = PAGE_TITLES[pathname] || 'Dashboard';
  const initials = activeUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  // Shared fade animate — text fades in/out in sync with width
  const labelAnimate = {
    opacity:   collapsed ? 0 : 1,
    width:     collapsed ? 0 : 'auto',
    marginLeft: collapsed ? 0 : undefined,
  };

  const renderSidebarContent = (isDrawer = false) => (
    <>
      {/* ── Brand ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: `0 ${!isDrawer && collapsed ? 12 : 16}px`,
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f4f8',
        height: 60,
        flexShrink: 0,
      }}>
        <img
          src="/thi-logo-official.png"
          alt="PT Taka Hydrocore Indonesia"
          style={{
            height: !isDrawer && collapsed ? 22 : 28,
            width: 'auto',
            maxWidth: !isDrawer && collapsed ? 36 : 170,
            objectFit: 'contain',
            objectPosition: 'left center',
            display: 'block',
          }}
        />
        {isDrawer && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px' }}>
        {SECTIONS.map(sec => {
          const items = navItems.filter(i => i.section === sec.id);
          if (items.length === 0) return null;
          const isCollapsedNow = !isDrawer && collapsed;
          return (
            <div key={sec.id} style={{ marginBottom: 2 }}>
              {/* Section label */}
              <motion.div
                animate={{ opacity: isCollapsedNow ? 0 : 1, height: isCollapsedNow ? 0 : 'auto' }}
                transition={TRANSITION}
                style={{
                  overflow: 'hidden',
                  fontSize: 9.5, fontWeight: 700,
                  letterSpacing: '0.12em', color: '#b0bec9',
                  padding: isCollapsedNow ? '0 10px' : '10px 10px 4px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {sec.title}
              </motion.div>

              {/* Collapsed divider */}
              {isCollapsedNow && (
                <div style={{ height: 1, background: '#f0f4f8', margin: '6px 8px 4px' }} />
              )}

              {items.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      if (isDrawer) setMobileOpen(false);
                    }}
                    title={item.label}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0,
                      padding: isCollapsedNow ? '8px 0' : '8px 10px',
                      height: isCollapsedNow ? 40 : 'auto',
                      minHeight: 40,
                      justifyContent: isCollapsedNow ? 'center' : 'flex-start',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      background: isActive ? '#f0f4f8' : 'transparent',
                      color: isActive ? '#071c2c' : '#6b7a8d',
                      fontFamily: 'var(--font-body)',
                      transition: 'background 0.15s, color 0.15s',
                      position: 'relative',
                      outline: 'none',
                      marginBottom: 1,
                      textDecoration: 'none',
                    }}
                  >
                    {isActive && (
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: 20,
                        borderRadius: '0 3px 3px 0',
                        background: '#071c2c',
                      }} />
                    )}

                    <span style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, flexShrink: 0,
                      color: isActive ? '#071c2c' : '#8fa0b0',
                    }}>
                      {item.icon}
                    </span>

                    {(!isCollapsedNow || isDrawer) && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={TRANSITION}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                          flex: 1,
                          minWidth: 0,
                          marginLeft: 8,
                        }}
                      >
                        <span
                          title={item.label}
                          style={{
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? '#071c2c' : '#4a5568',
                            whiteSpace: 'normal',
                            lineHeight: 1.35,
                            textAlign: 'left',
                          }}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span style={{
                            marginLeft: 8,
                            fontSize: 10, fontWeight: 700,
                            padding: '1px 6px', borderRadius: 99,
                            background: item.badgeType === 'alert' ? '#fef2f2' : '#eff6ff',
                            color: item.badgeType === 'alert' ? '#dc2626' : '#2563eb',
                            border: `1px solid ${item.badgeType === 'alert' ? '#fecaca' : '#bfdbfe'}`,
                            flexShrink: 0,
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </motion.span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc', fontFamily: 'var(--font-body)' }}>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP SIDEBAR WRAPPER
          ═══════════════════════════════════════════════════════ */}
      {!isMobile && (
        <div style={{ position: 'relative', flexShrink: 0, zIndex: 20 }}>
          <motion.aside
            animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
            transition={TRANSITION}
            style={{
              height: '100vh',
              overflow: 'hidden',
              background: '#ffffff',
              borderRight: '1px solid #e8eef5',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {renderSidebarContent(false)}
          </motion.aside>

          {/* Toggle button */}
          <motion.button
            animate={{ left: collapsed ? COLLAPSED_W - 12 : EXPANDED_W - 12 }}
            transition={TRANSITION}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              position: 'absolute',
              top: 18,
              width: 24, height: 24,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #dce6ee',
              boxShadow: '0 1px 5px rgba(7,28,44,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 30,
              outline: 'none',
              color: '#6b7a8d',
              padding: 0,
            }}
            whileHover={{ boxShadow: '0 2px 10px rgba(7,28,44,0.18)', background: '#f8fafc' }}
          >
            <motion.span
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={TRANSITION}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={12} strokeWidth={2.5} />
            </motion.span>
          </motion.button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MOBILE SIDEBAR DRAWER & BACKDROP
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(7, 28, 44, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 9998,
              }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                width: 260,
                background: '#ffffff',
                zIndex: 9999,
                boxShadow: '4px 0 24px rgba(7, 28, 44, 0.2)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          MAIN AREA
          ═══════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '0 12px' : '0 24px',
          gap: isMobile ? 8 : 16,
          background: 'linear-gradient(90deg, #071c2c 0%, #0c273d 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.16)',
          flexShrink: 0,
        }}>
          {/* Mobile Menu Hamburger Button */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.18)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
              title="Open Navigation Menu"
            >
              <Menu size={18} strokeWidth={2} />
            </button>
          )}

          {/* Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
              {currentTitle}
            </span>
          </div>

          {/* Search (Desktop / Tablet) */}
          {!isMobile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 8,
              padding: '7px 12px',
              width: 'max(220px, 22vw)',
              flexShrink: 1,
              transition: 'all 0.15s',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="global-search"
                type="text"
                placeholder="Search documents, SOP…"
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 12.5, color: '#ffffff', width: '100%',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, flexShrink: 0 }}>
            {/* Topbar quick switch role */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              padding: '2px',
            }}>
              <button
                type="button"
                onClick={() => login('admin', '', '')}
                style={{
                  padding: isMobile ? '3px 7px' : '4px 11px',
                  fontSize: isMobile ? '10px' : '11px',
                  fontWeight: activeUser.role === 'admin' ? 800 : 600,
                  borderRadius: 6,
                  border: 'none',
                  background: activeUser.role === 'admin' ? '#ffffff' : 'transparent',
                  color: activeUser.role === 'admin' ? '#071c2c' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: activeUser.role === 'admin' ? '0 1px 4px rgba(0, 0, 0, 0.2)' : 'none',
                  transition: 'all 0.15s',
                }}
                title="Mode Admin QHSE (Otoritas Manual Approval)"
              >
                <span>{isMobile ? 'Admin' : 'Admin QHSE'}</span>
              </button>
              <button
                type="button"
                onClick={() => login('staff', '', '')}
                style={{
                  padding: isMobile ? '3px 7px' : '4px 11px',
                  fontSize: isMobile ? '10px' : '11px',
                  fontWeight: activeUser.role === 'staff' ? 800 : 600,
                  borderRadius: 6,
                  border: 'none',
                  background: activeUser.role === 'staff' ? '#ffffff' : 'transparent',
                  color: activeUser.role === 'staff' ? '#071c2c' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: activeUser.role === 'staff' ? '0 1px 4px rgba(0, 0, 0, 0.2)' : 'none',
                  transition: 'all 0.15s',
                }}
                title="Mode Staff (Input & Registrasi Dokumen)"
              >
                <span>Staff</span>
              </button>
            </div>
            <button
              id="notif-btn"
              onClick={() => setNotifOpen(o => !o)}
              title="Notifications"
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.16)',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#ffffff', position: 'relative',
                transition: 'all 0.15s', outline: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
            >
              <Bell size={15} strokeWidth={2} />
              <span style={{
                position: 'absolute', top: 9, right: 9,
                width: 6, height: 6, borderRadius: '50%',
                background: '#ef4444', border: '1.5px solid #071c2c',
              }} />
            </button>

            <button
              onClick={logout}
              title={`${activeUser.name} (${ROLE_LABELS[activeUser.role]}) — Click to sign out`}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.22)',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 11.5, fontWeight: 800, color: '#ffffff',
                letterSpacing: '0.05em', fontFamily: 'var(--font-display)',
                outline: 'none', transition: 'all 0.15s',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.6)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 6px rgba(2, 132, 199, 0.3)')}
            >
              {initials}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════
          NOTIFICATION PANEL
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'fixed', top: 64, right: 20, zIndex: 9000,
                background: '#ffffff', border: '1px solid #e8eef5',
                borderRadius: 12, boxShadow: '0 12px 40px rgba(7,28,44,0.12)',
                width: 340, overflow: 'hidden', fontFamily: 'var(--font-body)',
              }}
            >
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid #f0f4f8',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#071c2c' }}>
                  Notifications
                </span>
                <span style={{ fontSize: 11, color: '#8fa0b0', fontWeight: 500 }}>3 unread</span>
              </div>
              {[
                { icon: '✍', text: 'Document SOP-OPS-004 awaiting your approval', time: '2h ago', unread: true },
                { icon: '📤', text: 'WI-GEO-005 distributed — 4 recipients pending', time: '5h ago', unread: true },
                { icon: '✅', text: 'POL-QHSE-001 approved by QHSSE Manager', time: 'Yesterday', unread: false },
              ].map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 16px',
                    borderBottom: '1px solid #f0f4f8',
                    background: n.unread ? '#fafcff' : 'transparent',
                    cursor: 'pointer', transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = n.unread ? '#fafcff' : 'transparent')}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, background: '#f0f4f8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, flexShrink: 0,
                  }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: '#15212a', lineHeight: 1.4, marginBottom: 3 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: '#8fa0b0' }}>{n.time}</div>
                  </div>
                  {n.unread && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#071c2c', flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              ))}
              <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                <button
                  onClick={() => setNotifOpen(false)}
                  style={{ fontSize: 12, color: '#6b7a8d', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  View all notifications
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 8999 }}
              onClick={() => setNotifOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
