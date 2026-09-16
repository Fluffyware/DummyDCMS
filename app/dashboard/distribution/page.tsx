'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Plus,
  ArrowLeft,
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Check,
  FolderPlus,
  RefreshCw,
  Megaphone,
  ShieldAlert,
  Mail,
  Send,
  X,
  Loader2,
  Minus,
  Eye,
  Bell,
  FilePlus,
  ExternalLink,
} from 'lucide-react';
import {
  MasterFolder,
  MasterSubFolder,
  MasterDocItem,
  loadMasterFolders,
  saveMasterFolders,
  getAllFlattenedDocs,
  FlattenedDocItem,
  DistributionDoc,
  loadDistributions,
  saveDistributions,
} from '@/lib/masterlist-data';

export type { DistributionDoc };

interface NewDocEntry {
  id: string;
  selectedFolderId: number | '';
  selectedSubFolderId: string;
  dept: string;
  jenis: string;
  docNumber: string;
  judulDokumen: string;
  revisiKe: string;
  docUrl: string;
  selectedFile: File | null;
}

interface RevDocEntry {
  id: string;
  selectedExistingDocId: string;
  newRevisionNumber: string;
  revisionNotes: string;
  selectedRevFile: File | null;
}

const INITIAL_DISTRIBUTION: DistributionDoc[] = [];

const DEPT_OPTIONS_DEFAULT = [
  'Finance','Purchasing','Human Resources','General Affairs','Commercial',
  'Logistics','QHSE','Geotechnical Operation','Geophysical Operation',
  'PPEC','Facility','Mechanical & Construction',
];

const JENIS_OPTIONS_DEFAULT = [
  'Kebijakan Manajemen Sistem','Manual (Manual Sistem Manajemen)','Prosedur',
  'Form / Standar','Standar Operasional Prosedur (SOP)','Instruksi Kerja (Work Instruction)',
  'Template','Pedoman (Guideline)','Laporan Teknis',
];

function makeid() { return Math.random().toString(36).slice(2, 9); }

function makeEmptyNewDoc(): NewDocEntry {
  return { id: makeid(), selectedFolderId: '', selectedSubFolderId: '', dept: '', jenis: '', docNumber: '', judulDokumen: '', revisiKe: '00', docUrl: '', selectedFile: null };
}

function makeEmptyRevDoc(): RevDocEntry {
  return { id: makeid(), selectedExistingDocId: '', newRevisionNumber: '', revisionNotes: '', selectedRevFile: null };
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
  fontSize: '13px', color: '#0f172a', background: '#ffffff', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569',
  marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em',
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0',
  boxShadow: '0 2px 10px rgba(7, 28, 44, 0.03)',
};

