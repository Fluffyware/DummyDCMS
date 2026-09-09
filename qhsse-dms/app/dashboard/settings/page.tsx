'use client';

import { useState } from 'react';
import { Settings, FolderOpen, FileText, Building2, UserCheck, Shield, ChevronRight, Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

type SetupTab = 'folder-dokumen' | 'jenis-dokumen' | 'departemen' | 'user-approval' | 'standar-approval';

/* ── Data ─────────────────────────────────────────────────── */
const FOLDERS = [
  { id: 1, name: '1. Standar Sistem Manajemen', docs: 4, active: true },
  { id: 2, name: '2. Kebijakan', docs: 4, active: true },
  { id: 3, name: '3. Peraturan Direksi', docs: 3, active: true },
  { id: 4, name: '4. Proses Bisnis', docs: 3, active: true },
  { id: 5, name: '5. Manual Sistem Manajemen', docs: 2, active: true },
  { id: 6, name: '6. Corporate Planning & Evaluation', docs: 2, active: true },
  { id: 7, name: '7. QHSSE Management System', docs: 4, active: true },
  { id: 8, name: '8. Marketing & Sales', docs: 2, active: true },
  { id: 9, name: '9. Engineering', docs: 3, active: true },
  { id: 10, name: '10. Information Technology', docs: 2, active: true },
  { id: 11, name: '11. Logistic', docs: 2, active: true },
  { id: 12, name: '12. Project Management', docs: 2, active: true },
  { id: 13, name: '13. Human Capital', docs: 2, active: true },
  { id: 14, name: '14. General Affair', docs: 2, active: true },
  { id: 15, name: '15. Finance & Accounting', docs: 2, active: true },
];

const DOC_TYPES = [
  { id: 1, name: 'Standar Operasional Prosedur', prefix: 'SOP', active: true },
  { id: 2, name: 'Kebijakan (Policy)', prefix: 'POL', active: true },
  { id: 3, name: 'Manual', prefix: 'MAN', active: true },
  { id: 4, name: 'Instruksi Kerja (Work Instruction)', prefix: 'WI', active: true },
  { id: 5, name: 'Formulir (Form)', prefix: 'FRM', active: true },
  { id: 6, name: 'Prosedur', prefix: 'PRO', active: true },
  { id: 7, name: 'Template', prefix: 'TMP', active: true },
  { id: 8, name: 'Pedoman (Guideline)', prefix: 'GDL', active: false },
  { id: 9, name: 'Laporan (Report)', prefix: 'RPT', active: true },
];

const DEPARTMENTS = [
  { id: 1, name: 'QHSSE', code: 'QHSSE', manager: 'Citra Dewi', active: true },
  { id: 2, name: 'Geotechnical', code: 'GEO', manager: 'Ahmad Fauzi', active: true },
  { id: 3, name: 'Operations', code: 'OPS', manager: 'Bambang Nugroho', active: true },
  { id: 4, name: 'HR & General Affairs', code: 'HR', manager: 'Dian Pratama', active: true },
  { id: 5, name: 'Environment', code: 'ENV', manager: 'Fitri Handayani', active: true },
  { id: 6, name: 'Finance & Accounting', code: 'FIN', manager: 'Adi Kusuma', active: false },
  { id: 7, name: 'Engineering', code: 'ENG', manager: 'Rudi Santoso', active: true },
  { id: 8, name: 'Information Technology', code: 'IT', manager: 'Hendra Wijaya', active: true },
];

const USERS_APPROVAL = [
  { id: 1, name: 'Hendra Wijaya', dept: 'QHSSE', role: 'Admin Master', level: 1, active: true },
  { id: 2, name: 'Citra Dewi', dept: 'QHSSE', role: 'Admin Master', level: 1, active: true },
  { id: 3, name: 'Reza Firmansyah', dept: 'QHSSE', role: 'Staff', level: 0, active: true },
  { id: 4, name: 'Dimas Pratama', dept: 'Engineering', role: 'Staff', level: 0, active: true },
];

const APPROVAL_STANDARDS = [
  {
    id: 1,
    name: 'Alur Approval Manual 2-Tingkat',
    applies: 'Seluruh Jenis Dokumen',
    steps: ['Pengajuan Dokumen oleh Staff', 'Verifikasi & Review Admin Master', 'Upload Berkas TTD & Approval Resmi', 'Publikasi & Distribusi'],
    active: true,
  },
];

/* ── Shared row styles ─────────────────────────────────────── */
const ROW = {
  display: 'flex',
  alignItems: 'center',
  padding: '11px 16px',
  borderBottom: '1px solid #f1f5f9',
  transition: 'background 0.12s ease',
  gap: '12px',
} as const;

const BTN_EDIT = {
  background: 'transparent',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '4px 10px',
  fontSize: '11.5px',
  fontWeight: 600,
  color: '#334155',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  transition: 'all 0.15s ease',
} as const;

const BADGE_ACTIVE = {
  fontSize: '10.5px',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '20px',
  background: '#f0f9ff',
  color: '#0369a1',
  border: '1px solid #bae6fd',
} as const;

const BADGE_INACTIVE = {
  fontSize: '10.5px',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '20px',
  background: '#f8fafc',
  color: '#94a3b8',
  border: '1px solid #e2e8f0',
} as const;

/* ── Setup tab config ──────────────────────────────────────── */
const TABS: { id: SetupTab; label: string; icon: React.ReactNode; count?: number }[] = [
  { id: 'folder-dokumen',   label: 'Folder Dokumen',  icon: <FolderOpen size={15} strokeWidth={1.75} />, count: 15 },
  { id: 'jenis-dokumen',    label: 'Jenis Dokumen',   icon: <FileText size={15} strokeWidth={1.75} />, count: 9 },
  { id: 'departemen',       label: 'Departemen',      icon: <Building2 size={15} strokeWidth={1.75} />, count: 8 },
  { id: 'user-approval',    label: 'User Approval',   icon: <UserCheck size={15} strokeWidth={1.75} />, count: 4 },
  { id: 'standar-approval', label: 'Standar Approval',icon: <Shield size={15} strokeWidth={1.75} />, count: 1 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SetupTab>('folder-dokumen');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #e8eef5', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: '#0369a1',
            background: '#f0f9ff', border: '1px solid #e0f2fe',
            padding: '2px 8px', borderRadius: '6px',
          }}>
            Administration
          </span>
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: '#071c2c', letterSpacing: '-0.02em' }}>
          Setup Master
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          Kelola folder dokumen, jenis dokumen, departemen, pengguna, dan konfigurasi alur approval sistem.
        </p>
      </div>

      {/* ── Two-column layout: sidebar nav + content ─────────── */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }} className="grid-split-2">

        {/* ── LEFT: Vertical Tab Navigation ─────────────────── */}
        <div style={{
          width: 'min(100%, 220px)',
          flexShrink: 0,
          background: '#ffffff',
          border: '1px solid #e8eef5',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 14px 6px',
            fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#94a3b8',
            borderBottom: '1px solid #f1f5f9',
          }}>
            Konfigurasi
          </div>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #071c2c' : '3px solid transparent',
                  background: isActive ? '#f8fafc' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: isActive ? '#071c2c' : '#8fa0b0', flexShrink: 0 }}>{tab.icon}</span>
                <span style={{ flex: 1, fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? '#071c2c' : '#475569' }}>
                  {tab.label}
                </span>
                {tab.count !== undefined && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    padding: '1px 6px', borderRadius: '10px',
                    background: isActive ? '#e0f2fe' : '#f1f5f9',
                    color: isActive ? '#0369a1' : '#94a3b8',
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── RIGHT: Content Panel ────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── FOLDER DOKUMEN ─────────────────────────────── */}
          {activeTab === 'folder-dokumen' && (
            <div>
              <SectionHeader
                title="Folder Dokumen"
                description="Struktur 15 folder induk penyimpanan dokumen terkendali PT Taka Hydrocore Indonesia."
                action={<AddButton label="Tambah Folder" id="add-folder" />}
              />
              <div style={{ background: '#ffffff', border: '1px solid #e8eef5', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0 }}>
                  <TableHead cols={['Nama Folder', 'Jumlah Dok', 'Status', '']} />
                </div>
                {FOLDERS.map((f, i) => (
                  <div
                    key={f.id}
                    style={{ ...ROW, borderTop: i === 0 ? '1px solid #e8eef5' : undefined }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <FolderOpen size={15} strokeWidth={1.75} color={f.active ? '#0284c7' : '#94a3b8'} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: f.active ? '#1e293b' : '#94a3b8' }}>{f.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b', width: '90px', textAlign: 'center' }}>
                      {f.docs} dokumen
                    </span>
                    <span style={{ width: '80px', textAlign: 'center' }}>
                      <span style={f.active ? BADGE_ACTIVE : BADGE_INACTIVE}>{f.active ? 'Aktif' : 'Nonaktif'}</span>
                    </span>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', width: '80px' }}>
                      <button
                        id={`edit-folder-${f.id}`}
                        style={BTN_EDIT}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.color = '#0284c7'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                      >
                        <Edit2 size={11} />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── JENIS DOKUMEN ──────────────────────────────── */}
          {activeTab === 'jenis-dokumen' && (
            <div>
              <SectionHeader
                title="Jenis Dokumen"
                description="Tipe-tipe dokumen yang digunakan dalam sistem kendali dokumen. Setiap jenis memiliki awalan (prefix) penomoran unik."
                action={<AddButton label="Tambah Jenis" id="add-doc-type" />}
              />
              <div style={{ background: '#ffffff', border: '1px solid #e8eef5', borderRadius: '10px', overflow: 'hidden' }}>
                {DOC_TYPES.map((t, i) => (
                  <div
                    key={t.id}
                    style={{ ...ROW, borderTop: i === 0 ? '1px solid #e8eef5' : undefined }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <FileText size={14} strokeWidth={1.75} color={t.active ? '#0284c7' : '#94a3b8'} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: t.active ? '#1e293b' : '#94a3b8' }}>{t.name}</span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11.5px', fontWeight: 700,
                      color: '#071c2c', background: '#f1f5f9',
                      padding: '2px 8px', borderRadius: '4px',
                      letterSpacing: '0.04em', width: '60px', textAlign: 'center',
                    }}>
                      {t.prefix}
                    </span>
                    <span style={{ width: '80px', textAlign: 'center' }}>
                      <span style={t.active ? BADGE_ACTIVE : BADGE_INACTIVE}>{t.active ? 'Aktif' : 'Nonaktif'}</span>
                    </span>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', width: '80px' }}>
                      <button
                        id={`edit-type-${t.id}`}
                        style={BTN_EDIT}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.color = '#0284c7'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                      >
                        <Edit2 size={11} />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DEPARTEMEN ─────────────────────────────────── */}
          {activeTab === 'departemen' && (
            <div>
              <SectionHeader
                title="Departemen"
                description="Daftar departemen dan unit kerja yang terdaftar dalam sistem manajemen dokumen perusahaan."
                action={<AddButton label="Tambah Departemen" id="add-department" />}
              />
              <div style={{ background: '#ffffff', border: '1px solid #e8eef5', borderRadius: '10px', overflow: 'hidden' }}>
                {DEPARTMENTS.map((d, i) => (
                  <div
                    key={d.id}
                    style={{ ...ROW, borderTop: i === 0 ? '1px solid #e8eef5' : undefined }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Building2 size={14} strokeWidth={1.75} color={d.active ? '#0369a1' : '#94a3b8'} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: d.active ? '#1e293b' : '#94a3b8' }}>{d.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>PIC: {d.manager}</div>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11px', fontWeight: 700,
                      color: '#071c2c', background: '#f1f5f9',
                      padding: '2px 8px', borderRadius: '4px',
                      letterSpacing: '0.04em', width: '70px', textAlign: 'center',
                    }}>
                      {d.code}
                    </span>
                    <span style={{ width: '80px', textAlign: 'center' }}>
                      <span style={d.active ? BADGE_ACTIVE : BADGE_INACTIVE}>{d.active ? 'Aktif' : 'Nonaktif'}</span>
                    </span>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', width: '80px' }}>
                      <button
                        id={`edit-dept-${d.id}`}
                        style={BTN_EDIT}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.color = '#0284c7'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                      >
                        <Edit2 size={11} />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USER APPROVAL ──────────────────────────────── */}
          {activeTab === 'user-approval' && (
            <div>
              <SectionHeader
                title="User Approval"
                description="Daftar pengguna yang memiliki otoritas persetujuan dokumen dalam alur approval sistem."
                action={<AddButton label="Tambah User" id="add-user-approval" />}
              />
              <div style={{ background: '#ffffff', border: '1px solid #e8eef5', borderRadius: '10px', overflow: 'hidden' }}>
                {USERS_APPROVAL.map((u, i) => (
                  <div
                    key={u.id}
                    style={{ ...ROW, borderTop: i === 0 ? '1px solid #e8eef5' : undefined }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '8px',
                      background: u.level === 1 ? '#071c2c' : '#f1f5f9',
                      color: u.level === 1 ? '#ffffff' : '#475569',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, flexShrink: 0,
                      letterSpacing: '0.04em',
                    }}>
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{u.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>{u.dept}</div>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600,
                      color: u.role === 'Admin Master' ? '#0369a1' : '#64748b',
                      background: u.role === 'Admin Master' ? '#f0f9ff' : '#f8fafc',
                      border: `1px solid ${u.role === 'Admin Master' ? '#bae6fd' : '#e2e8f0'}`,
                      padding: '2px 8px', borderRadius: '6px',
                    }}>
                      {u.role}
                    </span>
                    <span style={{ width: '80px', textAlign: 'center' }}>
                      <span style={u.active ? BADGE_ACTIVE : BADGE_INACTIVE}>{u.active ? 'Aktif' : 'Nonaktif'}</span>
                    </span>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', width: '80px' }}>
                      <button
                        id={`edit-user-${u.id}`}
                        style={BTN_EDIT}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.color = '#0284c7'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                      >
                        <Edit2 size={11} />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STANDAR APPROVAL ───────────────────────────── */}
          {activeTab === 'standar-approval' && (
            <div>
              <SectionHeader
                title="Standar Approval"
                description="Konfigurasi alur dan tingkat persetujuan yang berlaku untuk seluruh dokumen terkendali."
                action={<AddButton label="Tambah Alur" id="add-workflow" />}
              />
              {APPROVAL_STANDARDS.map(w => (
                <div
                  key={w.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e8eef5',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '12px',
                  }}
                >
                  {/* Header row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderBottom: '1px solid #f1f5f9',
                    background: '#fafbfc',
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#071c2c', marginBottom: '2px' }}>{w.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Berlaku untuk: {w.applies}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={w.active ? BADGE_ACTIVE : BADGE_INACTIVE}>{w.active ? 'Aktif' : 'Nonaktif'}</span>
                      <button
                        id={`edit-workflow-${w.id}`}
                        style={BTN_EDIT}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.color = '#0284c7'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                      >
                        <Edit2 size={11} />
                        Edit Alur
                      </button>
                    </div>
                  </div>

                  {/* Steps */}
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: '12px' }}>
                      Alur Proses
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', rowGap: '8px' }}>
                      {w.steps.map((step, si) => (
                        <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 14px',
                            background: si === 0 ? '#f0f9ff' : si === w.steps.length - 1 ? '#f0fdf4' : '#f8fafc',
                            border: `1px solid ${si === 0 ? '#bae6fd' : si === w.steps.length - 1 ? '#bbf7d0' : '#e2e8f0'}`,
                            borderRadius: '7px',
                            fontSize: '12px', fontWeight: 600,
                            color: si === 0 ? '#0369a1' : si === w.steps.length - 1 ? '#15803d' : '#334155',
                          }}>
                            <span style={{
                              width: '18px', height: '18px', borderRadius: '50%',
                              background: si === 0 ? '#0369a1' : si === w.steps.length - 1 ? '#15803d' : '#e2e8f0',
                              color: si === 0 || si === w.steps.length - 1 ? '#ffffff' : '#64748b',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '10px', fontWeight: 800, flexShrink: 0,
                            }}>
                              {si + 1}
                            </span>
                            {step}
                          </div>
                          {si < w.steps.length - 1 && (
                            <ChevronRight size={14} color="#94a3b8" style={{ margin: '0 4px', flexShrink: 0 }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Document numbering info */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e8eef5',
                borderRadius: '10px',
                overflow: 'hidden',
                marginTop: '16px',
              }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#071c2c', marginBottom: '2px' }}>Format Penomoran Dokumen</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Sistem penomoran otomatis yang diterapkan pada semua dokumen terdaftar.</div>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono, monospace)', fontSize: '16px', fontWeight: 700,
                    color: '#071c2c', textAlign: 'center',
                    padding: '12px', background: '#f8fafc', borderRadius: '8px',
                    border: '1px solid #e2e8f0', marginBottom: '16px',
                    letterSpacing: '0.06em',
                  }}>
                    [TYPE] - [DEPT] - [SEQ]
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Type Prefix', desc: 'Otomatis dari Jenis Dokumen', example: 'SOP, WI, POL, FRM' },
                      { label: 'Kode Departemen', desc: 'Otomatis dari Departemen', example: 'GEO, OPS, QHSSE, HR' },
                      { label: 'Nomor Urut', desc: 'Auto-increment (sistem)', example: '001, 002, 003...' },
                      { label: 'Separator', desc: 'Tanda hubung (-)', example: 'SOP-GEO-001' },
                    ].map(f => (
                      <div key={f.label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px',
                        background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9',
                      }}>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>{f.label}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px', fontFamily: 'var(--font-mono, monospace)' }}>
                            contoh: {f.example}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 500, textAlign: 'right', maxWidth: '180px' }}>
                          {f.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: '12px', padding: '10px 14px',
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: '7px', fontSize: '12px', color: '#92400e',
                  }}>
                    Nomor dokumen dikelola sepenuhnya oleh sistem. Staff tidak dapat memilih nomor dokumen secara manual.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── Shared Sub-components ─────────────────────────────────── */
function SectionHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: '14px', gap: '16px',
    }}>
      <div>
        <h2 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: 700, color: '#071c2c' }}>{title}</h2>
        <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>{description}</p>
      </div>
      {action}
    </div>
  );
}

function AddButton({ label, id }: { label: string; id: string }) {
  return (
    <button
      id={id}
      style={{
        background: '#071c2c', color: '#ffffff',
        border: 'none', borderRadius: '8px',
        padding: '8px 16px', fontSize: '12.5px', fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
        whiteSpace: 'nowrap', flexShrink: 0,
        boxShadow: '0 1px 3px rgba(7,28,44,0.14)',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#0d2d47')}
      onMouseLeave={e => (e.currentTarget.style.background = '#071c2c')}
    >
      <Plus size={13} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function TableHead({ cols }: { cols: string[] }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '8px 16px', gap: '12px',
      borderBottom: '1px solid #e8eef5',
      background: '#f8fafc',
    }}>
      {cols.map((c, i) => (
        <div key={i} style={{
          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: '#94a3b8',
          flex: i === 0 ? 1 : undefined,
        }}>
          {c}
        </div>
      ))}
    </div>
  );
}
