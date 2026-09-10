'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Plus,
  Minus,
  Search,
  FileText,
  Eye,
  Download,
  Building2,
  Ship,
  HardHat,
  ChevronRight,
  ChevronDown,
  Filter,
  CheckCircle2,
  Clock,
  FileCheck,
  X,
  ExternalLink,
  Layers,
  ShieldAlert,
  History,
  CornerDownRight,
} from 'lucide-react';
import {
  MasterFolder,
  MasterSubFolder,
  MasterDocItem,
  RevisionLog,
  loadMasterFolders,
  saveMasterFolders,
} from '@/lib/masterlist-data';

/* ─── Main Masterlist Component ───────────────────────────────── */
export default function MasterlistPage() {
  const router = useRouter();

  // Master folders state (stored & persisted in localStorage)
  const [folders, setFolders] = useState<MasterFolder[]>([]);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  useEffect(() => {
    setFolders(loadMasterFolders());
    setIsClientLoaded(true);
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Active category filter tab
  const [activeTab, setActiveTab] = useState<'HEAD_OFFICE' | 'OFFSHORE' | 'PROJECT_SITE'>('HEAD_OFFICE');

  // Expanded folders state (set of folder IDs)
  const [expandedFolderIds, setExpandedFolderIds] = useState<number[]>([1, 7]); // folders 1 & 7 open by default
  const [expandedSubFolderIds, setExpandedSubFolderIds] = useState<string[]>(['sub-1-1', 'sub-7-1']);

  // Selected document for preview modal
  const [previewDoc, setPreviewDoc] = useState<MasterDocItem | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'history'>('info');

  // Modal Tambah Folder
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderCategory, setNewFolderCategory] = useState<'HEAD_OFFICE' | 'OFFSHORE' | 'PROJECT_SITE'>('HEAD_OFFICE');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Modal Tambah Sub Folder
  const [isAddSubFolderOpen, setIsAddSubFolderOpen] = useState(false);
  const [targetParentFolder, setTargetParentFolder] = useState<MasterFolder | null>(null);
  const [targetParentSubFolder, setTargetParentSubFolder] = useState<MasterSubFolder | null>(null);
  const [newSubFolderName, setNewSubFolderName] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate realistic revision history & change notes
  const getDocRevisionHistory = (doc: MasterDocItem): RevisionLog[] => {
    const currentRevNum = parseInt(doc.revision.replace(/\D/g, ''), 10) || 0;
    const history: RevisionLog[] = [];

    const sampleNotes: Record<number, string> = {
      4: 'Pembaruan berkala komprehensif: Sinkronisasi kebijakan Zero Harm Mandate dan penyesuaian regulasi maritim internasional terbaru 2026.',
      3: 'Pembaruan klausul operasional: Integrasi prosedur pemboran geoteknik offshore dan pemutakhiran matriks mitigasi risiko HAZID.',
      2: 'Penyesuaian tata kelola K3LH: Penambahan lembar checklist inspeksi harian dan prosedur pelaporan insiden darurat kapal survei.',
      1: 'Revisi penyesuaian format tata naskah dinas DCMS, penyesuaian kode departemen, dan masa simpan dokumen aktif.',
      0: 'Rilis awal dokumen kendali resmi sistem manajemen mutu PT Taka Hydrocore Indonesia.',
    };

    for (let r = currentRevNum; r >= 0; r--) {
      const revStr = `Rev.${String(r).padStart(2, '0')}`;
      const isCur = r === currentRevNum;
      history.push({
        rev: revStr,
        date: isCur ? doc.effectiveDate : `${Math.max(1, 20 - r * 5)} Jan 2025`,
        author: r % 2 === 0 ? 'Reza Firmansyah (DC Officer)' : 'Dimas Pratama (Lead Engineer)',
        approver: 'Hendra Wijaya (QHSSE Manager)',
        notes: sampleNotes[r] || `Pembaruan teknis berkas kendali versi ${revStr}.`,
        isCurrent: isCur,
        size: doc.size,
      });
    }

    return history;
  };

  // Total documents count across all folders and subfolders
  const totalDocsCount = useMemo(() => {
    return folders.reduce((acc, f) => {
      const directDocs = f.docs?.length || 0;
      const subDocs = (f.subfolders || []).reduce((sAcc, sub) => sAcc + (sub.docs?.length || 0), 0);
      return acc + directDocs + subDocs;
    }, 0);
  }, [folders]);

  // Helper to count docs in a subfolder (including nested subfolders)
  const countSubFolderDocs = (sub: MasterSubFolder): number => {
    const direct = sub.docs?.length || 0;
    const nested = (sub.subfolders || []).reduce((acc, s) => acc + countSubFolderDocs(s), 0);
    return direct + nested;
  };

  // Helper to count docs in a single folder
  const countFolderDocs = (folder: MasterFolder) => {
    const directDocs = folder.docs?.length || 0;
    const subDocs = (folder.subfolders || []).reduce((acc, sub) => acc + countSubFolderDocs(sub), 0);
    return directDocs + subDocs;
  };

  // Filter folders based on category & search query
  const filteredFolders = useMemo(() => {
    let list = folders;
    if (activeTab !== 'HEAD_OFFICE') {
      list = folders.filter(f => f.category === activeTab);
    }

    if (!searchQuery.trim()) {
      return list;
    }

    const q = searchQuery.toLowerCase().trim();
    const result: MasterFolder[] = [];

    for (const folder of list) {
      const folderMatches = folder.name.toLowerCase().includes(q) || folder.description.toLowerCase().includes(q);

      const matchedDirectDocs = (folder.docs || []).filter(
        d =>
          d.number.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.classification.toLowerCase().includes(q)
      );

      const matchedSubfolders: MasterSubFolder[] = [];
      for (const sub of folder.subfolders || []) {
        const subMatches = sub.name.toLowerCase().includes(q);
        const matchedSubDocs = (sub.docs || []).filter(
          d =>
            d.number.toLowerCase().includes(q) ||
            d.title.toLowerCase().includes(q) ||
            d.type.toLowerCase().includes(q) ||
            d.classification.toLowerCase().includes(q)
        );
        if (subMatches || matchedSubDocs.length > 0) {
          matchedSubfolders.push({
            ...sub,
            docs: matchedSubDocs.length > 0 ? matchedSubDocs : sub.docs,
          });
        }
      }

      if (folderMatches || matchedDirectDocs.length > 0 || matchedSubfolders.length > 0) {
        result.push({
          ...folder,
          docs: matchedDirectDocs.length > 0 ? matchedDirectDocs : folder.docs,
          subfolders: matchedSubfolders.length > 0 ? matchedSubfolders : folder.subfolders,
        });
      }
    }

    return result;
  }, [folders, searchQuery, activeTab]);

  // Toggle single folder
  const toggleFolder = (folderId: number) => {
    setExpandedFolderIds(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  // Toggle single subfolder
  const toggleSubFolder = (subId: string) => {
    setExpandedSubFolderIds(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  // Expand all folders
  const handleExpandAll = () => {
    setExpandedFolderIds(folders.map(f => f.id));
    const allSubs: string[] = [];
    folders.forEach(f => (f.subfolders || []).forEach(sub => {
      allSubs.push(sub.id);
      (sub.subfolders || []).forEach(cs => allSubs.push(cs.id));
    }));
    setExpandedSubFolderIds(allSubs);
  };

  // Collapse all folders
  const handleCollapseAll = () => {
    setExpandedFolderIds([]);
    setExpandedSubFolderIds([]);
  };

  // Handle create new folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const nextId = folders.length > 0 ? Math.max(...folders.map(f => f.id)) + 1 : 1;
    const newFolder: MasterFolder = {
      id: nextId,
      name: newFolderName.trim(),
      category: newFolderCategory,
      description: newFolderDesc.trim() || 'Folder dokumen kendali operasional.',
      docs: [],
      subfolders: [],
    };

    const updated = [...folders, newFolder];
    setFolders(updated);
    saveMasterFolders(updated);
    setExpandedFolderIds(prev => [...prev, nextId]);

    setNewFolderName('');
    setNewFolderDesc('');
    setIsAddFolderOpen(false);
    showToast(`Folder "${newFolder.name}" berhasil dibuat!`);
  };

  // Handle create new sub-folder (Level 1 or Level 2)
  const handleCreateSubFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetParentFolder || !newSubFolderName.trim()) return;

    // Case 1: Nested Sub-Folder inside targetParentSubFolder (Level 2)
    if (targetParentSubFolder) {
      const childSubId = `sub-${targetParentSubFolder.id}-${Date.now().toString().slice(-4)}`;
      const newChildSub: MasterSubFolder = {
        id: childSubId,
        name: newSubFolderName.trim(),
        docs: [],
        subfolders: [],
      };

      const updated = folders.map(f => {
        if (f.id === targetParentFolder.id) {
          return {
            ...f,
            subfolders: (f.subfolders || []).map(s => {
              if (s.id === targetParentSubFolder.id) {
                return {
                  ...s,
                  subfolders: [...(s.subfolders || []), newChildSub],
                };
              }
              return s;
            }),
          };
        }
        return f;
      });

      setFolders(updated);
      saveMasterFolders(updated);
      setExpandedFolderIds(prev => (prev.includes(targetParentFolder.id) ? prev : [...prev, targetParentFolder.id]));
      setExpandedSubFolderIds(prev => {
        const next = new Set(prev);
        next.add(targetParentSubFolder.id);
        next.add(childSubId);
        return Array.from(next);
      });

      setNewSubFolderName('');
      setIsAddSubFolderOpen(false);
      setTargetParentFolder(null);
      setTargetParentSubFolder(null);
      showToast(`Sub-Folder "${newChildSub.name}" berhasil ditambahkan ke dalam "${targetParentSubFolder.name}"!`);
      return;
    }

    // Case 2: Direct Sub-Folder inside targetParentFolder (Level 1)
    const subId = `sub-${targetParentFolder.id}-${Date.now().toString().slice(-4)}`;
    const newSub: MasterSubFolder = {
      id: subId,
      name: newSubFolderName.trim(),
      docs: [],
      subfolders: [],
    };

    const updated = folders.map(f => {
      if (f.id === targetParentFolder.id) {
        return {
          ...f,
          subfolders: [...(f.subfolders || []), newSub],
        };
      }
      return f;
    });

    setFolders(updated);
    saveMasterFolders(updated);
    setExpandedFolderIds(prev => (prev.includes(targetParentFolder.id) ? prev : [...prev, targetParentFolder.id]));
    setExpandedSubFolderIds(prev => [...prev, subId]);

    setNewSubFolderName('');
    setIsAddSubFolderOpen(false);
    setTargetParentFolder(null);
    setTargetParentSubFolder(null);
    showToast(`Sub Folder "${newSub.name}" berhasil ditambahkan ke ${targetParentFolder.name}!`);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      {/* ─── Toast Feedback ─── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '74px',
            right: '24px',
            zIndex: 9999,
            background: '#071c2c',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 500,
            borderLeft: '4px solid #0284c7',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={16} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Top Header: Minimalist Corporate with Logo Accent ─── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e8eef5',
          paddingBottom: '20px',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src="/thi-logo-official.png"
            alt="PT Taka Hydrocore Indonesia"
            style={{ height: 32, width: 'auto', objectFit: 'contain' }}
          />

          <div style={{ height: '32px', width: '1px', background: '#e2e8f0' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#071c2c',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                }}
              >
                Masterlist Dokumen
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Daftar induk dokumen kendali resmi PT Taka Hydrocore Indonesia sesuai standar ISO & IMCA.
            </p>
          </div>
        </div>

        {/* Action Button: Tambah Folder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsAddFolderOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              background: 'linear-gradient(135deg, #071c2c 0%, #0c273d 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(7, 28, 44, 0.15)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(7, 28, 44, 0.25)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(7, 28, 44, 0.15)')}
          >
            <FolderPlus size={16} strokeWidth={2} />
            <span>Tambah Folder</span>
          </button>
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div style={{ marginBottom: '18px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '460px',
          }}
        >
          <Search
            size={15}
            color="#94a3b8"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Cari folder, sub-folder, atau dokumen..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              padding: '0 32px 0 34px',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#1e293b',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(2, 132, 199, 0.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ─── Category Pills & Quick Controls ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { key: 'HEAD_OFFICE', label: 'Head Office', icon: Building2, count: totalDocsCount },
            { key: 'OFFSHORE', label: 'Offshore & Vessel', icon: Ship, count: 0 },
            { key: 'PROJECT_SITE', label: 'Project Site', icon: HardHat, count: 0 },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #071c2c' : '1px solid #e2e8f0',
                  background: isActive ? '#071c2c' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick expand/collapse controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleExpandAll}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0284c7',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            Buka Semua
          </button>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <button
            onClick={handleCollapseAll}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            Tutup Semua
          </button>
        </div>
      </div>

      {/* ─── MAIN FOLDER TREE VIEW ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredFolders.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <Folder size={36} color="#94a3b8" style={{ marginBottom: '12px', strokeWidth: 1.5 }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', margin: '0 0 6px 0' }}>
              Tidak ada folder atau dokumen yang cocok
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Coba sesuaikan kata kunci pencarian Anda: &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          filteredFolders.map(folder => {
            const isExpanded = expandedFolderIds.includes(folder.id) || !!searchQuery.trim();
            const totalDocsInFolder = countFolderDocs(folder);
            const subCount = folder.subfolders?.length || 0;

            return (
              <div
                key={folder.id}
                style={{
                  background: '#ffffff',
                  border: isExpanded ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                  borderLeft: isExpanded ? '6px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.18s ease',
                  boxShadow: isExpanded ? '0 4px 20px rgba(2, 132, 199, 0.10)' : 'none',
                }}
              >
                {/* ── Main Folder Row ── */}
                <div
                  onClick={() => toggleFolder(folder.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '13px 20px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isExpanded ? 'linear-gradient(90deg, #f0f9ff 0%, #ffffff 100%)' : '#ffffff',
                    borderBottom: isExpanded ? '1.5px solid #e0f2fe' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={e => {
                    if (!isExpanded) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseOut={e => {
                    if (!isExpanded) e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  {/* Left: Folder Icon & Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        color: isExpanded ? '#0284c7' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {isExpanded ? (
                        <FolderOpen size={21} strokeWidth={2} color="#0284c7" />
                      ) : (
                        <Folder size={21} strokeWidth={1.8} />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: isExpanded ? '#071c2c' : '#334155',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {folder.name}
                        </span>
                        {folder.category !== 'HEAD_OFFICE' && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: '#d97706',
                              background: '#fef3c7',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {folder.category}
                          </span>
                        )}
                      </div>
                      {folder.description && (
                        <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                          {folder.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: + Sub Folder, Counters & Expand Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setTargetParentFolder(folder);
                        setTargetParentSubFolder(null);
                        setIsAddSubFolderOpen(true);
                      }}
                      title="Tambah Sub Folder ke folder ini"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#0369a1')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#0284c7')}
                    >
                      <Plus size={13} strokeWidth={2.4} />
                      <span>+ Sub Folder</span>
                    </button>

                    {subCount > 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#b45309',
                          fontWeight: 700,
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          padding: '2px 8px',
                          borderRadius: '10px',
                        }}
                      >
                        {subCount} Sub-Folder
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '11px',
                        color: '#475569',
                        fontWeight: 600,
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {totalDocsInFolder} Dokumen
                    </span>

                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isExpanded ? '#0284c7' : '#64748b',
                        background: isExpanded ? '#e0f2fe' : 'transparent',
                      }}
                    >
                      {isExpanded ? (
                        <Minus size={15} strokeWidth={2.2} />
                      ) : (
                        <Plus size={15} strokeWidth={2.2} />
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Expanded Content: Sub-folders + Documents ── */}
                {isExpanded && (
                  <div style={{ background: '#ffffff', padding: '12px 0 16px 0' }}>
                    {/* ── Subfolder Creation Callout Banner ── */}
                    <div
                      style={{
                        margin: '4px 20px 16px 20px',
                        padding: '14px 18px',
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        border: '1.5px dashed #0284c7',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: '#0284c7',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                          }}
                        >
                          <FolderPlus size={20} strokeWidth={2.2} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#071c2c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Kelola Sub-Folder</span>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0284c7', background: '#ffffff', padding: '1px 7px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                              Folder: {folder.name}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '2px' }}>
                            Ingin membagi folder ini ke dalam kategori/bagian yang lebih spesifik? Tambahkan sub-folder di sini.
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setTargetParentFolder(folder);
                          setTargetParentSubFolder(null);
                          setIsAddSubFolderOpen(true);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          padding: '9px 18px',
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 3px 8px rgba(2, 132, 199, 0.35)',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#0369a1')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#0284c7')}
                      >
                        <Plus size={15} strokeWidth={2.5} />
                        <span>+ Buat Sub Folder Baru</span>
                      </button>
                    </div>

                    {/* ── SECTION 1: SUB-FOLDERS (WARM AMBER DIRECTORY THEME) ── */}
                    {(folder.subfolders || []).length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px 8px 24px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            📂 Daftar Sub-Folder ({folder.subfolders?.length})
                          </span>
                          <span style={{ height: '1px', flex: 1, background: '#fde68a' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 20px 0 24px' }}>
                          {(folder.subfolders || []).map(sub => {
                            const isSubExpanded = expandedSubFolderIds.includes(sub.id) || !!searchQuery.trim();

                            return (
                              <div
                                key={sub.id}
                                style={{
                                  border: isSubExpanded ? '1.5px solid #f59e0b' : '1px solid #fde68a',
                                  borderLeft: '5px solid #d97706',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: '#fffdf5',
                                  boxShadow: isSubExpanded ? '0 2px 8px rgba(217, 119, 6, 0.08)' : 'none',
                                }}
                              >
                                {/* Subfolder Row Header */}
                                <div
                                  onClick={() => toggleSubFolder(sub.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 16px',
                                    cursor: 'pointer',
                                    background: isSubExpanded ? '#fef3c7' : '#fffdf5',
                                    borderBottom: isSubExpanded && sub.docs?.length > 0 ? '1px solid #fde68a' : 'none',
                                    userSelect: 'none',
                                    transition: 'background 0.15s ease',
                                  }}
                                  onMouseOver={e => {
                                    if (!isSubExpanded) e.currentTarget.style.background = '#fef9ed';
                                  }}
                                  onMouseOut={e => {
                                    if (!isSubExpanded) e.currentTarget.style.background = '#fffdf5';
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Folder size={17} color="#d97706" strokeWidth={2.2} />
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        color: '#92400e',
                                        background: '#fef3c7',
                                        border: '1px solid #fde68a',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      SUB FOLDER
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#071c2c' }}>
                                      {sub.name}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        setTargetParentFolder(folder);
                                        setTargetParentSubFolder(sub);
                                        setIsAddSubFolderOpen(true);
                                      }}
                                      title={`Tambah Sub-Folder ke dalam "${sub.name}"`}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '3px 9px',
                                        background: '#ffffff',
                                        border: '1px solid #f59e0b',
                                        color: '#b45309',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 2px rgba(217, 119, 6, 0.08)',
                                        transition: 'all 0.15s ease',
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.background = '#fef3c7';
                                        e.currentTarget.style.borderColor = '#d97706';
                                        e.currentTarget.style.color = '#78350f';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.background = '#ffffff';
                                        e.currentTarget.style.borderColor = '#f59e0b';
                                        e.currentTarget.style.color = '#b45309';
                                      }}
                                    >
                                      <FolderPlus size={12} strokeWidth={2.4} color="#d97706" />
                                      <span>+ Sub Folder</span>
                                    </button>

                                    {(sub.subfolders || []).length > 0 && (
                                      <span
                                        style={{
                                          fontSize: '10px',
                                          color: '#c2410c',
                                          background: '#ffedd5',
                                          border: '1px solid #fed7aa',
                                          padding: '1.5px 6px',
                                          borderRadius: '8px',
                                          fontWeight: 700,
                                        }}
                                      >
                                        {sub.subfolders?.length} Sub
                                      </span>
                                    )}

                                    <span
                                      style={{
                                        fontSize: '11px',
                                        color: '#78350f',
                                        background: '#ffffff',
                                        border: '1px solid #fde68a',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {countSubFolderDocs(sub)} Dokumen
                                    </span>
                                    <div
                                      style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#b45309',
                                      }}
                                    >
                                      {isSubExpanded ? <ChevronDown size={16} strokeWidth={2.4} /> : <ChevronRight size={16} strokeWidth={2.4} />}
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Content of Subfolder: Child Subfolders + Documents */}
                                {isSubExpanded && (
                                  <div style={{ background: '#ffffff', padding: '6px 0 10px 0' }}>
                                    {/* 1. Child Sub-Folders (Level 2 Nested) */}
                                    {(sub.subfolders || []).length > 0 && (
                                      <div style={{ padding: '4px 16px 8px 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                          <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            📂 Sub-Folder di dalam &quot;{sub.name}&quot; ({(sub.subfolders || []).length})
                                          </span>
                                          <span style={{ height: '1px', flex: 1, background: '#fed7aa' }} />
                                        </div>

                                        {(sub.subfolders || []).map(childSub => {
                                          const isChildExpanded = expandedSubFolderIds.includes(childSub.id) || !!searchQuery.trim();
                                          return (
                                            <div
                                              key={childSub.id}
                                              style={{
                                                background: '#fffbf5',
                                                border: '1.5px solid #fed7aa',
                                                borderLeft: '5px solid #ea580c',
                                                borderRadius: '6px',
                                                overflow: 'hidden',
                                                boxShadow: '0 1px 3px rgba(234, 88, 12, 0.06)',
                                              }}
                                            >
                                              {/* Child Subfolder Row */}
                                              <div
                                                onClick={() => toggleSubFolder(childSub.id)}
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'space-between',
                                                  padding: '8px 14px',
                                                  cursor: 'pointer',
                                                  background: isChildExpanded ? '#ffedd5' : '#fffbf5',
                                                  borderBottom: isChildExpanded && (childSub.docs?.length || 0) > 0 ? '1px solid #fed7aa' : 'none',
                                                  userSelect: 'none',
                                                  transition: 'background 0.15s ease',
                                                }}
                                                onMouseOver={e => {
                                                  if (!isChildExpanded) e.currentTarget.style.background = '#fef3c7';
                                                }}
                                                onMouseOut={e => {
                                                  if (!isChildExpanded) e.currentTarget.style.background = '#fffbf5';
                                                }}
                                              >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                  <Folder size={15} color="#ea580c" strokeWidth={2.2} />
                                                  <span
                                                    style={{
                                                      fontSize: '9.5px',
                                                      fontWeight: 800,
                                                      textTransform: 'uppercase',
                                                      letterSpacing: '0.04em',
                                                      color: '#9a3412',
                                                      background: '#fed7aa',
                                                      padding: '1.5px 5px',
                                                      borderRadius: '4px',
                                                    }}
                                                  >
                                                    SUB FOLDER
                                                  </span>
                                                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#071c2c' }}>
                                                    {childSub.name}
                                                  </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                  <span
                                                    style={{
                                                      fontSize: '10.5px',
                                                      color: '#9a3412',
                                                      background: '#ffffff',
                                                      border: '1px solid #fed7aa',
                                                      padding: '1px 7px',
                                                      borderRadius: '10px',
                                                      fontWeight: 600,
                                                    }}
                                                  >
                                                    {childSub.docs?.length || 0} Dokumen
                                                  </span>
                                                  <div
                                                    style={{
                                                      width: 20,
                                                      height: 20,
                                                      borderRadius: 3,
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      color: '#ea580c',
                                                    }}
                                                  >
                                                    {isChildExpanded ? <ChevronDown size={15} strokeWidth={2.4} /> : <ChevronRight size={15} strokeWidth={2.4} />}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Documents in Child Subfolder */}
                                              {isChildExpanded && (
                                                <div style={{ background: '#ffffff', padding: '4px 0' }}>
                                                  {(!childSub.docs || childSub.docs.length === 0) ? (
                                                    <div style={{ padding: '10px 18px 10px 32px', fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                      Belum ada berkas dokumen dalam sub-folder ini.
                                                    </div>
                                                  ) : (
                                                    childSub.docs.map((doc, cIdx) => (
                                                      <div
                                                        key={doc.id}
                                                        style={{
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'space-between',
                                                          padding: '7px 14px 7px 32px',
                                                          borderTop: cIdx > 0 ? '1px solid #f8fafc' : 'none',
                                                          transition: 'background 0.12s ease',
                                                        }}
                                                        onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                                                        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                                      >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                          <FileText size={13} color="#ea580c" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                                                          <span
                                                            style={{
                                                              fontSize: '11px',
                                                              fontWeight: 600,
                                                              fontFamily: 'var(--font-mono)',
                                                              color: '#071c2c',
                                                              background: '#fff7ed',
                                                              border: '1px solid #ffedd5',
                                                              padding: '2px 5px',
                                                              borderRadius: '3px',
                                                            }}
                                                          >
                                                            {doc.number}
                                                          </span>
                                                          <span
                                                            style={{
                                                              fontSize: '12px',
                                                              fontWeight: 500,
                                                              color: '#1e293b',
                                                              overflow: 'hidden',
                                                              textOverflow: 'ellipsis',
                                                              whiteSpace: 'nowrap',
                                                            }}
                                                          >
                                                            {doc.title}
                                                          </span>
                                                          <span
                                                            style={{
                                                              fontSize: '10.5px',
                                                              fontWeight: 600,
                                                              fontFamily: 'var(--font-mono)',
                                                              color: '#c2410c',
                                                              background: '#ffedd5',
                                                              padding: '1px 4px',
                                                              borderRadius: '3px',
                                                            }}
                                                          >
                                                            {doc.revision}
                                                          </span>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                                          <button
                                                            onClick={() => {
                                                              setModalTab('info');
                                                              setPreviewDoc(doc);
                                                            }}
                                                            title="Pratinjau Dokumen"
                                                            style={{
                                                              background: '#ffffff',
                                                              border: '1px solid #e2e8f0',
                                                              borderRadius: '4px',
                                                              padding: '4px 7px',
                                                              color: '#334155',
                                                              cursor: 'pointer',
                                                              display: 'flex',
                                                              alignItems: 'center',
                                                              gap: '4px',
                                                              fontSize: '11px',
                                                            }}
                                                          >
                                                            <Eye size={12} />
                                                            <span>Lihat</span>
                                                          </button>
                                                          <button
                                                            onClick={() => {
                                                              setModalTab('history');
                                                              setPreviewDoc(doc);
                                                            }}
                                                            title="Riwayat Revisi"
                                                            style={{
                                                              background: '#fff7ed',
                                                              border: '1px solid #fed7aa',
                                                              borderRadius: '4px',
                                                              padding: '4px 7px',
                                                              color: '#c2410c',
                                                              cursor: 'pointer',
                                                              display: 'flex',
                                                              alignItems: 'center',
                                                              gap: '4px',
                                                              fontSize: '11px',
                                                            }}
                                                          >
                                                            <History size={12} />
                                                            <span>Revisi</span>
                                                          </button>
                                                        </div>
                                                      </div>
                                                    ))
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* 2. Direct Documents in Subfolder */}
                                    {(sub.docs || []).length > 0 && (
                                      <div>
                                        {(sub.subfolders || []).length > 0 && (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 20px 4px 38px' }}>
                                            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#78350f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                              📄 Dokumen ({sub.docs.length})
                                            </span>
                                            <span style={{ height: '1px', flex: 1, background: '#fde68a' }} />
                                          </div>
                                        )}

                                        {sub.docs.map((doc, dIdx) => (
                                          <div
                                            key={doc.id}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              padding: '8px 16px 8px 40px',
                                              borderTop: dIdx > 0 ? '1px solid #f8fafc' : 'none',
                                              transition: 'background 0.12s ease',
                                            }}
                                            onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                                            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                              <FileText size={14} color="#0284c7" strokeWidth={1.75} style={{ flexShrink: 0 }} />
                                              <span
                                                style={{
                                                  fontSize: '11.5px',
                                                  fontWeight: 600,
                                                  fontFamily: 'var(--font-mono)',
                                                  color: '#071c2c',
                                                  background: '#f1f5f9',
                                                  padding: '2px 6px',
                                                  borderRadius: '4px',
                                                }}
                                              >
                                                {doc.number}
                                              </span>
                                              <span
                                                style={{
                                                  fontSize: '12.5px',
                                                  fontWeight: 500,
                                                  color: '#1e293b',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                                }}
                                              >
                                                {doc.title}
                                              </span>
                                              <span
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: 600,
                                                  fontFamily: 'var(--font-mono)',
                                                  color: '#0369a1',
                                                  background: '#e0f2fe',
                                                  padding: '1px 5px',
                                                  borderRadius: '3px',
                                                }}
                                              >
                                                {doc.revision}
                                              </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                              <button
                                                onClick={() => {
                                                  setModalTab('info');
                                                  setPreviewDoc(doc);
                                                }}
                                                title="Pratinjau Dokumen"
                                                style={{
                                                  background: '#ffffff',
                                                  border: '1px solid #e2e8f0',
                                                  borderRadius: '4px',
                                                  padding: '5px 8px',
                                                  color: '#334155',
                                                  cursor: 'pointer',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '4px',
                                                  fontSize: '11.5px',
                                                }}
                                              >
                                                <Eye size={13} />
                                                <span>Lihat</span>
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setModalTab('history');
                                                  setPreviewDoc(doc);
                                                }}
                                                title="Riwayat Revisi"
                                                style={{
                                                  background: '#f0f9ff',
                                                  border: '1px solid #bae6fd',
                                                  borderRadius: '4px',
                                                  padding: '5px 8px',
                                                  color: '#0284c7',
                                                  cursor: 'pointer',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '4px',
                                                  fontSize: '11.5px',
                                                }}
                                              >
                                                <History size={13} />
                                                <span>Revisi</span>
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* 3. Empty state if neither subfolders nor docs */}
                                    {(!sub.docs || sub.docs.length === 0) && (!sub.subfolders || sub.subfolders.length === 0) && (
                                      <div style={{ padding: '12px 20px 12px 40px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                                        Belum ada berkas dokumen atau sub-folder dalam sub-folder ini.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── SECTION 2: DIRECT ROOT DOCUMENTS ── */}
                    {(folder.docs || []).length > 0 && (
                      <div>
                        {(folder.subfolders || []).length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px 8px 24px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              📄 Dokumen Langsung / Root Folder ({folder.docs?.length})
                            </span>
                            <span style={{ height: '1px', flex: 1, background: '#e2e8f0' }} />
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {(folder.docs || []).map((doc, idx) => (
                            <div
                              key={doc.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '9px 20px 9px 36px',
                                borderTop: idx > 0 ? '1px solid #f8fafc' : 'none',
                                transition: 'background 0.12s ease',
                              }}
                              onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                <FileText size={15} color="#0284c7" strokeWidth={1.75} style={{ flexShrink: 0 }} />
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                                  <span
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      fontFamily: 'var(--font-mono)',
                                      color: '#071c2c',
                                      background: '#f1f5f9',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {doc.number}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: 500,
                                      color: '#1e293b',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {doc.title}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      fontFamily: 'var(--font-mono)',
                                      color: '#0369a1',
                                      background: '#e0f2fe',
                                      padding: '1px 5px',
                                      borderRadius: '3px',
                                    }}
                                  >
                                    {doc.revision}
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <button
                                  onClick={() => {
                                    setModalTab('info');
                                    setPreviewDoc(doc);
                                  }}
                                  title="Pratinjau Dokumen"
                                  style={{
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '5px',
                                    padding: '5px 10px',
                                    color: '#334155',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '12px',
                                  }}
                                >
                                  <Eye size={13} />
                                  <span>Lihat</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setModalTab('history');
                                    setPreviewDoc(doc);
                                  }}
                                  title="Lihat Riwayat Revisi & Change Log"
                                  style={{
                                    background: '#f0f9ff',
                                    border: '1px solid #bae6fd',
                                    borderRadius: '5px',
                                    padding: '5px 10px',
                                    color: '#0369a1',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '12px',
                                  }}
                                >
                                  <History size={13} />
                                  <span>Riwayat</span>
                                </button>

                                <button
                                  onClick={() => alert(`Mengunduh file resmi ${doc.number} (${doc.fileExt.toUpperCase()})`)}
                                  title="Download File"
                                  style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '5px',
                                    padding: '6px',
                                    color: '#334155',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Download size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Empty state if neither docs nor subfolders */}
                    {(!folder.docs || folder.docs.length === 0) && (!folder.subfolders || folder.subfolders.length === 0) && (
                      <div style={{ padding: '16px 24px 16px 48px', fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                        Belum ada dokumen atau sub-folder. Gunakan tombol &quot;+ Buat Sub Folder Baru&quot; di atas untuk menambahkan sub-folder ke folder ini.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ─── MODAL: TAMBAH FOLDER BARU ─── */}
      {isAddFolderOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 28, 44, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setIsAddFolderOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#071c2c' }}>
                  Tambah Folder Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddFolderOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Nama Folder <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 16. Supply Chain Management"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Kategori Folder
                </label>
                <select
                  value={newFolderCategory}
                  onChange={e => setNewFolderCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="HEAD_OFFICE">Head Office</option>
                  <option value="OFFSHORE">Offshore &amp; Vessel</option>
                  <option value="PROJECT_SITE">Project Site</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Deskripsi / Keterangan Folder
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan singkat mengenai cakupan dokumen dalam folder ini..."
                  value={newFolderDesc}
                  onChange={e => setNewFolderDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddFolderOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '12.5px',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#071c2c',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Simpan Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: TAMBAH SUB FOLDER ─── */}
      {isAddSubFolderOpen && targetParentFolder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 28, 44, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => {
            setIsAddSubFolderOpen(false);
            setTargetParentFolder(null);
            setTargetParentSubFolder(null);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CornerDownRight size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#071c2c' }}>
                  {targetParentSubFolder ? 'Tambah Sub-Folder (Level 2)' : 'Tambah Sub Folder'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddSubFolderOpen(false);
                  setTargetParentFolder(null);
                  setTargetParentSubFolder(null);
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubFolder} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Folder Utama:</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{targetParentFolder.name}</span>
                </div>
                {targetParentSubFolder && (
                  <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '11px', color: '#d97706', display: 'block', fontWeight: 700 }}>
                      ↳ Sub-Folder Induk (Lokasi Penempatan):
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#92400e' }}>
                      {targetParentSubFolder.name}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Nama Sub Folder Baru <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={targetParentSubFolder ? `Contoh: ${targetParentSubFolder.name.split(' ')[0]}.1 Prosedur Khusus...` : 'Contoh: 1.3 Standar Operasional Tambahan...'}
                  value={newSubFolderName}
                  onChange={e => setNewSubFolderName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddSubFolderOpen(false);
                    setTargetParentFolder(null);
                    setTargetParentSubFolder(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '12.5px',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Simpan Sub Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Minimalist Document Preview Modal ─── */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 28, 44, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setPreviewDoc(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              width: '100%',
              maxWidth: '680px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              animation: 'fadeIn 0.18s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 22px',
                borderBottom: '1px solid #f1f5f9',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src="/thi-logo-official.png"
                  alt="THI Logo"
                  style={{ height: 20, width: 'auto', objectFit: 'contain' }}
                />
                <div style={{ height: '16px', width: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', letterSpacing: '0.04em' }}>
                  CONTROLLED DOCUMENT VIEWER
                </span>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs Header: Info vs Riwayat Revisi */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                background: '#fafcff',
                padding: '0 22px',
              }}
            >
              <button
                type="button"
                onClick={() => setModalTab('info')}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: modalTab === 'info' ? '2px solid #0284c7' : '2px solid transparent',
                  color: modalTab === 'info' ? '#0284c7' : '#64748b',
                  fontSize: '13px',
                  fontWeight: modalTab === 'info' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={15} />
                <span>Informasi Dokumen</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('history')}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: modalTab === 'history' ? '2px solid #0284c7' : '2px solid transparent',
                  color: modalTab === 'history' ? '#0284c7' : '#64748b',
                  fontSize: '13px',
                  fontWeight: modalTab === 'history' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <History size={15} />
                <span>Riwayat Revisi &amp; Change Log ({getDocRevisionHistory(previewDoc).length})</span>
              </button>
            </div>

            {/* Modal Body: Info Tab */}
            {modalTab === 'info' && (
              <div style={{ padding: '22px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#0284c7',
                      background: '#f0f9ff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {previewDoc.number}
                  </span>
                  <h2
                    style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: '#071c2c',
                      margin: '10px 0 6px 0',
                      lineHeight: 1.35,
                    }}
                  >
                    {previewDoc.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                    <span>Tipe: {previewDoc.type}</span>
                    <span>•</span>
                    <span>Klasifikasi: {previewDoc.classification}</span>
                    <span>•</span>
                    <span>Ukuran: {previewDoc.size}</span>
                  </div>
                </div>

                {/* Meta Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Revisi Terbit</span>
                    <strong style={{ color: '#1e293b', fontFamily: 'var(--font-mono)' }}>{previewDoc.revision}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Tanggal Efektif</span>
                    <strong style={{ color: '#1e293b' }}>{previewDoc.effectiveDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Siklus Kaji Ulang</span>
                    <strong style={{ color: '#1e293b' }}>{previewDoc.reviewDate}</strong>
                  </div>
                </div>

                {/* Document Simulator Pane */}
                <div
                  style={{
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    background: '#fafafa',
                  }}
                >
                  <FileText size={28} color="#071c2c" style={{ margin: '0 auto 8px auto', strokeWidth: 1.5 }} />
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: '0 0 4px 0' }}>
                    Dokumen Kendali Terverifikasi Sistem
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, maxWidth: '420px', marginInline: 'auto' }}>
                    Dokumen ini tersimpan secara aman dalam arsip DMS PT Taka Hydrocore Indonesia dengan tanda air kendali mutu.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Body: History & Change Log Tab */}
            {modalTab === 'history' && (
              <div style={{ padding: '22px', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Nomor Dokumen:</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#071c2c', marginTop: '2px' }}>
                    {previewDoc.number} · {previewDoc.title}
                  </div>
                </div>

                {/* Revision Timeline List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {getDocRevisionHistory(previewDoc).map((revItem, rIdx) => (
                    <div
                      key={rIdx}
                      style={{
                        background: revItem.isCurrent ? '#f0f9ff' : '#ffffff',
                        border: revItem.isCurrent ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '16px 18px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {/* Top Row: Revision Badge, Status, Date */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '12.5px',
                              fontWeight: 800,
                              color: revItem.isCurrent ? '#0284c7' : '#475569',
                              background: revItem.isCurrent ? '#e0f2fe' : '#f1f5f9',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: revItem.isCurrent ? '1px solid #bae6fd' : '1px solid #cbd5e1',
                            }}
                          >
                            {revItem.rev}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              color: revItem.isCurrent ? '#15803d' : '#64748b',
                              background: revItem.isCurrent ? '#dcfce7' : '#f1f5f9',
                              border: revItem.isCurrent ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                            }}
                          >
                            {revItem.isCurrent ? 'CURRENT (Aktif)' : 'SUPERSEDED (Diarsipkan)'}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Tanggal Rilis: <strong>{revItem.date}</strong>
                        </div>
                      </div>

                      {/* Catatan / Note Apa Yang Diganti */}
                      <div
                        style={{
                          background: revItem.isCurrent ? '#ffffff' : '#f8fafc',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#071c2c', marginBottom: '3px' }}>
                          📝 Catatan &amp; Uraian Perubahan (Change Notes):
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.45 }}>
                          {revItem.notes}
                        </div>
                      </div>

                      {/* Bottom Info: Author, Approver & Download */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '11.5px', color: '#64748b' }}>
                        <div>
                          Disiapkan oleh: <strong style={{ color: '#0f172a' }}>{revItem.author}</strong> · Disetujui: <strong style={{ color: '#0f172a' }}>{revItem.approver}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`Mengunduh arsip versi ${revItem.rev} untuk dokumen ${previewDoc.number}`)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#0284c7',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Download size={11} />
                          <span>Unduh Berkas {revItem.rev}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '14px 22px',
                borderTop: '1px solid #f1f5f9',
                background: '#fafafa',
              }}
            >
              <button
                onClick={() => setPreviewDoc(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  alert(`Mengunduh file resmi ${previewDoc.number}`);
                  setPreviewDoc(null);
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#071c2c',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={13} />
                Unduh Dokumen Asli ({previewDoc.fileExt.toUpperCase()})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