export default function DistributionPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(true);
  const [distributions, setDistributions] = useState<DistributionDoc[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [masterFolders, setMasterFolders] = useState<MasterFolder[]>([]);
  useEffect(() => {
    setMasterFolders(loadMasterFolders());
    setDistributions(loadDistributions());

    const handleUpdate = () => {
      setDistributions(loadDistributions());
      setMasterFolders(loadMasterFolders());
    };
    window.addEventListener('thi_distributions_updated', handleUpdate);
    window.addEventListener('thi_master_folders_v3', handleUpdate);
    return () => {
      window.removeEventListener('thi_distributions_updated', handleUpdate);
      window.removeEventListener('thi_master_folders_v3', handleUpdate);
    };
  }, []);

  const flattenedDocs = useMemo(() => getAllFlattenedDocs(masterFolders), [masterFolders]);

  const DEPT_OPTIONS = useMemo(() => {
    if (typeof window === 'undefined') return DEPT_OPTIONS_DEFAULT;
    try {
      const raw = localStorage.getItem('qms_departments');
      if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length > 0) return p.map((d: { name: string }) => d.name); }
    } catch {}
    return DEPT_OPTIONS_DEFAULT;
  }, []);

  const JENIS_OPTIONS = useMemo(() => {
    if (typeof window === 'undefined') return JENIS_OPTIONS_DEFAULT;
    try {
      const raw = localStorage.getItem('qms_doc_types');
      if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length > 0) return p.map((j: { name: string }) => j.name); }
    } catch {}
    return JENIS_OPTIONS_DEFAULT;
  }, []);

  const [distMode, setDistMode] = useState<'NEW_DOC' | 'REVISION_UPDATE' | 'ANNOUNCEMENT'>('NEW_DOC');
  const [newDocEntries, setNewDocEntries] = useState<NewDocEntry[]>([makeEmptyNewDoc()]);
  const [revDocEntries, setRevDocEntries] = useState<RevDocEntry[]>([makeEmptyRevDoc()]);
  const [announcedDocIds, setAnnouncedDocIds] = useState<string[]>([]);
  const [announcementNote, setAnnouncementNote] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState<boolean>(true);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [emailNotes, setEmailNotes] = useState<string>('');
  const [emailModalDoc, setEmailModalDoc] = useState<DistributionDoc | null>(null);
  const [modalRecipient, setModalRecipient] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg); setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (user?.role === 'staff') {
    return (
      <div style={{ width: '100%', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: '520px', width: '100%', ...cardStyle, padding: '36px 32px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #fecaca' }}>
            <ShieldAlert size={32} strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#071c2c', margin: '0 0 10px' }}>Otoritas Khusus Admin QHSE</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: '0 0 28px' }}>
            Akun <strong>Staff</strong> tidak memiliki hak akses ke modul <strong>Distribusi Dokumen</strong>.
          </p>
          <button onClick={() => router.push('/dashboard')} style={{ background: '#071c2c', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const updateNewDoc = (id: string, patch: Partial<NewDocEntry>) =>
    setNewDocEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  const addNewDocEntry = () => setNewDocEntries(prev => [...prev, makeEmptyNewDoc()]);
  const removeNewDocEntry = (id: string) => { if (newDocEntries.length > 1) setNewDocEntries(prev => prev.filter(e => e.id !== id)); };

  const updateRevDoc = (id: string, patch: Partial<RevDocEntry>) =>
    setRevDocEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  const addRevDocEntry = () => setRevDocEntries(prev => [...prev, makeEmptyRevDoc()]);
  const removeRevDocEntry = (id: string) => { if (revDocEntries.length > 1) setRevDocEntries(prev => prev.filter(e => e.id !== id)); };

  const toggleAnnouncedDoc = (docId: string) =>
    setAnnouncedDocIds(prev => prev.includes(docId) ? prev.filter(d => d !== docId) : [...prev, docId]);

  const handleResetForm = () => {
    setNewDocEntries([makeEmptyNewDoc()]);
    setRevDocEntries([makeEmptyRevDoc()]);
    setAnnouncedDocIds([]);
    setAnnouncementNote('');
    setRecipientEmail('');
    setEmailNotes('');
    setSendEmailNotification(true);
    setErrorMessage('');
  };

  const sendEmails = (entries: DistributionDoc[], notes: string) => {
    if (!sendEmailNotification || !recipientEmail.trim()) return;
    const emailList = recipientEmail.split(',').map(e => e.trim()).filter(Boolean);

    // Determine category from jenis of first entry (or use generic label)
    const category = entries[0]?.jenis || 'Corporate Documents';

    // Build document list for batch email
    const documents = entries.map(entry => ({
      title: entry.judul,
      number: entry.idRegistrasi !== '-' ? entry.idRegistrasi : undefined,
      fileUrl: entry.fileUrl || null,
    }));

    // Send ONE combined email per recipient
    emailList.forEach(targetEmail => {
      fetch('/api/distribution/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: true,
          to: targetEmail,
          category,
          documents,
          distributorName: user?.name || 'Admin QMS THI',
          notes: notes || emailNotes || '',
        }),
      }).catch(console.error);
    });
  };


  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    if (distMode === 'NEW_DOC') {
      for (const entry of newDocEntries) {
        if (!entry.selectedFolderId) { setErrorMessage('Pilih Folder Utama untuk semua dokumen.'); return; }
        if (!entry.dept) { setErrorMessage('Pilih Departemen untuk semua dokumen.'); return; }
        if (!entry.jenis) { setErrorMessage('Pilih Jenis Dokumen untuk semua dokumen.'); return; }
        if (!entry.judulDokumen.trim()) { setErrorMessage('Isi Judul Dokumen untuk semua dokumen.'); return; }
      }

      const newEntries: DistributionDoc[] = [];
      let updatedFolders = [...masterFolders];

      newDocEntries.forEach((entry, i) => {
        const folderObj = updatedFolders.find(f => f.id === Number(entry.selectedFolderId));
        let subObj: MasterSubFolder | undefined;
        for (const s of folderObj?.subfolders || []) {
          if (s.id === entry.selectedSubFolderId) { subObj = s; break; }
          for (const cs of s.subfolders || []) { if (cs.id === entry.selectedSubFolderId) { subObj = cs; break; } }
          if (subObj) break;
        }
        const folderDisplay = folderObj ? `${folderObj.name}${subObj ? ' > ' + subObj.name : ''}` : 'General';
        const seqNum = distributions.length + newEntries.length + 1;
        const moPad = String(now.getMonth() + 1).padStart(2, '0');
        const yrShort = String(now.getFullYear()).slice(-2);
        const formattedId = `DIS${moPad}${yrShort}.${String(seqNum).padStart(3, '0')}`;
        const finalDocNumber = entry.docNumber.trim() || `THI-${(entry.dept || 'GEN').slice(0, 4).toUpperCase()}-${String(seqNum).padStart(3, '0')}`;

        const distEntry: DistributionDoc = {
          no: seqNum, id: formattedId, idRegistrasi: '-', dept: entry.dept, jenis: entry.jenis,
          judul: entry.judulDokumen.trim(), revisi: entry.revisiKe.trim() || '00', folder: folderDisplay,
          groupDoc: 'HEAD_OFFICE', fileName: entry.selectedFile ? entry.selectedFile.name : null,
          fileSize: entry.selectedFile ? `${(entry.selectedFile.size / 1024).toFixed(0)} KB` : '',
          fileUrl: entry.docUrl.trim() || undefined,
          status: 'Released', createdAt: dateStr, distType: 'NEW_DOC',
        };

        const newMasterDoc: MasterDocItem = {
          id: `d-new-${Date.now()}-${i}`, number: finalDocNumber, title: entry.judulDokumen.trim(),
          revision: `Rev.${entry.revisiKe.trim() || '00'}`, effectiveDate: dateStr, reviewDate: '01 Jan 2027',
          status: 'CURRENT', classification: 'INTERNAL', type: entry.jenis,
          size: entry.selectedFile ? `${(entry.selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '—',
          fileExt: 'pdf',
        };

        updatedFolders = updatedFolders.map(f => {
          if (f.id !== Number(entry.selectedFolderId)) return f;
          if (entry.selectedSubFolderId && f.subfolders) {
            return {
              ...f, subfolders: f.subfolders.map(sub => {
                if (sub.id === entry.selectedSubFolderId) return { ...sub, docs: [newMasterDoc, ...(sub.docs || [])] };
                if ((sub.subfolders || []).some(cs => cs.id === entry.selectedSubFolderId)) {
                  return { ...sub, subfolders: (sub.subfolders || []).map(cs => cs.id === entry.selectedSubFolderId ? { ...cs, docs: [newMasterDoc, ...(cs.docs || [])] } : cs) };
                }
                return sub;
              }),
            };
          }
          return { ...f, docs: [newMasterDoc, ...(f.docs || [])] };
        });
        newEntries.push(distEntry);
      });

      setMasterFolders(updatedFolders);
      saveMasterFolders(updatedFolders);
      sendEmails(newEntries, 'Dokumen sistem manajemen terkendali baru telah didistribusikan.');
      const updated = [...newEntries, ...distributions].map((item, idx) => ({ ...item, no: idx + 1 }));
      setDistributions(updated);
      saveDistributions(updated);
      handleResetForm();
      showToast(`${newEntries.length} dokumen baru berhasil didistribusikan!`);

    } else if (distMode === 'REVISION_UPDATE') {
      for (const entry of revDocEntries) {
        if (!entry.selectedExistingDocId) { setErrorMessage('Pilih Dokumen yang akan direvisi.'); return; }
        if (!entry.newRevisionNumber.trim()) { setErrorMessage('Isi Nomor Revisi Baru.'); return; }
        if (!entry.revisionNotes.trim()) { setErrorMessage('Isi Alasan Revisi.'); return; }
      }

      const newEntries: DistributionDoc[] = [];
      let updatedFolders = [...masterFolders];

      revDocEntries.forEach(entry => {
        const existingDoc = flattenedDocs.find(d => d.id === entry.selectedExistingDocId);
        if (!existingDoc) return;
        const revDisplay = entry.newRevisionNumber.trim().startsWith('Rev.') ? entry.newRevisionNumber.trim() : `Rev.${entry.newRevisionNumber.trim()}`;
        const seqNum = distributions.length + newEntries.length + 1;
        const moPad = String(now.getMonth() + 1).padStart(2, '0');
        const yrShort = String(now.getFullYear()).slice(-2);
        const formattedId = `DIS${moPad}${yrShort}.${String(seqNum).padStart(3, '0')}`;

        const distEntry: DistributionDoc = {
          no: seqNum, id: formattedId, idRegistrasi: existingDoc.number, dept: existingDoc.type || 'QHSE',
          jenis: existingDoc.type, judul: existingDoc.title, revisi: revDisplay.replace('Rev.', ''),
          folder: `${existingDoc.folderName}${existingDoc.subFolderName ? ' > ' + existingDoc.subFolderName : ''}`,
          groupDoc: 'HEAD_OFFICE', fileName: entry.selectedRevFile ? entry.selectedRevFile.name : `${existingDoc.number}_${revDisplay}.pdf`,
          fileSize: entry.selectedRevFile ? `${(entry.selectedRevFile.size / 1024).toFixed(0)} KB` : '—',
          status: 'Released', createdAt: dateStr, distType: 'REVISION_UPDATE',
        };

        updatedFolders = updatedFolders.map(f => ({
          ...f,
          docs: (f.docs || []).map(d => d.id === existingDoc.id ? { ...d, revision: revDisplay, effectiveDate: dateStr } : d),
          subfolders: (f.subfolders || []).map(sub => ({
            ...sub,
            docs: (sub.docs || []).map(d => d.id === existingDoc.id ? { ...d, revision: revDisplay, effectiveDate: dateStr } : d),
          })),
        }));
        newEntries.push(distEntry);
      });

      setMasterFolders(updatedFolders);
      saveMasterFolders(updatedFolders);
      sendEmails(newEntries, `Pembaruan revisi dokumen resmi.`);
      const updated = [...newEntries, ...distributions].map((item, idx) => ({ ...item, no: idx + 1 }));
      setDistributions(updated);
      saveDistributions(updated);
      handleResetForm();
      showToast(`${newEntries.length} dokumen revisi berhasil dirilis!`);

    } else {
      if (announcedDocIds.length === 0) { setErrorMessage('Pilih minimal satu dokumen untuk diumumkan.'); return; }
      const newEntries: DistributionDoc[] = [];
      announcedDocIds.forEach(docId => {
        const doc = flattenedDocs.find(d => d.id === docId);
        if (!doc) return;
        const seqNum = distributions.length + newEntries.length + 1;
        const moPad = String(now.getMonth() + 1).padStart(2, '0');
        const yrShort = String(now.getFullYear()).slice(-2);
        const formattedId = `ANN${moPad}${yrShort}.${String(seqNum).padStart(3, '0')}`;
        newEntries.push({
          no: seqNum, id: formattedId, idRegistrasi: doc.number, dept: doc.type || 'QHSE',
          jenis: doc.type, judul: doc.title, revisi: doc.revision.replace('Rev.', ''),
          folder: `${doc.folderName}${doc.subFolderName ? ' > ' + doc.subFolderName : ''}`,
          groupDoc: 'HEAD_OFFICE', fileName: doc.title, fileUrl: doc.r2Url,
          status: 'Released', createdAt: dateStr, distType: 'ANNOUNCEMENT',
        });
      });
      sendEmails(newEntries, announcementNote || 'Pengumuman sosialisasi dokumen terkendali resmi.');
      const updated = [...newEntries, ...distributions].map((item, idx) => ({ ...item, no: idx + 1 }));
      setDistributions(updated);
      saveDistributions(updated);
      handleResetForm();
      showToast(`${newEntries.length} dokumen berhasil diumumkan!`);
    }
  };

  const handleSendQuickEmail = async () => {
    if (!emailModalDoc || !modalRecipient.trim()) return;
    setIsSendingEmail(true);
    try {
      const emails = modalRecipient.split(',').map(e => e.trim()).filter(Boolean);
      for (const em of emails) {
        await fetch('/api/distribution/send-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: em, documentTitle: emailModalDoc.judul, documentNumber: emailModalDoc.id, revision: emailModalDoc.revisi, department: emailModalDoc.dept, jenisDokumen: emailModalDoc.jenis, distributorName: user?.name || 'Admin QMS THI', notes: modalNotes || 'Pemberitahuan sosialisasi dokumen.' }),
        });
      }
      showToast(`Email berhasil dikirim dari qms@thi.co.id!`);
      setEmailModalDoc(null); setModalNotes('');
    } catch (err: any) {
      showToast('Gagal mengirim email: ' + (err.message || 'Error'), 'error');
    } finally { setIsSendingEmail(false); }
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (confirm(`Hapus distribusi ${id} (${title})?`)) {
      const filtered = distributions.filter(d => d.id !== id).map((item, idx) => ({ ...item, no: idx + 1 }));
      setDistributions(filtered);
      saveDistributions(filtered);
      showToast(`Distribusi ${id} telah dihapus.`);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return distributions;
    const q = searchTerm.toLowerCase();
    return distributions.filter(d => d.id.toLowerCase().includes(q) || d.idRegistrasi.toLowerCase().includes(q) || d.dept.toLowerCase().includes(q) || d.jenis.toLowerCase().includes(q) || d.judul.toLowerCase().includes(q) || d.revisi.toLowerCase().includes(q) || d.folder.toLowerCase().includes(q) || d.status.toLowerCase().includes(q));
  }, [distributions, searchTerm]);

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, background: toastType === 'success' ? '#071c2c' : '#dc2626', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: 600, border: `1px solid ${toastType === 'success' ? '#38bdf8' : '#fca5a5'}` }}>
          <CheckCircle2 size={18} style={{ color: toastType === 'success' ? '#38bdf8' : '#fca5a5' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#071c2c', margin: 0, letterSpacing: '-0.01em' }}>Distribusi Dokumen</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>Distribusikan dokumen baru, rilis nomor revisi terdaftar, dan sosialisasikan kebijakan ke departemen.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          style={{
            background: isFormOpen ? '#f1f5f9' : '#071c2c',
            color: isFormOpen ? '#334155' : '#fff',
            border: isFormOpen ? '1px solid #cbd5e1' : 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            transition: 'all 0.15s ease',
          }}
        >
          {isFormOpen ? (
            <>
              <Minus size={14} strokeWidth={2.2} /> Tutup Form
            </>
          ) : (
            <>
              <Plus size={14} strokeWidth={2.2} /> Buat Distribusi Baru
            </>
          )}
        </button>
      </div>

      {/* FORM VIEW (WHEN OPEN) */}
      {isFormOpen && (
        <div style={{ ...cardStyle, padding: '20px 24px', borderLeft: '4px solid #071c2c', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#071c2c', margin: 0 }}>Formulir Distribusi &amp; Rilis Dokumen</h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Pilih metode distribusi di bawah:</span>
          </div>

          {errorMessage && (
            <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /><span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {([
              { key: 'NEW_DOC', icon: <FilePlus size={16} />, label: 'Dokumen Baru', sub: 'Pilih Folder & Sub Folder', color: '#15803d', bg: '#f0fdf4' },
              { key: 'REVISION_UPDATE', icon: <RefreshCw size={16} />, label: 'Update Revisi', sub: 'Pilih Berkas Terdaftar', color: '#0284c7', bg: '#f0f9ff' },
              { key: 'ANNOUNCEMENT', icon: <Megaphone size={16} />, label: 'Pengumuman', sub: 'Sosialisasi Ulang Dokumen', color: '#7c3aed', bg: '#f5f3ff' },
            ] as const).map(tab => {
              const isActive = distMode === tab.key;
              return (
                <button key={tab.key} type="button" onClick={() => { setDistMode(tab.key as typeof distMode); setErrorMessage(''); }} style={{ padding: '12px 16px', borderRadius: '8px', border: isActive ? `2px solid ${tab.color}` : '1px solid #e2e8f0', background: isActive ? tab.bg : '#fff', color: isActive ? tab.color : '#64748b', fontSize: '13px', fontWeight: isActive ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s ease', textAlign: 'left' }}>
                  <span style={{ color: isActive ? tab.color : '#94a3b8', flexShrink: 0 }}>{tab.icon}</span>
                  <span><span style={{ display: 'block', fontWeight: 700, fontSize: '13px' }}>{tab.label}</span><span style={{ display: 'block', fontSize: '11px', color: isActive ? tab.color : '#94a3b8', fontWeight: 400 }}>{tab.sub}</span></span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {distMode === 'NEW_DOC' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {newDocEntries.map((entry, idx) => (
                  <NewDocEntryRow key={entry.id} entry={entry} index={idx} totalCount={newDocEntries.length} masterFolders={masterFolders} deptOptions={DEPT_OPTIONS} jenisOptions={JENIS_OPTIONS} onUpdate={patch => updateNewDoc(entry.id, patch)} onRemove={() => removeNewDocEntry(entry.id)} />
                ))}
                <button type="button" onClick={addNewDocEntry} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', border: '1.5px dashed #cbd5e1', borderRadius: '8px', background: '#fafcff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#071c2c'; e.currentTarget.style.color = '#071c2c'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}>
                  <Plus size={14} /> Tambah Dokumen Lagi
                </button>
              </div>
            )}

            {distMode === 'REVISION_UPDATE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {revDocEntries.map((entry, idx) => (
                  <RevDocEntryRow key={entry.id} entry={entry} index={idx} totalCount={revDocEntries.length} flattenedDocs={flattenedDocs} onUpdate={patch => updateRevDoc(entry.id, patch)} onRemove={() => removeRevDocEntry(entry.id)} />
                ))}
                <button type="button" onClick={addRevDocEntry} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', border: '1.5px dashed #cbd5e1', borderRadius: '8px', background: '#fafcff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.color = '#0284c7'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}>
                  <Plus size={14} /> Tambah Dokumen Revisi Lagi
                </button>
              </div>
            )}

            {distMode === 'ANNOUNCEMENT' && (
              <div style={{ ...cardStyle, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Megaphone size={18} style={{ color: '#7c3aed' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#071c2c' }}>Pilih Dokumen yang Akan Diumumkan</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Centang satu atau lebih dokumen dari masterlist untuk didistribusikan ulang</div>
                  </div>
                </div>
                <AnnDocSelector flattenedDocs={flattenedDocs} selectedIds={announcedDocIds} onToggle={toggleAnnouncedDoc} />
                <div>
                  <label style={labelStyle}>Catatan Pengumuman <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(opsional)</span></label>
                  <textarea rows={3} value={announcementNote} onChange={e => setAnnouncementNote(e.target.value)} placeholder="Tuliskan catatan sosialisasi atau instruksi tindak lanjut..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            )}

            <div style={{ ...cardStyle, padding: '18px 20px', borderLeft: '3px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bell size={16} /></div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#071c2c' }}>Notifikasi Email</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Kirim notifikasi otomatis via <strong>qms@thi.co.id</strong></div>
                  </div>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', cursor: 'pointer', flexShrink: 0 }}>
                  <input type="checkbox" checked={sendEmailNotification} onChange={e => setSendEmailNotification(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0284c7', cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Aktifkan</span>
                </label>
              </div>
              {sendEmailNotification && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Email Penerima <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(pisahkan dengan koma)</span></label>
                    <input type="text" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="contoh: user@thi.co.id, hr.ga@thi.co.id" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Catatan Email <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(opsional)</span></label>
                    <textarea rows={2} value={emailNotes} onChange={e => setEmailNotes(e.target.value)} placeholder="Instruksi atau catatan sosialisasi tambahan..." style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
              <button type="button" onClick={handleResetForm} style={{ padding: '9px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Reset</button>
              <button type="submit" style={{ padding: '9px 24px', borderRadius: '6px', border: 'none', background: '#071c2c', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(7,28,44,0.2)' }} onMouseOver={e => (e.currentTarget.style.background = '#0d2d47')} onMouseOut={e => (e.currentTarget.style.background = '#071c2c')}>
                <Send size={14} />
                {distMode === 'NEW_DOC' ? 'Distribusikan Dokumen' : distMode === 'REVISION_UPDATE' ? 'Rilis Revisi' : 'Umumkan Dokumen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RIWAYAT DISTRIBUSI DOKUMEN TABLE (ALWAYS DISPLAYED UNDER FORM) */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#071c2c', margin: 0 }}>Riwayat Distribusi Dokumen</h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Daftar seluruh berkas yang telah didistribusikan dan dirilis ke pengguna</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Search:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', width: '220px', background: '#fff' }}>
              <Search size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <input type="text" placeholder="Cari ID, judul, dept..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#0f172a', background: 'transparent' }} />
              {searchTerm && <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}><X size={12} /></button>}
            </div>
          </div>
        </div>

        <div style={{ padding: '8px 20px', background: '#fafcff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Show</span>
            <select value={entriesPerPage} onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff', cursor: 'pointer' }}>
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>entries</span>
          </div>
          <span>Total <strong>{totalEntries}</strong> riwayat distribusi</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e8eef5', color: '#475569', fontSize: '11px' }}>
                <th style={{ padding: '10px 8px', width: '3%', textAlign: 'center', fontWeight: 700 }}>#</th>
                <th style={{ padding: '10px 8px', width: '9%', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '10px 8px', width: '8%', fontWeight: 700 }}>ID Reg</th>
                <th style={{ padding: '10px 8px', width: '11%', fontWeight: 700 }}>Departemen</th>
                <th style={{ padding: '10px 8px', width: '11%', fontWeight: 700 }}>Jenis</th>
                <th style={{ padding: '10px 8px', width: '24%', fontWeight: 700 }}>Judul</th>
                <th style={{ padding: '10px 4px', width: '4%', textAlign: 'center', fontWeight: 700 }}>Rev</th>
                <th style={{ padding: '10px 8px', width: '7%', textAlign: 'center', fontWeight: 700 }}>Tipe</th>
                <th style={{ padding: '10px 8px', width: '7%', textAlign: 'center', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '10px 8px', width: '7%', textAlign: 'center', fontWeight: 700 }}>Tanggal</th>
                <th style={{ padding: '10px 8px', width: '9%', textAlign: 'center', fontWeight: 700 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? paginatedData.map((doc, idx) => {
                const isEven = idx % 2 === 1;
                const typeColor = doc.distType === 'NEW_DOC' ? '#15803d' : doc.distType === 'REVISION_UPDATE' ? '#0284c7' : '#7c3aed';
                const typeBg = doc.distType === 'NEW_DOC' ? '#f0fdf4' : doc.distType === 'REVISION_UPDATE' ? '#f0f9ff' : '#f5f3ff';
                const typeLabel = doc.distType === 'NEW_DOC' ? 'Baru' : doc.distType === 'REVISION_UPDATE' ? 'Revisi' : 'Umumkan';
                return (
                  <tr key={doc.id} style={{ background: isEven ? '#fafcff' : '#fff', borderBottom: '1px solid #f1f5f9', transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')} onMouseLeave={e => (e.currentTarget.style.background = isEven ? '#fafcff' : '#fff')}>
                    <td style={{ padding: '9px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: '11px' }}>{startIndex + idx + 1}</td>
                    <td style={{ padding: '9px 8px' }}><span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#071c2c' }}>{doc.id}</span></td>
                    <td style={{ padding: '9px 8px' }}><span style={{ fontFamily: 'monospace', fontSize: '11px', color: doc.idRegistrasi !== '-' ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>{doc.idRegistrasi}</span></td>
                    <td style={{ padding: '9px 8px', color: '#0f172a', fontWeight: 500, fontSize: '11.5px', lineHeight: 1.3, wordBreak: 'break-word' }}>{doc.dept}</td>
                    <td style={{ padding: '9px 8px', color: '#334155', fontSize: '11px', lineHeight: 1.3, wordBreak: 'break-word' }}>{doc.jenis}</td>
                    <td style={{ padding: '9px 8px', color: '#071c2c', fontWeight: 600, fontSize: '11.5px', lineHeight: 1.3, wordBreak: 'break-word' }}>{doc.judul}</td>
                    <td style={{ padding: '9px 4px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: '11px' }}>{doc.revisi}</td>
                    <td style={{ padding: '9px 4px', textAlign: 'center' }}>
                      <span style={{ background: typeBg, color: typeColor, padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>{typeLabel}</span>
                    </td>
                    <td style={{ padding: '9px 4px', textAlign: 'center' }}>
                      <span style={{ background: '#0284c7', color: '#fff', padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>{doc.status}</span>
                    </td>
                    <td style={{ padding: '9px 8px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>{doc.createdAt}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        <button type="button" title="Buka dokumen di tab baru" onClick={() => { if (doc.fileUrl) window.open(doc.fileUrl, '_blank', 'noopener,noreferrer'); else showToast('Tidak ada URL dokumen yang tersedia.', 'error'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', padding: '3px' }}><Eye size={13} /></button>
                        <button type="button" title="Kirim notifikasi email" onClick={() => { setEmailModalDoc(doc); setModalRecipient(''); setModalNotes(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '3px' }}><Mail size={13} /></button>
                        <button type="button" title="Hapus" onClick={() => handleDeleteItem(doc.id, doc.judul)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '3px' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={11} style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Belum ada riwayat distribusi dokumen. Gunakan formulir di atas untuk mendistribusikan dokumen baru.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '12.5px', color: '#64748b' }}>
          <div>Showing {totalEntries === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} entries</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={validPage === 1} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', background: validPage === 1 ? '#f8fafc' : '#fff', color: validPage === 1 ? '#cbd5e1' : '#334155', cursor: validPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '12px' }}>Previous</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pn => (
              <button key={pn} onClick={() => setCurrentPage(pn)} style={{ width: '30px', height: '30px', borderRadius: '4px', border: pn === validPage ? '1px solid #071c2c' : '1px solid #cbd5e1', background: pn === validPage ? '#071c2c' : '#fff', color: pn === validPage ? '#fff' : '#334155', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>{pn}</button>
            ))}
            {totalPages > 5 && <><span style={{ color: '#94a3b8' }}>...</span><button onClick={() => setCurrentPage(totalPages)} style={{ width: '30px', height: '30px', borderRadius: '4px', border: validPage === totalPages ? '1px solid #071c2c' : '1px solid #cbd5e1', background: validPage === totalPages ? '#071c2c' : '#fff', color: validPage === totalPages ? '#fff' : '#334155', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>{totalPages}</button></>}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={validPage === totalPages || totalPages === 0} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', background: (validPage === totalPages || totalPages === 0) ? '#f8fafc' : '#fff', color: (validPage === totalPages || totalPages === 0) ? '#cbd5e1' : '#334155', cursor: (validPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '12px' }}>Next</button>
          </div>
        </div>
      </div>

      {/* Quick Email Modal */}
      {emailModalDoc && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: 'rgba(7,28,44,0.55)', backdropFilter: 'blur(3px)' }}>
          <div style={{ width: '100%', maxWidth: '520px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(7,28,44,0.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#071c2c', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} style={{ color: '#38bdf8' }} /><span style={{ fontSize: '13.5px', fontWeight: 700 }}>Kirim Notifikasi Email</span></div>
              <button onClick={() => setEmailModalDoc(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7', borderRadius: '6px', padding: '12px 14px', fontSize: '12.5px' }}>
                <div style={{ color: '#64748b' }}>Dokumen: <strong style={{ color: '#0f172a' }}>{emailModalDoc.id} — {emailModalDoc.judul}</strong></div>
                <div style={{ color: '#64748b', marginTop: '4px' }}>Dept: <strong>{emailModalDoc.dept}</strong> | Rev: <strong style={{ color: '#15803d' }}>Rev.{emailModalDoc.revisi}</strong></div>
                <div style={{ color: '#64748b', marginTop: '4px' }}>Pengirim: <strong style={{ color: '#0284c7' }}>qms@thi.co.id</strong></div>
              </div>
              <div><label style={labelStyle}>Email Penerima</label><input type="text" value={modalRecipient} onChange={e => setModalRecipient(e.target.value)} placeholder="contoh: user@thi.co.id" style={inputStyle} /></div>
              <div><label style={labelStyle}>Catatan <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(opsional)</span></label><textarea rows={3} value={modalNotes} onChange={e => setModalNotes(e.target.value)} placeholder="Catatan sosialisasi..." style={{ ...inputStyle, resize: 'vertical' }} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button onClick={() => setEmailModalDoc(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
              <button disabled={isSendingEmail} onClick={handleSendQuickEmail} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: isSendingEmail ? '#94a3b8' : '#0284c7', color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: isSendingEmail ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(2,132,199,0.3)' }}>
                {isSendingEmail ? <><Loader2 size={14} className="animate-spin" /> Mengirim...</> : <><Send size={14} /> Kirim Email</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── NewDocEntryRow ── */
interface NewDocEntryRowProps {
  entry: NewDocEntry;
  index: number;
  totalCount: number;
  masterFolders: MasterFolder[];
  deptOptions: string[];
  jenisOptions: string[];
  onUpdate: (patch: Partial<NewDocEntry>) => void;
  onRemove: () => void;
}

const inputStyle2: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
  fontSize: '13px', color: '#0f172a', background: '#ffffff', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
};
const labelStyle2: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569',
  marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em',
};

function NewDocEntryRow({ entry, index, totalCount, masterFolders, deptOptions, jenisOptions, onUpdate, onRemove }: NewDocEntryRowProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedFolder = masterFolders.find(f => f.id === Number(entry.selectedFolderId));
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File melebihi 10MB.'); if (fileRef.current) fileRef.current.value = ''; return; }
    onUpdate({ selectedFile: file });
  };
  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#071c2c', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#071c2c' }}>Dokumen #{index + 1}</span>
        </div>
        {totalCount > 1 && <button type="button" onClick={onRemove} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}><Minus size={12} /> Hapus</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={labelStyle2}>Folder Utama <span style={{ color: '#dc2626' }}>*</span></label>
          <select value={entry.selectedFolderId} onChange={e => onUpdate({ selectedFolderId: e.target.value ? Number(e.target.value) : '', selectedSubFolderId: '' })} style={{ ...inputStyle2, color: entry.selectedFolderId ? '#0f172a' : '#94a3b8' }} required>
            <option value="">— Pilih Folder Utama —</option>
            {masterFolders.map(f => <option key={f.id} value={f.id} style={{ color: '#0f172a' }}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle2}>Sub Folder <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(opsional)</span></label>
          <select value={entry.selectedSubFolderId} onChange={e => onUpdate({ selectedSubFolderId: e.target.value })} disabled={!entry.selectedFolderId} style={{ ...inputStyle2, background: !entry.selectedFolderId ? '#f8fafc' : '#fff', color: entry.selectedSubFolderId ? '#0f172a' : '#64748b' }}>
            <option value="">— Root Folder —</option>
            {selectedFolder && (selectedFolder.subfolders || []).map(sub => (
              <React.Fragment key={sub.id}>
                <option value={sub.id} style={{ color: '#0f172a', fontWeight: 600 }}>📁 {sub.name}</option>
                {(sub.subfolders || []).map(cs => <option key={cs.id} value={cs.id} style={{ color: '#0369a1' }}>&nbsp;&nbsp;&nbsp;↳ {cs.name}</option>)}
              </React.Fragment>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={labelStyle2}>Departemen <span style={{ color: '#dc2626' }}>*</span></label>
          <select value={entry.dept} onChange={e => onUpdate({ dept: e.target.value })} style={{ ...inputStyle2, color: entry.dept ? '#0f172a' : '#94a3b8' }} required>
            <option value="">— Pilih Departemen —</option>
            {deptOptions.map(d => <option key={d} value={d} style={{ color: '#0f172a' }}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle2}>Jenis Dokumen <span style={{ color: '#dc2626' }}>*</span></label>
          <select value={entry.jenis} onChange={e => onUpdate({ jenis: e.target.value })} style={{ ...inputStyle2, color: entry.jenis ? '#0f172a' : '#94a3b8' }} required>
            <option value="">— Pilih Jenis —</option>
            {jenisOptions.map(j => <option key={j} value={j} style={{ color: '#0f172a' }}>{j}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={labelStyle2}>Judul Dokumen <span style={{ color: '#dc2626' }}>*</span></label>
          <input type="text" value={entry.judulDokumen} onChange={e => onUpdate({ judulDokumen: e.target.value })} placeholder="Masukkan judul lengkap dokumen..." style={inputStyle2} required />
        </div>
        <div>
          <label style={labelStyle2}>Revisi Ke</label>
          <input type="text" value={entry.revisiKe} onChange={e => onUpdate({ revisiKe: e.target.value })} placeholder="00" style={inputStyle2} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={labelStyle2}>Nomor Dokumen <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(opsional)</span></label>
          <input type="text" value={entry.docNumber} onChange={e => onUpdate({ docNumber: e.target.value })} placeholder="Contoh: THI-QHSSE-SOP-009" style={inputStyle2} />
        </div>
        <div>
          <label style={labelStyle2}>Upload Berkas <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(max 10MB)</span></label>
          <input ref={fileRef} type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx" style={{ fontSize: '12.5px', color: '#475569' }} />
          {entry.selectedFile && <span style={{ fontSize: '11px', color: '#15803d', marginTop: '4px', display: 'block' }}>✓ {entry.selectedFile.name} ({(entry.selectedFile.size / 1024).toFixed(0)} KB)</span>}
        </div>
      </div>
      <div>
        <label style={labelStyle2}>URL Dokumen <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(Google Drive / link — untuk notifikasi email)</span></label>
        <input type="url" value={entry.docUrl} onChange={e => onUpdate({ docUrl: e.target.value })} placeholder="https://drive.google.com/file/d/..." style={inputStyle2} />
      </div>
    </div>
  );
}

/* ── RevDocEntryRow ── */
interface RevDocEntryRowProps {
  entry: RevDocEntry;
  index: number;
  totalCount: number;
  flattenedDocs: FlattenedDocItem[];
  onUpdate: (patch: Partial<RevDocEntry>) => void;
  onRemove: () => void;
}

function RevDocEntryRow({ entry, index, totalCount, flattenedDocs, onUpdate, onRemove }: RevDocEntryRowProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedDoc = flattenedDocs.find(d => d.id === entry.selectedExistingDocId) || null;
  useEffect(() => {
    if (selectedDoc) {
      const curNum = parseInt(selectedDoc.revision.replace(/\D/g, ''), 10) || 0;
      onUpdate({ newRevisionNumber: `Rev.${String(curNum + 1).padStart(2, '0')}` });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.selectedExistingDocId]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File melebihi 10MB.'); if (fileRef.current) fileRef.current.value = ''; return; }
    onUpdate({ selectedRevFile: file });
  };
  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#071c2c' }}>Revisi #{index + 1}</span>
        </div>
        {totalCount > 1 && <button type="button" onClick={onRemove} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}><Minus size={12} /> Hapus</button>}
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle2}>Pilih Dokumen Terdaftar <span style={{ color: '#dc2626' }}>*</span></label>
        <select value={entry.selectedExistingDocId} onChange={e => onUpdate({ selectedExistingDocId: e.target.value })} style={{ ...inputStyle2, color: entry.selectedExistingDocId ? '#0f172a' : '#94a3b8' }} required>
          <option value="">— Pilih Dokumen dari Masterlist —</option>
          {flattenedDocs.map(doc => <option key={doc.id} value={doc.id} style={{ color: '#0f172a' }}>[{doc.number}] {doc.title} — {doc.revision} ({doc.folderName})</option>)}
        </select>
      </div>
      {selectedDoc && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '12.5px' }}>
          <div style={{ fontWeight: 700, color: '#071c2c', marginBottom: '4px' }}>{selectedDoc.number} · {selectedDoc.title}</div>
          <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>📁 {selectedDoc.folderName}</span>
            {selectedDoc.subFolderName && <span>📂 {selectedDoc.subFolderName}</span>}
            <span style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: 700, padding: '1px 8px', borderRadius: '10px' }}>Revisi Aktif: {selectedDoc.revision}</span>
            {selectedDoc.r2Url && <button type="button" onClick={() => window.open(selectedDoc.r2Url, '_blank', 'noopener,noreferrer')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', fontSize: '12px', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><ExternalLink size={12} /> Buka Dokumen</button>}
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={labelStyle2}>Nomor Revisi Baru <span style={{ color: '#dc2626' }}>*</span></label>
          <input type="text" value={entry.newRevisionNumber} onChange={e => onUpdate({ newRevisionNumber: e.target.value })} placeholder="Contoh: Rev.04" style={{ ...inputStyle2, fontWeight: 700, color: '#0284c7', background: '#f0f9ff' }} required />
        </div>
        <div>
          <label style={labelStyle2}>Upload Berkas Revisi <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(max 10MB)</span></label>
          <input ref={fileRef} type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx" style={{ fontSize: '12.5px', color: '#475569' }} />
          {entry.selectedRevFile && <span style={{ fontSize: '11px', color: '#15803d', marginTop: '4px', display: 'block' }}>✓ {entry.selectedRevFile.name}</span>}
        </div>
      </div>
      <div>
        <label style={labelStyle2}>Alasan / Catatan Revisi <span style={{ color: '#dc2626' }}>*</span></label>
        <textarea rows={3} value={entry.revisionNotes} onChange={e => onUpdate({ revisionNotes: e.target.value })} placeholder="Jelaskan bagian/klausul apa yang diperbarui pada revisi ini..." style={{ ...inputStyle2, resize: 'vertical' }} required />
      </div>
    </div>
  );
}

/* ── AnnDocSelector ── */
interface AnnDocSelectorProps {
  flattenedDocs: FlattenedDocItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

function AnnDocSelector({ flattenedDocs, selectedIds, onToggle }: AnnDocSelectorProps) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search.trim()) return flattenedDocs;
    const q = search.toLowerCase();
    return flattenedDocs.filter(d => d.title.toLowerCase().includes(q) || d.number.toLowerCase().includes(q) || d.folderName.toLowerCase().includes(q));
  }, [flattenedDocs, search]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '7px 12px', background: '#fff', marginBottom: '10px' }}>
        <Search size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari dokumen dari masterlist..." style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#0f172a', background: 'transparent' }} />
        {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}><X size={12} /></button>}
      </div>
      {selectedIds.length > 0 && <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600, marginBottom: '8px' }}>✓ {selectedIds.length} dokumen dipilih</div>}
      <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
        {flattenedDocs.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Belum ada dokumen di Masterlist.</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Tidak ada dokumen cocok dengan pencarian.</div>
        ) : filtered.map(doc => {
          const isSelected = selectedIds.includes(doc.id);
          return (
            <div key={doc.id} onClick={() => onToggle(doc.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isSelected ? '#f5f3ff' : '#fff', transition: 'background 0.12s' }} onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#fafcff'; }} onMouseLeave={e => { e.currentTarget.style.background = isSelected ? '#f5f3ff' : '#fff'; }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, marginTop: '1px', background: isSelected ? '#7c3aed' : '#fff', border: isSelected ? '2px solid #7c3aed' : '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSelected && <Check size={11} strokeWidth={3} color="#fff" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#071c2c', lineHeight: 1.3 }}>{doc.title}</div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', color: '#0284c7', fontWeight: 600 }}>{doc.number}</span>
                  <span>📁 {doc.folderName}</span>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '8px', fontWeight: 600 }}>{doc.revision}</span>
                </div>
              </div>
              {doc.r2Url && (
                <button type="button" title="Buka dokumen di tab baru" onClick={ev => { ev.stopPropagation(); window.open(doc.r2Url, '_blank', 'noopener,noreferrer'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '2px', flexShrink: 0 }}><ExternalLink size={13} /></button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
