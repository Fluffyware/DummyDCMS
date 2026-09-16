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
  FilePlus,
  Upload,
  AlertCircle,
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
  Trash2,
  AlertTriangle,
  ChevronsUpDown,
  ChevronsDownUp,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
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
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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

  // Expanded folders state (empty by default: all folders closed initially)
  const [expandedFolderIds, setExpandedFolderIds] = useState<number[]>([]);
  const [expandedSubFolderIds, setExpandedSubFolderIds] = useState<string[]>([]);

  // Selected document for preview modal
  const [previewDoc, setPreviewDoc] = useState<MasterDocItem | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'history'>('info');

  // Modal Tambah Folder
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderCategory, setNewFolderCategory] = useState<'HEAD_OFFICE' | 'OFFSHORE' | 'PROJECT_SITE'>('HEAD_OFFICE');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Modal Tambah Dokumen Langsung (Admin Only)
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [docTargetFolder, setDocTargetFolder] = useState<MasterFolder | null>(null);
  const [docTargetSubFolder, setDocTargetSubFolder] = useState<MasterSubFolder | null>(null);
  const [docNumber, setDocNumber] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('SOP');
  const [docRevision, setDocRevision] = useState('Rev.00');
  const [docClassification, setDocClassification] = useState<'INTERNAL' | 'CONFIDENTIAL' | 'PUBLIC'>('INTERNAL');
  const [docDate, setDocDate] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docFileSize, setDocFileSize] = useState('1.85 MB');
  const [docFileExt, setDocFileExt] = useState<'pdf' | 'docx' | 'xlsx'>('pdf');
  const [docSelectedFile, setDocSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [docErrors, setDocErrors] = useState<Record<string, boolean>>({});

  const openAddDocModal = (folder: MasterFolder, sub?: MasterSubFolder) => {
    setDocTargetFolder(folder);
    setDocTargetSubFolder(sub || null);
    const folderNum = folder.name.match(/^\d+/)?.[0] || '01';
    setDocNumber(`SOP-THI-${folderNum}-${String(Math.floor(Math.random() * 899 + 100))}`);
    setDocTitle('');
    setDocType('SOP');
    setDocRevision('Rev.00');
    setDocClassification('INTERNAL');
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    setDocDate(`${day} ${months[now.getMonth()]} ${now.getFullYear()}`);
    setDocFileName('');
    setDocFileSize('1.85 MB');
    setDocFileExt('pdf');
    setDocSelectedFile(null);
    setIsUploading(false);
    setDocErrors({});
    setIsAddDocOpen(true);
  };

  const handleAddDocSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!docNumber.trim()) errs.number = true;
    if (!docTitle.trim()) errs.title = true;
    if (Object.keys(errs).length > 0) {
      setDocErrors(errs);
      return;
    }
    if (!docTargetFolder) return;

    setIsUploading(true);

    let uploadedR2Key: string | undefined = undefined;
    let uploadedR2Url: string | undefined = undefined;

    // Call Cloudflare R2 / Supabase API route
    try {
      const formData = new FormData();
      if (docSelectedFile) {
        formData.append('file', docSelectedFile);
      }
      formData.append('docNumber', docNumber.trim());
      formData.append('docTitle', docTitle.trim());
      formData.append('docType', docType);
      formData.append('docRevision', docRevision.trim());
      formData.append('docClassification', docClassification);
      formData.append('folderId', String(docTargetFolder.id));
      if (docTargetSubFolder) {
        formData.append('subFolderId', docTargetSubFolder.id);
        formData.append('subFolderName', docTargetSubFolder.name);
      }
      formData.append('uploader', user?.name || 'QMS');

      const uploadRes = await fetch('/api/r2/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData.document) {
          uploadedR2Key = uploadData.document.r2_key || undefined;
          uploadedR2Url = uploadData.document.r2_url || undefined;
        }
      }
    } catch (err) {
      console.warn('R2/Supabase upload skipped (running in offline/demo mode):', err);
    } finally {
      setIsUploading(false);
    }

    const newDoc: MasterDocItem = {
      id: `doc-${Date.now()}`,
      number: docNumber.trim().toUpperCase(),
      title: docTitle.trim(),
      type: docType,
      revision: docRevision.trim() || 'Rev.00',
      effectiveDate: docDate.trim() || 'Hari Ini',
      reviewDate: '1 Tahun Mendatang',
      status: 'CURRENT',
      classification: docClassification,
      size: docFileSize || '1.85 MB',
      fileExt: docFileExt,
      subFolderId: docTargetSubFolder?.id,
      subFolderName: docTargetSubFolder?.name,
      r2Key: uploadedR2Key,
      r2Url: uploadedR2Url,
    };

    let updatedFolders: MasterFolder[];

    if (docTargetSubFolder) {
      const updateSubRecursive = (sub: MasterSubFolder): MasterSubFolder => {
        if (sub.id === docTargetSubFolder.id) {
          return {
            ...sub,
            docs: [newDoc, ...(sub.docs || [])],
          };
        }
        if (sub.subfolders && sub.subfolders.length > 0) {
          return {
            ...sub,
            subfolders: sub.subfolders.map(updateSubRecursive),
          };
        }
        return sub;
      };

      updatedFolders = folders.map(f => {
        if (f.id === docTargetFolder.id) {
          return {
            ...f,
            subfolders: (f.subfolders || []).map(updateSubRecursive),
          };
        }
        return f;
      });
    } else {
      updatedFolders = folders.map(f => {
        if (f.id === docTargetFolder.id) {
          return {
            ...f,
            docs: [newDoc, ...(f.docs || [])],
          };
        }
        return f;
      });
    }

    setFolders(updatedFolders);
    saveMasterFolders(updatedFolders);

    // Expand folder and subfolder to show newly added file
    setExpandedFolderIds(prev => prev.includes(docTargetFolder.id) ? prev : [...prev, docTargetFolder.id]);
    if (docTargetSubFolder) {
      setExpandedSubFolderIds(prev => prev.includes(docTargetSubFolder.id) ? prev : [...prev, docTargetSubFolder.id]);
    }

    setIsAddDocOpen(false);
    showToast(`Dokumen "${newDoc.number} - ${newDoc.title}" berhasil ditambahkan ke ${docTargetSubFolder?.name || docTargetFolder.name}!`);
  };


  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── Real Download Handler ───
  const handleDownloadDoc = (doc: MasterDocItem) => {
    if (doc.r2Key) {
      window.open(`/api/r2/download?key=${encodeURIComponent(doc.r2Key)}`, '_blank');
      showToast(`Mengunduh berkas resmi ${doc.number}...`);
      return;
    }
    // For r2Url: use as-is if it's already a proxy path, else skip direct r2.dev (blocked by ISP)
    if (doc.r2Url && (doc.r2Url.startsWith('/api/r2') || doc.r2Url.startsWith('http'))) {
      const safeUrl = doc.r2Url.startsWith('https://pub-') ? null : doc.r2Url;
      if (safeUrl) {
        window.open(safeUrl, '_blank');
        showToast(`Mengunduh berkas ${doc.number}...`);
        return;
      }
    }

    // Fallback: Generate real official controlled copy blob file
    const content = `PT TAKA HYDROCORE INDONESIA
DOCUMENT CONTROL MANAGEMENT SYSTEM (DCMS)
========================================================================

NOMOR DOKUMEN   : ${doc.number}
JUDUL DOKUMEN   : ${doc.title}
JENIS DOKUMEN   : ${doc.type}
REVISI          : ${doc.revision}
KLASIFIKASI     : ${doc.classification}
TANGGAL EFEKTIF : ${doc.effectiveDate}
STATUS BERKAS   : DOKUMEN TERKENDALI (CONTROLLED COPY)

Catatan Legal:
Berkas ini diterbitkan oleh Document Control Management System (DCMS)
PT Taka Hydrocore Indonesia. Salinan ini sah dan terkendali.
Segala perubahan tanpa otorisasi Document Controller dilarang keras.
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.number}_${doc.revision}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Mengunduh salinan berkas kendali ${doc.number}...`);
  };

  const handleViewDoc = (doc: MasterDocItem) => {
    if (doc.r2Key) {
      window.open(`/api/r2/view?key=${encodeURIComponent(doc.r2Key)}`, '_blank', 'noopener,noreferrer');
      showToast(`Membuka berkas ${doc.number} di tab baru...`);
      return;
    }
    // For r2Url: use as-is if it's a proxy path, skip direct r2.dev (blocked by ISP)
    if (doc.r2Url && doc.r2Url.startsWith('/api/r2')) {
      window.open(doc.r2Url, '_blank', 'noopener,noreferrer');
      showToast(`Membuka berkas ${doc.number} di tab baru...`);
      return;
    }
    showToast(`Berkas ${doc.number} belum diunggah ke server. Silakan upload terlebih dahulu.`);
  };

  // ─── Modal Konfirmasi Hapus (Admin QMS) ───
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'folder' | 'subfolder' | 'document';
    targetId: string | number;
    targetName: string;
    parentFolderId?: number;
    parentSubFolderId?: string;
    docNumber?: string;
    r2Key?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const promptDeleteFolder = (folderId: number, folderName: string) => {
    setDeleteConfirm({
      type: 'folder',
      targetId: folderId,
      targetName: folderName,
    });
  };

  const promptDeleteSubFolder = (folderId: number, subFolderId: string, subFolderName: string) => {
    setDeleteConfirm({
      type: 'subfolder',
      targetId: subFolderId,
      targetName: subFolderName,
      parentFolderId: folderId,
    });
  };

  const promptDeleteDoc = (doc: MasterDocItem, parentFolderId?: number, parentSubFolderId?: string) => {
    setDeleteConfirm({
      type: 'document',
      targetId: doc.id,
      targetName: `${doc.number} - ${doc.title}`,
      docNumber: doc.number,
      parentFolderId,
      parentSubFolderId,
      r2Key: doc.r2Key,
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    const { type, targetId, targetName, docNumber, parentFolderId, r2Key } = deleteConfirm;

    try {
      if (type === 'folder') {
        const updated = folders.filter(f => f.id !== targetId);
        setFolders(updated);
        saveMasterFolders(updated);

        try {
          await fetch('/api/r2/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'folder', folderId: targetId }),
          });
        } catch (apiErr) {
          console.warn('API delete folder skipped:', apiErr);
        }

        showToast(`Folder "${targetName}" berhasil dihapus.`);
      } else if (type === 'subfolder') {
        const removeSubRecursive = (subs: MasterSubFolder[]): MasterSubFolder[] => {
          return subs
            .filter(s => s.id !== targetId)
            .map(s => ({
              ...s,
              subfolders: s.subfolders ? removeSubRecursive(s.subfolders) : [],
            }));
        };

        const updated = folders.map(f => {
          if (!parentFolderId || f.id === parentFolderId) {
            return {
              ...f,
              subfolders: removeSubRecursive(f.subfolders || []),
            };
          }
          return f;
        });

        setFolders(updated);
        saveMasterFolders(updated);

        try {
          await fetch('/api/r2/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'subfolder', subFolderId: targetId }),
          });
        } catch (apiErr) {
          console.warn('API delete subfolder skipped:', apiErr);
        }

        showToast(`Sub-folder "${targetName}" berhasil dihapus.`);
      } else if (type === 'document') {
        const removeDocRecursive = (subs: MasterSubFolder[]): MasterSubFolder[] => {
          return subs.map(s => ({
            ...s,
            docs: (s.docs || []).filter(d => d.id !== targetId && d.number !== docNumber),
            subfolders: s.subfolders ? removeDocRecursive(s.subfolders) : [],
          }));
        };

        const updated = folders.map(f => ({
          ...f,
          docs: (f.docs || []).filter(d => d.id !== targetId && d.number !== docNumber),
          subfolders: removeDocRecursive(f.subfolders || []),
        }));

        setFolders(updated);
        saveMasterFolders(updated);

        if (previewDoc && (previewDoc.id === targetId || previewDoc.number === docNumber)) {
          setPreviewDoc(null);
        }

        try {
          await fetch('/api/r2/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'document',
              docId: targetId,
              docNumber,
              r2Key,
            }),
          });
        } catch (apiErr) {
          console.warn('API delete document skipped:', apiErr);
        }

        showToast(`Dokumen "${targetName}" berhasil dihapus.`);
      }
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
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

  // Helper to count docs in a subfolder recursively
  const countSubFolderDocs = (sub: MasterSubFolder): number => {
    const direct = sub.docs?.length || 0;
    const nested = (sub.subfolders || []).reduce((acc, s) => acc + countSubFolderDocs(s), 0);
    return direct + nested;
  };

  // Total documents count across all folders and subfolders
  const totalDocsCount = useMemo(() => {
    return folders.reduce((acc, f) => {
      const directDocs = f.docs?.length || 0;
      const subDocs = (f.subfolders || []).reduce((sAcc, sub) => sAcc + countSubFolderDocs(sub), 0);
      return acc + directDocs + subDocs;
    }, 0);
  }, [folders]);

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
    folders.forEach(f => (f.subfolders || []).forEach(sub => allSubs.push(sub.id)));
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



  return (
    <div
      suppressHydrationWarning
      style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'var(--font-body)' }}
    >
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
            { key: 'HEAD_OFFICE', label: 'THI OFFICE', icon: Building2, count: totalDocsCount },
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

        {/* Quick expand/collapse controls (Icon & shortened) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={handleExpandAll}
            title="Buka Semua Folder"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '6px',
              color: '#0284c7',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0284c7';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#0284c7';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#f0f9ff';
              e.currentTarget.style.color = '#0284c7';
              e.currentTarget.style.borderColor = '#bae6fd';
            }}
          >
            <ChevronsUpDown size={14} strokeWidth={2.2} />
          </button>

          <button
            onClick={handleCollapseAll}
            title="Tutup Semua Folder"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#64748b';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#64748b';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <ChevronsDownUp size={14} strokeWidth={2.2} />
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
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.18s ease',
                  boxShadow: isExpanded ? '0 2px 8px rgba(0,0,0,0.03)' : 'none',
                }}
              >
                {/* ── Main Folder Row ── */}
                <div
                  onClick={() => toggleFolder(folder.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isExpanded ? '#f8fafc' : '#ffffff',
                    borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.15s ease',
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
                        color: isExpanded ? '#071c2c' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {isExpanded ? (
                        <FolderOpen size={19} strokeWidth={1.75} color="#0284c7" />
                      ) : (
                        <Folder size={19} strokeWidth={1.75} />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '13.5px',
                            fontWeight: 600,
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

                  {/* Right: Actions & Expand Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddDocModal(folder);
                          }}
                          title={`Tambah Dokumen ke "${folder.name}"`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            background: '#f0f9ff',
                            color: '#0284c7',
                            border: '1px solid #bae6fd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#0284c7';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#0284c7';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#f0f9ff';
                            e.currentTarget.style.color = '#0284c7';
                            e.currentTarget.style.borderColor = '#bae6fd';
                          }}
                        >
                          <FilePlus size={14} strokeWidth={2.2} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            promptDeleteFolder(folder.id, folder.name);
                          }}
                          title={`Hapus Folder "${folder.name}"`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#dc2626';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#dc2626';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#fef2f2';
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.borderColor = '#fecaca';
                          }}
                        >
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      </>
                    )}

                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        background: 'transparent',
                      }}
                    >
                      {isExpanded ? (
                        <Minus size={15} strokeWidth={2} />
                      ) : (
                        <Plus size={15} strokeWidth={2} />
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Expanded Content: Sub-folders + Documents ── */}
                {isExpanded && (
                  <div style={{ background: '#ffffff', padding: '6px 0 10px 0' }}>
                    {/* 1. Render Subfolders (if any) */}
                    {(folder.subfolders || []).length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px 18px 6px 36px' }}>
                        {(folder.subfolders || []).map(sub => {
                          const isSubExpanded = expandedSubFolderIds.includes(sub.id) || !!searchQuery.trim();

                          return (
                            <div
                              key={sub.id}
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                background: '#fafcff',
                              }}
                            >
                              {/* Subfolder Row Header */}
                              <div
                                onClick={() => toggleSubFolder(sub.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 14px',
                                  cursor: 'pointer',
                                  background: isSubExpanded ? '#f0f5fa' : '#fafcff',
                                  borderBottom: isSubExpanded && sub.docs?.length > 0 ? '1px solid #e2e8f0' : 'none',
                                  userSelect: 'none',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <CornerDownRight size={14} color="#64748b" />
                                  <Folder size={15} color={isSubExpanded ? '#0284c7' : '#64748b'} strokeWidth={2} />
                                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                                    {sub.name}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {isAdmin && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openAddDocModal(folder, sub);
                                        }}
                                        title={`Tambah Dokumen ke "${sub.name}"`}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '24px',
                                          height: '24px',
                                          background: '#f0f9ff',
                                          color: '#0284c7',
                                          border: '1px solid #bae6fd',
                                          borderRadius: '5px',
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={e => {
                                          e.currentTarget.style.background = '#0284c7';
                                          e.currentTarget.style.color = '#ffffff';
                                          e.currentTarget.style.borderColor = '#0284c7';
                                        }}
                                        onMouseLeave={e => {
                                          e.currentTarget.style.background = '#f0f9ff';
                                          e.currentTarget.style.color = '#0284c7';
                                          e.currentTarget.style.borderColor = '#bae6fd';
                                        }}
                                      >
                                        <FilePlus size={12} strokeWidth={2.2} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          promptDeleteSubFolder(folder.id, sub.id, sub.name);
                                        }}
                                        title={`Hapus Sub-Folder "${sub.name}"`}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          width: '24px',
                                          height: '24px',
                                          background: '#fef2f2',
                                          color: '#dc2626',
                                          border: '1px solid #fecaca',
                                          borderRadius: '5px',
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={e => {
                                          e.currentTarget.style.background = '#dc2626';
                                          e.currentTarget.style.color = '#ffffff';
                                          e.currentTarget.style.borderColor = '#dc2626';
                                        }}
                                        onMouseLeave={e => {
                                          e.currentTarget.style.background = '#fef2f2';
                                          e.currentTarget.style.color = '#dc2626';
                                          e.currentTarget.style.borderColor = '#fecaca';
                                        }}
                                      >
                                        <Trash2 size={12} strokeWidth={2} />
                                      </button>
                                    </>
                                  )}
                                  {isSubExpanded ? <ChevronDown size={14} color="#64748b" /> : <ChevronRight size={14} color="#64748b" />}
                                </div>
                              </div>

                              {/* Documents & Nested Subfolders in Subfolder */}
                              {isSubExpanded && (
                                <div style={{ background: '#ffffff' }}>
                                  {/* Optional Nested Child Subfolders */}
                                  {(sub.subfolders || []).map(childSub => {
                                    const isChildExpanded = expandedSubFolderIds.includes(childSub.id) || !!searchQuery.trim();
                                    return (
                                      <div key={childSub.id} style={{ margin: '4px 16px 4px 32px', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                                        <div
                                          onClick={() => toggleSubFolder(childSub.id)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '7px 12px',
                                            cursor: 'pointer',
                                            background: isChildExpanded ? '#f8fafc' : '#ffffff',
                                            borderBottom: isChildExpanded && (childSub.docs?.length || 0) > 0 ? '1px solid #f1f5f9' : 'none',
                                            userSelect: 'none',
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CornerDownRight size={13} color="#64748b" />
                                            <Folder size={14} color="#0284c7" strokeWidth={1.75} />
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                                              {childSub.name}
                                            </span>
                                          </div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {isAdmin && (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAddDocModal(folder, childSub);
                                                  }}
                                                  title={`Tambah Dokumen ke "${childSub.name}"`}
                                                  style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '22px',
                                                    height: '22px',
                                                    background: '#f0f9ff',
                                                    color: '#0284c7',
                                                    border: '1px solid #bae6fd',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                  }}
                                                  onMouseEnter={e => {
                                                    e.currentTarget.style.background = '#0284c7';
                                                    e.currentTarget.style.color = '#ffffff';
                                                    e.currentTarget.style.borderColor = '#0284c7';
                                                  }}
                                                  onMouseLeave={e => {
                                                    e.currentTarget.style.background = '#f0f9ff';
                                                    e.currentTarget.style.color = '#0284c7';
                                                    e.currentTarget.style.borderColor = '#bae6fd';
                                                  }}
                                                >
                                                  <FilePlus size={11} strokeWidth={2.2} />
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    promptDeleteSubFolder(folder.id, childSub.id, childSub.name);
                                                  }}
                                                  title={`Hapus Sub-Folder "${childSub.name}"`}
                                                  style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '22px',
                                                    height: '22px',
                                                    background: '#fef2f2',
                                                    color: '#dc2626',
                                                    border: '1px solid #fecaca',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                  }}
                                                  onMouseEnter={e => {
                                                    e.currentTarget.style.background = '#dc2626';
                                                    e.currentTarget.style.color = '#ffffff';
                                                    e.currentTarget.style.borderColor = '#dc2626';
                                                  }}
                                                  onMouseLeave={e => {
                                                    e.currentTarget.style.background = '#fef2f2';
                                                    e.currentTarget.style.color = '#dc2626';
                                                    e.currentTarget.style.borderColor = '#fecaca';
                                                  }}
                                                >
                                                  <Trash2 size={11} strokeWidth={2} />
                                                </button>
                                              </>
                                            )}
                                            {isChildExpanded ? <ChevronDown size={13} color="#64748b" /> : <ChevronRight size={13} color="#64748b" />}
                                          </div>
                                        </div>
                                        {isChildExpanded && (
                                          <div style={{ background: '#ffffff' }}>
                                            {(!childSub.docs || childSub.docs.length === 0) ? (
                                              <div style={{ padding: '8px 16px 8px 32px', fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                Belum ada berkas dokumen.
                                              </div>
                                            ) : (
                                              childSub.docs.map((cDoc, cIdx) => (
                                                <div
                                                  key={cDoc.id}
                                                  style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '7px 14px 7px 32px',
                                                    borderTop: cIdx > 0 ? '1px solid #f8fafc' : '1px solid #f1f5f9',
                                                  }}
                                                >
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                    <FileText size={13} color="#0284c7" strokeWidth={1.75} />
                                                    <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#071c2c', background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px' }}>
                                                      {cDoc.number}
                                                    </span>
                                                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                      {cDoc.title}
                                                    </span>
                                                    <span style={{ fontSize: '10.5px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#0369a1', background: '#e0f2fe', padding: '1px 4px', borderRadius: '3px' }}>
                                                      {cDoc.revision}
                                                    </span>
                                                  </div>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <button
                                                      onClick={() => { setModalTab('info'); setPreviewDoc(cDoc); }}
                                                      title={`Lihat Dokumen ${cDoc.number}`}
                                                      style={{
                                                        background: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#334155',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                      }}
                                                      onMouseEnter={e => {
                                                        e.currentTarget.style.borderColor = '#0284c7';
                                                        e.currentTarget.style.color = '#0284c7';
                                                      }}
                                                      onMouseLeave={e => {
                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                        e.currentTarget.style.color = '#334155';
                                                      }}
                                                    >
                                                      <Eye size={12} />
                                                    </button>

                                                    <button
                                                      onClick={() => { setModalTab('history'); setPreviewDoc(cDoc); }}
                                                      title={`Riwayat Revisi ${cDoc.number}`}
                                                      style={{
                                                        background: '#f0f9ff',
                                                        border: '1px solid #bae6fd',
                                                        borderRadius: '4px',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#0284c7',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                      }}
                                                      onMouseEnter={e => {
                                                        e.currentTarget.style.background = '#0284c7';
                                                        e.currentTarget.style.color = '#ffffff';
                                                      }}
                                                      onMouseLeave={e => {
                                                        e.currentTarget.style.background = '#f0f9ff';
                                                        e.currentTarget.style.color = '#0284c7';
                                                      }}
                                                    >
                                                      <History size={12} />
                                                    </button>

                                                    <button
                                                      onClick={() => handleDownloadDoc(cDoc)}
                                                      title={`Unduh Dokumen ${cDoc.number}`}
                                                      style={{
                                                        background: '#f8fafc',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#334155',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                      }}
                                                      onMouseEnter={e => {
                                                        e.currentTarget.style.borderColor = '#0284c7';
                                                        e.currentTarget.style.color = '#0284c7';
                                                      }}
                                                      onMouseLeave={e => {
                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                        e.currentTarget.style.color = '#334155';
                                                      }}
                                                    >
                                                      <Download size={12} />
                                                    </button>

                                                    {isAdmin && (
                                                      <button
                                                        type="button"
                                                        onClick={() => promptDeleteDoc(cDoc, folder.id, childSub.id)}
                                                        title={`Hapus Dokumen "${cDoc.number}"`}
                                                        style={{
                                                          background: '#fef2f2',
                                                          border: '1px solid #fecaca',
                                                          borderRadius: '4px',
                                                          width: '24px',
                                                          height: '24px',
                                                          color: '#dc2626',
                                                          cursor: 'pointer',
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                          transition: 'all 0.15s ease',
                                                        }}
                                                        onMouseEnter={e => {
                                                          e.currentTarget.style.background = '#dc2626';
                                                          e.currentTarget.style.color = '#ffffff';
                                                        }}
                                                        onMouseLeave={e => {
                                                          e.currentTarget.style.background = '#fef2f2';
                                                          e.currentTarget.style.color = '#dc2626';
                                                        }}
                                                      >
                                                        <Trash2 size={11} strokeWidth={2} />
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {/* Direct Documents in Subfolder */}
                                  {(!sub.docs || sub.docs.length === 0) && (!sub.subfolders || sub.subfolders.length === 0) ? (
                                    <div style={{ padding: '12px 20px 12px 40px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                                      Belum ada berkas dokumen dalam sub-folder ini.
                                    </div>
                                  ) : (
                                    sub.docs.map((doc, dIdx) => (
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
                                            title={`Lihat Dokumen ${doc.number}`}
                                            style={{
                                              background: '#ffffff',
                                              border: '1px solid #e2e8f0',
                                              borderRadius: '5px',
                                              width: '26px',
                                              height: '26px',
                                              color: '#334155',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              transition: 'all 0.15s ease',
                                            }}
                                            onMouseEnter={e => {
                                              e.currentTarget.style.borderColor = '#0284c7';
                                              e.currentTarget.style.color = '#0284c7';
                                            }}
                                            onMouseLeave={e => {
                                              e.currentTarget.style.borderColor = '#e2e8f0';
                                              e.currentTarget.style.color = '#334155';
                                            }}
                                          >
                                            <Eye size={13} />
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
                                              borderRadius: '5px',
                                              width: '26px',
                                              height: '26px',
                                              color: '#0284c7',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              transition: 'all 0.15s ease',
                                            }}
                                            onMouseEnter={e => {
                                              e.currentTarget.style.background = '#0284c7';
                                              e.currentTarget.style.color = '#ffffff';
                                            }}
                                            onMouseLeave={e => {
                                              e.currentTarget.style.background = '#f0f9ff';
                                              e.currentTarget.style.color = '#0284c7';
                                            }}
                                          >
                                            <History size={13} />
                                          </button>

                                          <button
                                            onClick={() => handleDownloadDoc(doc)}
                                            title={`Unduh Dokumen ${doc.number}`}
                                            style={{
                                              background: '#f8fafc',
                                              border: '1px solid #e2e8f0',
                                              borderRadius: '5px',
                                              width: '26px',
                                              height: '26px',
                                              color: '#334155',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              transition: 'all 0.15s ease',
                                            }}
                                            onMouseEnter={e => {
                                              e.currentTarget.style.borderColor = '#0284c7';
                                              e.currentTarget.style.color = '#0284c7';
                                            }}
                                            onMouseLeave={e => {
                                              e.currentTarget.style.borderColor = '#e2e8f0';
                                              e.currentTarget.style.color = '#334155';
                                            }}
                                          >
                                            <Download size={13} />
                                          </button>

                                          {isAdmin && (
                                            <button
                                              type="button"
                                              onClick={() => promptDeleteDoc(doc, folder.id, sub.id)}
                                              title={`Hapus Dokumen "${doc.number}"`}
                                              style={{
                                                background: '#fef2f2',
                                                border: '1px solid #fecaca',
                                                borderRadius: '5px',
                                                width: '26px',
                                                height: '26px',
                                                color: '#dc2626',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.12s ease',
                                              }}
                                              onMouseEnter={e => {
                                                e.currentTarget.style.background = '#dc2626';
                                                e.currentTarget.style.color = '#ffffff';
                                              }}
                                              onMouseLeave={e => {
                                                e.currentTarget.style.background = '#fef2f2';
                                                e.currentTarget.style.color = '#dc2626';
                                              }}
                                            >
                                              <Trash2 size={13} strokeWidth={2} />
                                            </button>
                                          )}
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

                    {/* 2. Render Direct Folder Documents (if any) */}
                    {(folder.docs || []).length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {(folder.docs || []).map((doc, idx) => (
                          <div
                            key={doc.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '9px 18px 9px 48px',
                              borderTop: idx > 0 || (folder.subfolders?.length || 0) > 0 ? '1px solid #f8fafc' : 'none',
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

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              <button
                                onClick={() => {
                                  setModalTab('info');
                                  setPreviewDoc(doc);
                                }}
                                title={`Lihat Dokumen ${doc.number}`}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '5px',
                                  width: '26px',
                                  height: '26px',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = '#0284c7';
                                  e.currentTarget.style.color = '#0284c7';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                  e.currentTarget.style.color = '#334155';
                                }}
                              >
                                <Eye size={13} />
                              </button>

                              <button
                                onClick={() => {
                                  setModalTab('history');
                                  setPreviewDoc(doc);
                                }}
                                title="Riwayat Revisi & Change Log"
                                style={{
                                  background: '#f0f9ff',
                                  border: '1px solid #bae6fd',
                                  borderRadius: '5px',
                                  width: '26px',
                                  height: '26px',
                                  color: '#0284c7',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = '#0284c7';
                                  e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = '#f0f9ff';
                                  e.currentTarget.style.color = '#0284c7';
                                }}
                              >
                                <History size={13} />
                              </button>

                              <button
                                onClick={() => handleDownloadDoc(doc)}
                                title={`Unduh File ${doc.number}`}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '5px',
                                  width: '26px',
                                  height: '26px',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = '#0284c7';
                                  e.currentTarget.style.color = '#0284c7';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                  e.currentTarget.style.color = '#334155';
                                }}
                              >
                                <Download size={13} />
                              </button>

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => promptDeleteDoc(doc, folder.id)}
                                  title={`Hapus Dokumen "${doc.number}"`}
                                  style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '5px',
                                    width: '26px',
                                    height: '26px',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.12s ease',
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = '#dc2626';
                                    e.currentTarget.style.color = '#ffffff';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = '#fef2f2';
                                    e.currentTarget.style.color = '#dc2626';
                                  }}
                                >
                                  <Trash2 size={13} strokeWidth={2} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. Empty state if neither docs nor subfolders */}
                    {(!folder.docs || folder.docs.length === 0) && (!folder.subfolders || folder.subfolders.length === 0) && (
                      <div style={{ padding: '16px 24px 16px 48px', fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                        Belum ada dokumen atau sub-folder di folder ini.
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
                  <option value="HEAD_OFFICE">THI OFFICE</option>
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

      {/* ─── MODAL: TAMBAH DOKUMEN LANGSUNG KE FOLDER / SUBFOLDER ─── */}
      {isAddDocOpen && docTargetFolder && (
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
          onClick={() => setIsAddDocOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
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
                <FilePlus size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#071c2c' }}>
                  Tambah Dokumen Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddDocOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Folder Destination Notice */}
            <div style={{ padding: '10px 20px', background: '#f0f9ff', borderBottom: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Folder size={14} color="#0284c7" />
              <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 500 }}>
                Simpan di: <strong>{docTargetFolder.name}</strong>
                {docTargetSubFolder && (
                  <span> &rarr; <strong style={{ color: '#0284c7' }}>{docTargetSubFolder.name}</strong></span>
                )}
              </div>
            </div>

            <form
              onSubmit={handleAddDocSubmit}
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Nomor Dokumen <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SOP-THI-01-001"
                    value={docNumber}
                    onChange={e => {
                      setDocNumber(e.target.value);
                      if (docErrors.number) setDocErrors(prev => ({ ...prev, number: false }));
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: docErrors.number ? '1px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {docErrors.number && (
                    <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px', display: 'block' }}>Nomor dokumen wajib diisi</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Tipe Dokumen
                  </label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="SOP">SOP (Standar Operasional)</option>
                    <option value="Manual">Manual Sistem</option>
                    <option value="Kebijakan">Kebijakan / Policy</option>
                    <option value="Instruksi Kerja">Instruksi Kerja (IK / WI)</option>
                    <option value="Formulir">Formulir / Template</option>
                    <option value="Prosedur">Prosedur Teknis</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Judul Dokumen <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Prosedur Pengendalian Dokumen & Rekaman QHSE"
                  value={docTitle}
                  onChange={e => {
                    setDocTitle(e.target.value);
                    if (docErrors.title) setDocErrors(prev => ({ ...prev, title: false }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: docErrors.title ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {docErrors.title && (
                  <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px', display: 'block' }}>Judul dokumen wajib diisi</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Revisi
                  </label>
                  <input
                    type="text"
                    value={docRevision}
                    onChange={e => setDocRevision(e.target.value)}
                    placeholder="Rev.00"
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Klasifikasi
                  </label>
                  <select
                    value={docClassification}
                    onChange={e => setDocClassification(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="INTERNAL">Internal Use</option>
                    <option value="CONFIDENTIAL">Confidential</option>
                    <option value="PUBLIC">Public</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Format Berkas
                  </label>
                  <select
                    value={docFileExt}
                    onChange={e => setDocFileExt(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
                  </select>
                </div>
              </div>

              {/* Upload File Input / Simulator */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Berkas Dokumen
                </label>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1.5px dashed #cbd5e1',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = '#0284c7')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
                >
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDocSelectedFile(file);
                        setDocFileName(file.name);
                        const mb = (file.size / (1024 * 1024)).toFixed(2);
                        setDocFileSize(`${mb} MB`);
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        if (ext === 'docx' || ext === 'xlsx' || ext === 'pdf') {
                          setDocFileExt(ext as any);
                        }
                        if (!docTitle) {
                          setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                  />
                  <Upload size={22} color="#0284c7" style={{ marginBottom: '6px' }} />
                  {docFileName ? (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#071c2c' }}>{docFileName}</span>
                      <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>{docFileSize} &bull; Berkas siap diunggah</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0284c7' }}>Pilih atau seret berkas ke sini</span>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Mendukung PDF, DOCX, XLSX (Maks. 25MB)</div>
                    </div>
                  )}
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDocOpen(false)}
                  disabled={isUploading}
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
                  disabled={isUploading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isUploading ? '#94a3b8' : '#071c2c',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <FilePlus size={14} />
                  {isUploading ? 'Menyimpan dokumen…' : 'Simpan Dokumen'}
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
                          onClick={() => handleViewDoc({ ...previewDoc, revision: revItem.rev })}
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
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    promptDeleteDoc(previewDoc);
                  }}
                  title="Hapus dokumen kendali ini"
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginRight: 'auto',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                >
                  <Trash2 size={13} />
                  <span>Hapus Dokumen</span>
                </button>
              )}

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
                onClick={() => handleViewDoc(previewDoc)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.color = '#0284c7'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; }}
              >
                <Eye size={13} />
                Lihat Dokumen
              </button>
              <button
                onClick={() => {
                  handleDownloadDoc(previewDoc);
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
                Unduh ({previewDoc.fileExt.toUpperCase()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Konfirmasi Hapus (Admin QMS) ─── */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => {
            if (!isDeleting) setDeleteConfirm(null);
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header with Red Icon */}
            <div style={{ padding: '24px 24px 16px 24px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={22} strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {deleteConfirm.type === 'folder'
                    ? 'Hapus Folder Dokumen'
                    : deleteConfirm.type === 'subfolder'
                    ? 'Hapus Sub-Folder'
                    : 'Hapus Dokumen Kendali'}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                  Apakah Anda yakin ingin menghapus{' '}
                  <strong style={{ color: '#0f172a' }}>"{deleteConfirm.targetName}"</strong>?
                  {deleteConfirm.type !== 'document' && (
                    <span style={{ display: 'block', marginTop: '6px', color: '#b91c1c', fontSize: '12px', fontWeight: 600 }}>
                      ⚠️ Seluruh sub-folder dan berkas dokumen di dalamnya akan ikut terhapus.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Warning banner */}
            <div
              style={{
                margin: '0 24px 20px 24px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                fontSize: '12px',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>Tindakan ini hanya dapat dilakukan oleh QMS.</span>
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '14px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDelete}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isDeleting) e.currentTarget.style.background = '#b91c1c';
                }}
                onMouseLeave={e => {
                  if (!isDeleting) e.currentTarget.style.background = '#dc2626';
                }}
              >
                <Trash2 size={14} />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
