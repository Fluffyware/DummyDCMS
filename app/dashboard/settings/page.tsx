'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  FolderOpen,
  Folder,
  FolderPlus,
  FileText,
  Building2,
  UserCheck,
  Shield,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  CornerDownRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  MasterFolder,
  MasterSubFolder,
  loadMasterFolders,
  saveMasterFolders,
} from '@/lib/masterlist-data';

type SetupTab = 'folder-dokumen' | 'jenis-dokumen' | 'departemen' | 'user-approval' | 'standar-approval';

/* ── Data ─────────────────────────────────────────────────── */
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
  { id: 'folder-dokumen',   label: 'Folder Dokumen',  icon: <FolderOpen size={15} strokeWidth={1.75} /> },
  { id: 'jenis-dokumen',    label: 'Jenis Dokumen',   icon: <FileText size={15} strokeWidth={1.75} />, count: 9 },
  { id: 'departemen',       label: 'Departemen',      icon: <Building2 size={15} strokeWidth={1.75} />, count: 8 },
  { id: 'user-approval',    label: 'User Approval',   icon: <UserCheck size={15} strokeWidth={1.75} />, count: 4 },
  { id: 'standar-approval', label: 'Standar Approval',icon: <Shield size={15} strokeWidth={1.75} />, count: 1 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SetupTab>('folder-dokumen');

  // Master folders state (live persistence)
  const [masterFolders, setMasterFolders] = useState<MasterFolder[]>([]);
  const [expandedFolderIds, setExpandedFolderIds] = useState<number[]>([1]);
  const [expandedSubIds, setExpandedSubIds] = useState<string[]>(['sub-1-1']);

  // Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isSubFolderModalOpen, setIsSubFolderModalOpen] = useState(false);

  // Form Fields for Main Folder
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderCategory, setNewFolderCategory] = useState<'HEAD_OFFICE' | 'OFFSHORE' | 'PROJECT_SITE'>('HEAD_OFFICE');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Form Fields for Sub-Folder
  const [targetFolder, setTargetFolder] = useState<MasterFolder | null>(null);
  const [targetSubFolder, setTargetSubFolder] = useState<MasterSubFolder | null>(null);
  const [newSubName, setNewSubName] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    setMasterFolders(loadMasterFolders());
  }, []);

  const toggleFolderExpand = (folderId: number) => {
    setExpandedFolderIds(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const toggleSubExpand = (subId: string) => {
    setExpandedSubIds(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const handleSaveMainFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const nextId = masterFolders.length > 0 ? Math.max(...masterFolders.map(f => f.id)) + 1 : 1;
    const newF: MasterFolder = {
      id: nextId,
      name: newFolderName.trim(),
      category: newFolderCategory,
      description: newFolderDesc.trim() || 'Folder dokumen kendali resmi.',
      docs: [],
      subfolders: [],
    };
    const updated = [...masterFolders, newF];
    setMasterFolders(updated);
    saveMasterFolders(updated);
    setExpandedFolderIds(prev => [...prev, nextId]);
    setNewFolderName('');
    setNewFolderDesc('');
    setIsFolderModalOpen(false);
    showToast(`Folder Utama "${newF.name}" berhasil dibuat!`);
  };

  const handleSaveSubFolder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetFolder || !newSubName.trim()) return;

    if (targetSubFolder) {
      // Create subfolder inside targetSubFolder (nested level 2)
      const childId = `sub-${targetSubFolder.id}-${Date.now().toString().slice(-4)}`;
      const newChild: MasterSubFolder = {
        id: childId,
        name: newSubName.trim(),
        docs: [],
        subfolders: [],
      };

      const updated = masterFolders.map(f => {
        if (f.id === targetFolder.id) {
          return {
            ...f,
            subfolders: (f.subfolders || []).map(s => {
              if (s.id === targetSubFolder.id) {
                return {
                  ...s,
                  subfolders: [...(s.subfolders || []), newChild],
                };
              }
              return s;
            }),
          };
        }
        return f;
      });

      setMasterFolders(updated);
      saveMasterFolders(updated);
      setExpandedFolderIds(prev => prev.includes(targetFolder.id) ? prev : [...prev, targetFolder.id]);
      setExpandedSubIds(prev => {
        const next = new Set(prev);
        next.add(targetSubFolder.id);
        next.add(childId);
        return Array.from(next);
      });
      setNewSubName('');
      setIsSubFolderModalOpen(false);
      setTargetFolder(null);
      setTargetSubFolder(null);
      showToast(`Sub-Folder "${newChild.name}" berhasil dibuat di dalam "${targetSubFolder.name}"!`);
      return;
    }

    // Direct subfolder under targetFolder (Level 1)
    const subId = `sub-${targetFolder.id}-${Date.now().toString().slice(-4)}`;
    const newSub: MasterSubFolder = {
      id: subId,
      name: newSubName.trim(),
      docs: [],
      subfolders: [],
    };

    const updated = masterFolders.map(f => {
      if (f.id === targetFolder.id) {
        return {
          ...f,
          subfolders: [...(f.subfolders || []), newSub],
        };
      }
      return f;
    });

    setMasterFolders(updated);
    saveMasterFolders(updated);
    setExpandedFolderIds(prev => prev.includes(targetFolder.id) ? prev : [...prev, targetFolder.id]);
    setExpandedSubIds(prev => [...prev, subId]);
    setNewSubName('');
    setIsSubFolderModalOpen(false);
    setTargetFolder(null);
    setTargetSubFolder(null);
    showToast(`Sub-Folder "${newSub.name}" berhasil ditambahkan ke "${targetFolder.name}"!`);
  };

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
                title="Struktur Folder & Sub-Folder Dokumen"
                description="Kelola hierarki folder induk dan sub-folder penyimpanan dokumen terkendali. Anda dapat menambahkan sub-folder ke folder utama maupun sub-folder di dalam sub-folder."
                action={
                  <button
                    id="btn-add-main-folder"
                    onClick={() => {
                      setNewFolderName('');
                      setNewFolderCategory('HEAD_OFFICE');
                      setNewFolderDesc('');
                      setIsFolderModalOpen(true);
                    }}
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
                    <FolderPlus size={14} strokeWidth={2.2} />
                    + Tambah Folder Utama
                  </button>
                }
              />

              <div style={{ background: '#ffffff', border: '1px solid #e8eef5', borderRadius: '10px', overflow: 'hidden' }}>
                {/* Header Row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 110px 180px 180px',
                  alignItems: 'center', padding: '10px 16px',
                  borderBottom: '1px solid #e8eef5', background: '#f8fafc',
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8',
                }}>
                  <div>Struktur Folder</div>
                  <div style={{ textAlign: 'center' }}>Kategori</div>
                  <div style={{ textAlign: 'center' }}>Sub-Folder / Dok</div>
                  <div style={{ textAlign: 'right' }}>Aksi Manajemen</div>
                </div>

                {masterFolders.length === 0 ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    Belum ada folder dokumen. Klik &quot;+ Tambah Folder Utama&quot; untuk memulai.
                  </div>
                ) : (
                  masterFolders.map((f, i) => {
                    const isExpanded = expandedFolderIds.includes(f.id);
                    const subCount = f.subfolders?.length || 0;
                    const directDocCount = f.docs?.length || 0;

                    return (
                      <div key={f.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }}>
                        {/* Main Folder Row */}
                        <div
                          style={{
                            display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 110px 180px 180px',
                            alignItems: 'center', padding: '11px 16px',
                            background: isExpanded ? '#fbfcfe' : '#ffffff',
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = '#f8fafc'; }}
                          onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = '#ffffff'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <button
                              onClick={() => toggleFolderExpand(f.id)}
                              title={isExpanded ? 'Tutup sub-folder' : 'Buka sub-folder'}
                              style={{
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#64748b', borderRadius: '4px',
                              }}
                            >
                              {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            </button>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '6px',
                              background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <FolderOpen size={16} strokeWidth={1.8} color="#0284c7" />
                            </div>
                            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {f.name}
                              </span>
                              {f.description && (
                                <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {f.description}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Category Badge */}
                          <div style={{ textAlign: 'center' }}>
                            <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px',
                              background: '#f1f5f9', color: '#475569', letterSpacing: '0.04em',
                            }}>
                              {f.category}
                            </span>
                          </div>

                          {/* Count */}
                          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '11px', fontWeight: 600, color: '#0369a1',
                              background: '#f0f9ff', border: '1px solid #e0f2fe',
                              padding: '1px 7px', borderRadius: '10px',
                            }}>
                              {subCount} sub-folder
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                              {directDocCount} dok langsung
                            </span>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              id={`btn-add-sub-${f.id}`}
                              onClick={() => {
                                setTargetFolder(f);
                                setTargetSubFolder(null);
                                setNewSubName('');
                                setIsSubFolderModalOpen(true);
                              }}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
                                borderRadius: '6px', padding: '4px 9px', fontSize: '11.5px', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.12s',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#dcfce7';
                                e.currentTarget.style.borderColor = '#86efac';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#f0fdf4';
                                e.currentTarget.style.borderColor = '#bbf7d0';
                              }}
                              title={`Tambah sub-folder baru di dalam ${f.name}`}
                            >
                              <FolderPlus size={12} strokeWidth={2.2} />
                              + Sub-Folder
                            </button>
                          </div>
                        </div>

                        {/* Subfolders list when expanded */}
                        {isExpanded && (
                          <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '6px 0 10px 32px' }}>
                            {(!f.subfolders || f.subfolders.length === 0) ? (
                              <div style={{
                                padding: '12px 20px', fontSize: '12px', color: '#94a3b8',
                                display: 'flex', alignItems: 'center', gap: '8px',
                              }}>
                                <span>Belum ada sub-folder di folder ini.</span>
                                <button
                                  onClick={() => {
                                    setTargetFolder(f);
                                    setTargetSubFolder(null);
                                    setNewSubName('');
                                    setIsSubFolderModalOpen(true);
                                  }}
                                  style={{
                                    background: 'none', border: 'none', color: '#0284c7',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                                  }}
                                >
                                  + Tambah sub-folder sekarang
                                </button>
                              </div>
                            ) : (
                              f.subfolders.map(sub => {
                                const isSubExpanded = expandedSubIds.includes(sub.id);
                                const hasChildren = sub.subfolders && sub.subfolders.length > 0;
                                const childCount = sub.subfolders?.length || 0;
                                const subDocCount = sub.docs?.length || 0;

                                return (
                                  <div key={sub.id} style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '14px' }}>
                                    {/* Level 1 Subfolder Row */}
                                    <div
                                      style={{
                                        display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 110px 180px 180px',
                                        alignItems: 'center', padding: '8px 16px',
                                        background: '#ffffff', margin: '4px 16px 4px 6px',
                                        borderRadius: '7px', border: '1px solid #e2e8f0',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                        {hasChildren ? (
                                          <button
                                            onClick={() => toggleSubExpand(sub.id)}
                                            style={{
                                              background: 'transparent', border: 'none', cursor: 'pointer',
                                              padding: '2px', display: 'flex', alignItems: 'center',
                                              color: '#64748b',
                                            }}
                                            title={isSubExpanded ? 'Tutup sub-folder bertingkat' : 'Buka sub-folder bertingkat'}
                                          >
                                            {isSubExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                          </button>
                                        ) : (
                                          <div style={{ width: '17px' }} />
                                        )}
                                        <div style={{
                                          width: '24px', height: '24px', borderRadius: '5px',
                                          background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          flexShrink: 0,
                                        }}>
                                          <Folder size={14} strokeWidth={2} color="#d97706" />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                                            {sub.name}
                                          </span>
                                        </div>
                                      </div>

                                      <div style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Sub-Folder Lv.1</span>
                                      </div>

                                      <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <span style={{
                                          fontSize: '10.5px', color: '#475569', background: '#f1f5f9',
                                          padding: '1px 7px', borderRadius: '6px', fontWeight: 500,
                                        }}>
                                          {subDocCount} dokumen
                                        </span>
                                        {childCount > 0 && (
                                          <span style={{
                                            fontSize: '10px', color: '#7c3aed', background: '#f5f3ff',
                                            padding: '1px 6px', borderRadius: '6px', fontWeight: 600,
                                            border: '1px solid #ede9fe',
                                          }}>
                                            {childCount} anak sub
                                          </span>
                                        )}
                                      </div>

                                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                          id={`btn-add-nested-${sub.id}`}
                                          onClick={() => {
                                            setTargetFolder(f);
                                            setTargetSubFolder(sub);
                                            setNewSubName('');
                                            setIsSubFolderModalOpen(true);
                                          }}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                            background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309',
                                            borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 600,
                                            cursor: 'pointer', transition: 'all 0.12s',
                                          }}
                                          onMouseEnter={e => {
                                            e.currentTarget.style.background = '#fde68a';
                                            e.currentTarget.style.borderColor = '#fcd34d';
                                          }}
                                          onMouseLeave={e => {
                                            e.currentTarget.style.background = '#fef3c7';
                                            e.currentTarget.style.borderColor = '#fde68a';
                                          }}
                                          title={`Tambah sub-folder di dalam "${sub.name}"`}
                                        >
                                          <FolderPlus size={11} strokeWidth={2.2} />
                                          + Sub-Folder di dalam
                                        </button>
                                      </div>
                                    </div>

                                    {/* Level 2 Subfolders (Nested inside Subfolder) */}
                                    {isSubExpanded && hasChildren && (
                                      <div style={{ marginLeft: '32px', marginBottom: '8px' }}>
                                        {sub.subfolders!.map(child => (
                                          <div
                                            key={child.id}
                                            style={{
                                              display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 110px 180px 180px',
                                              alignItems: 'center', padding: '6px 14px',
                                              background: '#ffffff', margin: '3px 16px 3px 0',
                                              borderRadius: '6px', border: '1px dashed #cbd5e1',
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <CornerDownRight size={13} color="#94a3b8" />
                                              <div style={{
                                                width: '20px', height: '20px', borderRadius: '4px',
                                                background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                              }}>
                                                <Folder size={12} strokeWidth={2} color="#16a34a" />
                                              </div>
                                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                                                {child.name}
                                              </span>
                                            </div>

                                            <div style={{ textAlign: 'center' }}>
                                              <span style={{ fontSize: '9.5px', color: '#94a3b8', fontStyle: 'italic' }}>Sub-Folder Lv.2</span>
                                            </div>

                                            <div style={{ textAlign: 'center' }}>
                                              <span style={{
                                                fontSize: '10px', color: '#64748b', background: '#f8fafc',
                                                padding: '1px 6px', borderRadius: '4px', border: '1px solid #f1f5f9',
                                              }}>
                                                {child.docs?.length || 0} dokumen
                                              </span>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                              <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 600 }}>
                                                ✓ Terhubung
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
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

      {/* ── TOAST NOTIFICATION ───────────────────────────────── */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: '#071c2c', color: '#ffffff',
          padding: '12px 18px', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '13px', fontWeight: 500,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <CheckCircle2 size={16} color="#22c55e" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── MODAL: TAMBAH FOLDER UTAMA ───────────────────────── */}
      {isFolderModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(7, 28, 44, 0.45)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid #e8eef5', background: '#071c2c', color: '#ffffff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={18} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Tambah Folder Utama Baru</h3>
              </div>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Nama Folder Utama *
                </label>
                <input
                  id="input-main-folder-name"
                  type="text"
                  placeholder="Contoh: 16. Audit Internal & Sertifikasi"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13px',
                    border: '1px solid #cbd5e1', borderRadius: '7px', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Kategori *
                </label>
                <select
                  value={newFolderCategory}
                  onChange={e => setNewFolderCategory(e.target.value as 'HEAD_OFFICE' | 'OFFSHORE' | 'PROJECT_SITE')}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13px',
                    border: '1px solid #cbd5e1', borderRadius: '7px', outline: 'none',
                    boxSizing: 'border-box', background: '#fff',
                  }}
                >
                  <option value="HEAD_OFFICE">HEAD OFFICE</option>
                  <option value="OFFSHORE">OFFSHORE</option>
                  <option value="PROJECT_SITE">PROJECT SITE</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Deskripsi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Keterangan isi dokumen dalam folder ini"
                  value={newFolderDesc}
                  onChange={e => setNewFolderDesc(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13px',
                    border: '1px solid #cbd5e1', borderRadius: '7px', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: '14px 20px', borderTop: '1px solid #e8eef5', background: '#f8fafc',
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
            }}>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  background: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                id="btn-submit-main-folder"
                onClick={handleSaveMainFolder}
                disabled={!newFolderName.trim()}
                style={{
                  padding: '8px 18px', borderRadius: '6px', border: 'none',
                  background: newFolderName.trim() ? '#071c2c' : '#94a3b8',
                  color: '#ffffff', fontSize: '12.5px', fontWeight: 600,
                  cursor: newFolderName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Simpan Folder Utama
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TAMBAH SUB-FOLDER ─────────────────────────── */}
      {isSubFolderModalOpen && targetFolder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(7, 28, 44, 0.45)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid #e8eef5', background: '#071c2c', color: '#ffffff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={18} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  {targetSubFolder ? 'Tambah Sub-Folder di dalam Sub-Folder' : 'Tambah Sub-Folder Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsSubFolderModalOpen(false);
                  setTargetFolder(null);
                  setTargetSubFolder(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: '7px', fontSize: '12px', color: '#475569',
              }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '3px' }}>
                  Lokasi Penempatan
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#071c2c' }}>📁 {targetFolder.name}</span>
                  {targetSubFolder && (
                    <>
                      <span style={{ color: '#94a3b8' }}>›</span>
                      <span style={{
                        fontWeight: 600, color: '#b45309', background: '#fef3c7',
                        padding: '2px 6px', borderRadius: '4px',
                      }}>
                        📂 {targetSubFolder.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Nama Sub-Folder *
                </label>
                <input
                  id="input-sub-folder-name"
                  type="text"
                  placeholder={targetSubFolder ? "Contoh: Laporan Mingguan Lapangan" : "Contoh: Dokumen Standar Operasional"}
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newSubName.trim()) {
                      handleSaveSubFolder();
                    }
                  }}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13px',
                    border: '1px solid #cbd5e1', borderRadius: '7px', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: '14px 20px', borderTop: '1px solid #e8eef5', background: '#f8fafc',
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
            }}>
              <button
                onClick={() => {
                  setIsSubFolderModalOpen(false);
                  setTargetFolder(null);
                  setTargetSubFolder(null);
                }}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  background: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                id="btn-submit-sub-folder"
                onClick={handleSaveSubFolder}
                disabled={!newSubName.trim()}
                style={{
                  padding: '8px 18px', borderRadius: '6px', border: 'none',
                  background: newSubName.trim() ? '#071c2c' : '#94a3b8',
                  color: '#ffffff', fontSize: '12.5px', fontWeight: 600,
                  cursor: newSubName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {targetSubFolder ? 'Tambah Sub-Folder Bertingkat' : 'Tambah Sub-Folder'}
              </button>
            </div>
          </div>
        </div>
      )}
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
