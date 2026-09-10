'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Plus,
  ArrowLeft,
  Search,
  FileText,
  Download,
  Edit,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Check,
  Building2,
  Folder,
  FolderOpen,
  FolderPlus,
  RefreshCw,
  Layers,
  CornerDownRight,
  ShieldAlert,
} from 'lucide-react';
import {
  MasterFolder,
  MasterSubFolder,
  MasterDocItem,
  loadMasterFolders,
  saveMasterFolders,
  getAllFlattenedDocs,
  FlattenedDocItem,
} from '@/lib/masterlist-data';

/* ─── Type Definitions ────────────────────────────────────────── */
export interface DistributionDoc {
  no: number;
  id: string; // e.g. DIS0523.001
  idRegistrasi: string; // e.g. REG0523.004 or '-'
  dept: string;
  jenis: string;
  judul: string;
  revisi: string; // e.g. '00', '01', '-'
  folder: string;
  groupDoc: 'HEAD_OFFICE' | 'PROJECT';
  fileName: string | null;
  fileSize?: string;
  status: 'Released' | 'Approved' | 'Draft';
  createdAt: string;
}

/* ─── Realistic Mock Dataset for Taka Hydrocore ───────────────── */
const INITIAL_DISTRIBUTION: DistributionDoc[] = [
  {
    no: 1,
    id: 'DIS0523.001',
    idRegistrasi: 'REG0523.004',
    dept: 'QHSE',
    jenis: 'Kebijakan Manajemen Sistem',
    judul: 'Manual Sistem Manajemen Mutu & K3L',
    revisi: '00',
    folder: 'QHSE Manual',
    groupDoc: 'HEAD_OFFICE',
    fileName: 'MAN-QHSE-001_IMS_Manual.pdf',
    fileSize: '3.4 MB',
    status: 'Released',
    createdAt: '01/09/2026',
  },
  {
    no: 2,
    id: 'DIS0523.003',
    idRegistrasi: '-',
    dept: 'QHSE',
    jenis: 'Prosedur',
    judul: 'QOP-04 Risk Register Process',
    revisi: '00',
    folder: 'QOP-04 - Risk Register Process',
    groupDoc: 'HEAD_OFFICE',
    fileName: 'QOP-04_Risk_Register.pdf',
    fileSize: '1.2 MB',
    status: 'Released',
    createdAt: '28/08/2026',
  },
  {
    no: 3,
    id: 'DIS0523.005',
    idRegistrasi: '-',
    dept: 'Human Resources',
    jenis: 'Prosedur',
    judul: 'HOP-02 Peningkatan dan Pengakuan Kompetensi',
    revisi: '00',
    folder: 'HOP-02 - Peningkatan & Pengakuan Kompetensi',
    groupDoc: 'HEAD_OFFICE',
    fileName: 'HOP-02_Competency_Dev.pdf',
    fileSize: '850 KB',
    status: 'Released',
    createdAt: '25/08/2026',
  },
  {
    no: 4,
    id: 'DIS0523.007',
    idRegistrasi: '-',
    dept: 'Human Resources',
    jenis: 'Prosedur',
    judul: 'HOP-04 Promosi dan Rotasi Karyawan',
    revisi: '00',
    folder: 'HOP-04 - Promosi & Rotasi Karyawan',
    groupDoc: 'HEAD_OFFICE',
    fileName: 'HOP-04_Promotion_Rotation.pdf',
    fileSize: '720 KB',
    status: 'Released',
    createdAt: '20/08/2026',
  },
  {
    no: 5,
    id: 'DIS0523.012',
    idRegistrasi: '-',
    dept: 'Purchasing',
    jenis: 'Prosedur',
    judul: 'LOP-02 Pemilihan Vendor',
    revisi: '00',
    folder: 'LOP-02 - Pemilihan Vendor',
    groupDoc: 'HEAD_OFFICE',
    fileName: 'LOP-02_Vendor_Selection.pdf',
    fileSize: '950 KB',
    status: 'Released',
    createdAt: '15/08/2026',
  },
  {
    no: 6,
    id: 'DIS0623.014',
    idRegistrasi: '-',
    dept: 'Human Resources',
    jenis: 'Form / Standar',
    judul: 'FRM-HOP-01-01 Check List Persyaratan Pelamar',
    revisi: '01',
    folder: 'HOP-01 - Rekrutmen & Seleksi Karyawan',
    groupDoc: 'HEAD_OFFICE',
    fileName: 'FRM-HOP-01-01_Applicant_Checklist.pdf',
    fileSize: '320 KB',
    status: 'Released',
    createdAt: '10/08/2026',
  },
  {
    no: 7,
    id: 'DIS0623.015',
    idRegistrasi: '-',
    dept: 'Human Resources',
    jenis: 'Form / Standar',
    judul: 'FRM-HOP-01-02 Permintaan Penambahan Calon Karyawan Tetap',
    revisi: '00',
    folder: 'HOP-01 - Rekrutmen & Seleksi Karyawan',
    groupDoc: 'HEAD_OFFICE',
    fileName: 'FRM-HOP-01-02_Manpower_Request.pdf',
    fileSize: '410 KB',
    status: 'Released',
    createdAt: '05/08/2026',
  },
  {
    no: 8,
    id: 'DIS0623.016',
    idRegistrasi: '-',
    dept: 'Human Resources',
    jenis: 'Form / Standar',
    judul: 'FRM-HOP-01-03 Penilaian Wawancara',
    revisi: '00',
    folder: 'HOP-01 - Rekrutmen & Seleksi Karyawan',
    groupDoc: 'HEAD_OFFICE',
    fileName: 'FRM-HOP-01-03_Interview_Assessment.pdf',
    fileSize: '390 KB',
    status: 'Released',
    createdAt: '01/08/2026',
  },
  {
    no: 9,
    id: 'DIS0623.027',
    idRegistrasi: '-',
    dept: 'Mechanical & Construction',
    jenis: 'Prosedur',
    judul: 'MOP-ENG-1100 - Standar Operasi dan Prosedur Pemeriksaan Power Supply System',
    revisi: '00',
    folder: 'MOP-ENG-1100 - Standar Operasi dan Prosedur Pemeriksaan Power Supply System',
    groupDoc: 'PROJECT',
    fileName: 'MOP-ENG-1100_Power_Supply.pdf',
    fileSize: '1.8 MB',
    status: 'Released',
    createdAt: '25/07/2026',
  },
  {
    no: 10,
    id: 'DIS0623.038',
    idRegistrasi: '-',
    dept: 'Mechanical & Construction',
    jenis: 'Prosedur',
    judul: 'MOP-ENG-1200 Standar Operasi dan Prosedur Perawatan Power Supply System',
    revisi: '00',
    folder: 'MOP-ENG-1200 Standar Operasi dan Prosedur Perawatan Power Supply System',
    groupDoc: 'PROJECT',
    fileName: 'MOP-ENG-1200_Power_Maintenance.pdf',
    fileSize: '1.6 MB',
    status: 'Released',
    createdAt: '20/07/2026',
  },
];

const DEPT_OPTIONS = [
  'Finance',
  'Purchasing',
  'Human Resources',
  'General Affairs',
  'Commercial',
  'Logistics',
  'QHSE',
  'Geotechnical Operation',
  'Geophysical Operation',
  'PPEC',
  'Facility',
  'Mechanical & Construction',
];

const JENIS_OPTIONS = [
  'Kebijakan Manajemen Sistem',
  'Manual (Manual Sistem Manajemen)',
  'Prosedur',
  'Form / Standar',
  'Standar Operasional Prosedur (SOP)',
  'Instruksi Kerja (Work Instruction)',
  'Template',
  'Pedoman (Guideline)',
  'Laporan Teknis',
];

const FOLDER_OPTIONS = [
  'QHSE Manual',
  'QOP-04 - Risk Register Process',
  'HOP-01 - Rekrutmen & Seleksi Karyawan',
  'HOP-02 - Peningkatan & Pengakuan Kompetensi',
  'HOP-04 - Promosi & Rotasi Karyawan',
  'LOP-02 - Pemilihan Vendor',
  'MOP-APMS-1100 - Standar Operasi dan Prosedur Pemeriksaan Power Supply System',
  'MOP-APMS-1200 Standar Operasi dan Prosedur Perawatan Power Supply System',
  '1. Standar Sistem Manajemen',
  '2. Kebijakan Manajemen (Policy)',
  '3. Struktur Organisasi & Job Description',
  '4. Prosedur Mutu & K3LH',
  '5. Instruksi Kerja (Work Instructions)',
  '6. Formulir & Checklist Operasional',
  '7. Dokumen Perizinan & Sertifikasi',
  '8. Laporan Audit & Tinjauan Manajemen',
  '9. HIRADC & Risk Assessment',
  '10. Rencana Tanggap Darurat (ERP)',
  '11. Manual Operasi Kapal & Alat Survey',
  '12. Kalibrasi Alat & Sertifikat Peralatan',
  '13. Rekaman Pelatihan & Kompetensi',
  '14. Pengelolaan Limbah & Lingkungan (B3)',
  '15. Vendor & Subcontractor Evaluation',
];

export default function DistributionPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [viewState, setViewState] = useState<'table' | 'form'>('table');
  const [distributions, setDistributions] = useState<DistributionDoc[]>(INITIAL_DISTRIBUTION);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // If user is Staff, block access
  if (user?.role === 'staff') {
    return (
      <div style={{ width: '100%', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(7, 28, 44, 0.06)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid #fecaca',
            }}
          >
            <ShieldAlert size={32} strokeWidth={2} />
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#dc2626',
              background: '#fef2f2',
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid #fecaca',
              display: 'inline-block',
              marginBottom: '12px',
            }}
          >
            Akses Terbatas
          </span>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#071c2c', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Otoritas Khusus Admin Master
          </h2>

          <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: '0 0 28px' }}>
            Akun <strong>Staff</strong> tidak memiliki hak akses ke modul <strong>Distribusi Dokumen</strong>. Modul ini diperuntukkan khusus bagi <em>Document Controller / Admin Master</em> untuk mengelola dan mendistribusikan salinan dokumen resmi.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: '#071c2c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(7, 28, 44, 0.15)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0d2d47')}
              onMouseLeave={e => (e.currentTarget.style.background = '#071c2c')}
            >
              Kembali ke Dashboard
            </button>

            <button
              onClick={() => router.push('/dashboard/masterlist')}
              style={{
                background: '#ffffff',
                color: '#071c2c',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
            >
              Masterlist Dokumen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Masterlist shared folders & docs
  const [masterFolders, setMasterFolders] = useState<MasterFolder[]>([]);

  useEffect(() => {
    setMasterFolders(loadMasterFolders());
  }, []);

  const flattenedDocs = useMemo(() => getAllFlattenedDocs(masterFolders), [masterFolders]);

  // Form State: Mode (NEW_DOC vs REVISION_UPDATE)
  const [distMode, setDistMode] = useState<'NEW_DOC' | 'REVISION_UPDATE'>('NEW_DOC');

  // Mode 1: Dokumen Baru
  const [selectedFolderId, setSelectedFolderId] = useState<number | ''>('');
  const [selectedSubFolderId, setSelectedSubFolderId] = useState<string>('');
  const [dept, setDept] = useState('');
  const [jenis, setJenis] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [judulDokumen, setJudulDokumen] = useState('');
  const [revisiKe, setRevisiKe] = useState('00');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mode 2: Update File Revisi
  const [selectedExistingDocId, setSelectedExistingDocId] = useState<string>('');
  const [newRevisionNumber, setNewRevisionNumber] = useState<string>('');
  const [revisionNotes, setRevisionNotes] = useState<string>('');
  const [selectedRevFile, setSelectedRevFile] = useState<File | null>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const revFileInputRef = useRef<HTMLInputElement>(null);

  // When selectedExistingDocId changes, auto-populate details and suggest next revision
  const selectedExistingDoc = useMemo(() => {
    return flattenedDocs.find(d => d.id === selectedExistingDocId) || null;
  }, [flattenedDocs, selectedExistingDocId]);

  useEffect(() => {
    if (selectedExistingDoc) {
      const curNum = parseInt(selectedExistingDoc.revision.replace(/\D/g, ''), 10) || 0;
      const nextNum = curNum + 1;
      setNewRevisionNumber(`Rev.${String(nextNum).padStart(2, '0')}`);
    } else {
      setNewRevisionNumber('');
    }
  }, [selectedExistingDoc]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Ukuran file melebihi batas maksimal 2MB.');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setErrorMessage('');
      setSelectedFile(file);
    }
  };

  const handleRevFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Ukuran file melebihi batas maksimal 2MB.');
        setSelectedRevFile(null);
        if (revFileInputRef.current) revFileInputRef.current.value = '';
        return;
      }
      setErrorMessage('');
      setSelectedRevFile(file);
    }
  };

  const handleResetForm = () => {
    setSelectedFolderId('');
    setSelectedSubFolderId('');
    setDept('');
    setJenis('');
    setDocNumber('');
    setJudulDokumen('');
    setRevisiKe('00');
    setSelectedFile(null);

    setSelectedExistingDocId('');
    setNewRevisionNumber('');
    setRevisionNotes('');
    setSelectedRevFile(null);

    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (revFileInputRef.current) revFileInputRef.current.value = '';
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (distMode === 'NEW_DOC') {
      if (!selectedFolderId) {
        setErrorMessage('Silakan pilih Folder Utama.');
        return;
      }
      if (!dept) {
        setErrorMessage('Silakan pilih Departemen.');
        return;
      }
      if (!jenis) {
        setErrorMessage('Silakan pilih Jenis dokumen.');
        return;
      }
      if (!judulDokumen.trim()) {
        setErrorMessage('Silakan isi Judul Dokumen.');
        return;
      }

      const folderObj = masterFolders.find(f => f.id === Number(selectedFolderId));
      const subObj = folderObj?.subfolders?.find(s => s.id === selectedSubFolderId);

      const targetFolderDisplay = folderObj
        ? `${folderObj.name}${subObj ? ' > ' + subObj.name : ''}`
        : 'General Folder';

      const newNum = distributions.length + 1;
      const formattedId = `DIS0926.${String(newNum).padStart(3, '0')}`;
      const finalDocNumber = docNumber.trim() || `THI-${dept.slice(0, 4).toUpperCase()}-${String(newNum).padStart(3, '0')}`;

      const newEntry: DistributionDoc = {
        no: 1,
        id: formattedId,
        idRegistrasi: '-',
        dept,
        jenis,
        judul: judulDokumen.trim(),
        revisi: revisiKe.trim() || '00',
        folder: targetFolderDisplay,
        groupDoc: 'HEAD_OFFICE',
        fileName: selectedFile ? selectedFile.name : null,
        fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : '',
        status: 'Released',
        createdAt: 'Hari Ini',
      };

      // Add to Masterlist folders state and storage
      const newMasterDoc: MasterDocItem = {
        id: `d-new-${Date.now().toString().slice(-5)}`,
        number: finalDocNumber,
        title: judulDokumen.trim(),
        revision: revisiKe.trim().startsWith('Rev.') ? revisiKe.trim() : `Rev.${revisiKe.trim() || '00'}`,
        effectiveDate: 'Hari Ini',
        reviewDate: '01 Jan 2027',
        status: 'CURRENT',
        classification: 'INTERNAL',
        type: jenis,
        size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
        fileExt: 'pdf',
        subFolderId: subObj ? subObj.id : undefined,
        subFolderName: subObj ? subObj.name : undefined,
      };

      const updatedFolders = masterFolders.map(f => {
        if (f.id === Number(selectedFolderId)) {
          if (selectedSubFolderId && f.subfolders) {
            return {
              ...f,
              subfolders: f.subfolders.map(sub => {
                if (sub.id === selectedSubFolderId) {
                  return {
                    ...sub,
                    docs: [newMasterDoc, ...(sub.docs || [])],
                  };
                }
                return sub;
              }),
            };
          } else {
            return {
              ...f,
              docs: [newMasterDoc, ...(f.docs || [])],
            };
          }
        }
        return f;
      });

      setMasterFolders(updatedFolders);
      saveMasterFolders(updatedFolders);

      const updatedDist = [newEntry, ...distributions].map((item, idx) => ({
        ...item,
        no: idx + 1,
      }));

      setDistributions(updatedDist);
      handleResetForm();
      setViewState('table');
      showToast(`Dokumen "${newEntry.judul}" berhasil didistribusikan ke ${targetFolderDisplay}!`);
    } else {
      // REVISION_UPDATE mode
      if (!selectedExistingDoc) {
        setErrorMessage('Silakan pilih Dokumen yang ingin direvisi.');
        return;
      }
      if (!newRevisionNumber.trim()) {
        setErrorMessage('Silakan isi Nomor Revisi Baru.');
        return;
      }

      const newNum = distributions.length + 1;
      const formattedId = `DIS0926.${String(newNum).padStart(3, '0')}`;
      const revDisplay = newRevisionNumber.trim().startsWith('Rev.') ? newRevisionNumber.trim() : `Rev.${newRevisionNumber.trim()}`;

      const targetFolderDisplay = `${selectedExistingDoc.folderName}${selectedExistingDoc.subFolderName ? ' > ' + selectedExistingDoc.subFolderName : ''}`;

      const newEntry: DistributionDoc = {
        no: 1,
        id: formattedId,
        idRegistrasi: '-',
        dept: selectedExistingDoc.type || 'QHSE',
        jenis: selectedExistingDoc.type,
        judul: selectedExistingDoc.title,
        revisi: revDisplay.replace('Rev.', ''),
        folder: targetFolderDisplay,
        groupDoc: 'HEAD_OFFICE',
        fileName: selectedRevFile ? selectedRevFile.name : `${selectedExistingDoc.number}_${revDisplay}.pdf`,
        fileSize: selectedRevFile ? `${(selectedRevFile.size / 1024).toFixed(0)} KB` : '1.5 MB',
        status: 'Released',
        createdAt: 'Hari Ini',
      };

      // Update revision in masterFolders
      const updatedFolders = masterFolders.map(f => {
        let folderUpdated = false;
        const newDirectDocs = (f.docs || []).map(d => {
          if (d.id === selectedExistingDoc.id) {
            folderUpdated = true;
            return { ...d, revision: revDisplay, effectiveDate: 'Hari Ini' };
          }
          return d;
        });

        const newSubs = (f.subfolders || []).map(sub => {
          const newSubDocs = (sub.docs || []).map(d => {
            if (d.id === selectedExistingDoc.id) {
              folderUpdated = true;
              return { ...d, revision: revDisplay, effectiveDate: 'Hari Ini' };
            }
            return d;
          });
          return { ...sub, docs: newSubDocs };
        });

        if (folderUpdated) {
          return { ...f, docs: newDirectDocs, subfolders: newSubs };
        }
        return f;
      });

      setMasterFolders(updatedFolders);
      saveMasterFolders(updatedFolders);

      const updatedDist = [newEntry, ...distributions].map((item, idx) => ({
        ...item,
        no: idx + 1,
      }));

      setDistributions(updatedDist);
      handleResetForm();
      setViewState('table');
      showToast(`Revisi ${selectedExistingDoc.number} berhasil diperbarui ke ${revDisplay} dan didistribusikan!`);
    }
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (confirm(`Hapus dokumen distribusi ${id} (${title})?`)) {
      const filtered = distributions.filter(d => d.id !== id).map((item, idx) => ({
        ...item,
        no: idx + 1,
      }));
      setDistributions(filtered);
      showToast(`Dokumen distribusi ${id} telah dihapus.`);
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return distributions;
    const q = searchTerm.toLowerCase();
    return distributions.filter(
      d =>
        d.id.toLowerCase().includes(q) ||
        d.idRegistrasi.toLowerCase().includes(q) ||
        d.dept.toLowerCase().includes(q) ||
        d.jenis.toLowerCase().includes(q) ||
        d.judul.toLowerCase().includes(q) ||
        d.revisi.toLowerCase().includes(q) ||
        d.folder.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
    );
  }, [distributions, searchTerm]);

  // Pagination
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#071c2c',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            border: '1px solid #38bdf8',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#38bdf8' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SCREEN 1: TABLE VIEW (DAFTAR DISTRIBUSI DOKUMEN)
          ════════════════════════════════════════════════════════════ */}
      {viewState === 'table' && (
        <>
          {/* ── PAGE TITLE ── */}
          <div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#071c2c',
                margin: 0,
                fontFamily: 'var(--font-display, inherit)',
                letterSpacing: '-0.01em',
              }}
            >
              Distribusi Dokumen
            </h1>
          </div>

          {/* ── MAIN CARD CONTAINER ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(7, 28, 44, 0.03)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top Bar with "+ Tambah Baru" Button */}
            <div
              style={{
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              {/* + Tambah Baru Button */}
              <button
                type="button"
                onClick={() => setViewState('form')}
                style={{
                  background: '#071c2c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  boxShadow: '0 1px 3px rgba(7,28,44,0.12)',
                  transition: 'background 0.15s ease',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#0d2d47')}
                onMouseOut={e => (e.currentTarget.style.background = '#071c2c')}
              >
                <Plus size={14} strokeWidth={2.2} />
                Tambah Baru
              </button>

              {/* Search Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Search:</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    width: '220px',
                  }}
                >
                  <Search size={14} style={{ color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder=""
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      width: '100%',
                      color: '#0f172a',
                      background: 'transparent',
                    }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Show Entries Strip */}
            <div
              style={{
                padding: '10px 24px',
                background: '#fafcff',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12.5px',
                color: '#64748b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Show</span>
                <select
                  value={entriesPerPage}
                  onChange={e => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    color: '#0f172a',
                    background: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value={5}>5</option>
                  <option value={9}>9</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>

              <div style={{ fontSize: '12px', color: '#8fa0b0' }}>
                Total <strong>{totalEntries}</strong> Dokumen Distribusi
              </div>
            </div>

            {/* Table Content */}
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e8eef5', color: '#475569', fontSize: '11.5px' }}>
                    <th style={{ padding: '10px 4px', width: '3%', fontWeight: 700, textAlign: 'center' }}>#</th>
                    <th style={{ padding: '10px 6px', width: '8.5%', fontWeight: 700 }}>ID</th>
                    <th style={{ padding: '10px 6px', width: '7.5%', fontWeight: 700 }}>ID Reg</th>
                    <th style={{ padding: '10px 6px', width: '12%', fontWeight: 700 }}>Departemen</th>
                    <th style={{ padding: '10px 6px', width: '9%', fontWeight: 700 }}>Jenis</th>
                    <th style={{ padding: '10px 6px', width: '20.5%', fontWeight: 700 }}>Judul</th>
                    <th style={{ padding: '10px 4px', width: '4%', fontWeight: 700, textAlign: 'center' }}>Rev</th>
                    <th style={{ padding: '10px 6px', width: '13%', fontWeight: 700 }}>Folder</th>
                    <th style={{ padding: '10px 4px', width: '5.5%', fontWeight: 700, textAlign: 'center' }}>File</th>
                    <th style={{ padding: '10px 4px', width: '8%', fontWeight: 700, textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '10px 6px', width: '9%', fontWeight: 700, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((doc, idx) => {
                      const isEven = idx % 2 === 1;
                      return (
                        <tr
                          key={doc.id}
                          style={{
                            background: isEven ? '#fafcff' : '#ffffff',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')}
                          onMouseLeave={e => (e.currentTarget.style.background = isEven ? '#fafcff' : '#ffffff')}
                        >
                          {/* # */}
                          <td style={{ padding: '10px 6px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '11.5px' }}>
                            {startIndex + idx + 1}
                          </td>

                          {/* ID */}
                          <td style={{ padding: '10px 6px', wordBreak: 'break-word' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#071c2c' }}>
                              {doc.id}
                            </span>
                          </td>

                          {/* ID Registrasi */}
                          <td style={{ padding: '10px 6px', wordBreak: 'break-word' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: doc.idRegistrasi !== '-' ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>
                              {doc.idRegistrasi}
                            </span>
                          </td>

                          {/* Dept/Sub Dept */}
                          <td style={{ padding: '10px 6px', color: '#0f172a', fontWeight: 500, fontSize: '11.5px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                            {doc.dept}
                          </td>

                          {/* Jenis */}
                          <td style={{ padding: '10px 6px', color: '#334155', fontSize: '11.5px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                            {doc.jenis}
                          </td>

                          {/* Judul */}
                          <td style={{ padding: '10px 6px', color: '#071c2c', fontWeight: 600, fontSize: '11.5px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                            {doc.judul}
                          </td>

                          {/* Revisi */}
                          <td style={{ padding: '10px 6px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: '11.5px' }}>
                            {doc.revisi}
                          </td>

                          {/* Folder */}
                          <td style={{ padding: '10px 6px', color: '#475569', fontSize: '11px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                            {doc.folder}
                          </td>

                          {/* Dokumen */}
                          <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                            {doc.fileName ? (
                              <button
                                type="button"
                                onClick={() => showToast(`Mengunduh dokumen: ${doc.fileName}`)}
                                title={`Unduh ${doc.fileName} (${doc.fileSize})`}
                                style={{
                                  background: '#f0f9ff',
                                  border: '1px solid #bae6fd',
                                  borderRadius: '4px',
                                  padding: '4px',
                                  cursor: 'pointer',
                                  color: '#0284c7',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <FileText size={13} />
                              </button>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>-</span>
                            )}
                          </td>

                          {/* Status */}
                          <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                            <span
                              style={{
                                background: '#0284c7',
                                color: '#ffffff',
                                padding: '2px 6px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: 700,
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {doc.status}
                            </span>
                          </td>

                          {/* Action */}
                          <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => showToast(`Edit dokumen ${doc.id}`)}
                                title="Edit Dokumen"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#0284c7',
                                  padding: '2px',
                                }}
                              >
                                <Edit size={13} />
                              </button>

                              {/* External Link / View */}
                              <button
                                type="button"
                                onClick={() => showToast(`Buka pratinjau dokumen ${doc.id}`)}
                                title="Buka Pratinjau Dokumen"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#4a3b7d',
                                  padding: '2px',
                                }}
                              >
                                <ExternalLink size={13} />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(doc.id, doc.judul)}
                                title="Hapus Dokumen"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                  padding: '2px',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        Tidak ada data distribusi dokumen yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '12.5px',
                color: '#64748b',
                background: '#ffffff',
              }}
            >
              <div>
                Showing {totalEntries === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} entries
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={validPage === 1}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: validPage === 1 ? '#f8fafc' : '#ffffff',
                    color: validPage === 1 ? '#cbd5e1' : '#334155',
                    cursor: validPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pageNum => {
                  const isCurrent = pageNum === validPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        border: isCurrent ? '1px solid #4a3b7d' : '1px solid #cbd5e1',
                        background: isCurrent ? '#4a3b7d' : '#ffffff',
                        color: isCurrent ? '#ffffff' : '#334155',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '12.5px',
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}
                {totalPages > 5 && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      border: validPage === totalPages ? '1px solid #4a3b7d' : '1px solid #cbd5e1',
                      background: validPage === totalPages ? '#4a3b7d' : '#ffffff',
                      color: validPage === totalPages ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '12.5px',
                    }}
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={validPage === totalPages || totalPages === 0}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: validPage === totalPages || totalPages === 0 ? '#f8fafc' : '#ffffff',
                    color: validPage === totalPages || totalPages === 0 ? '#cbd5e1' : '#334155',
                    cursor: validPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          SCREEN 2: FORM TAMBAH BARU (DISTRIBUSI DOKUMEN)
          ════════════════════════════════════════════════════════════ */}
      {viewState === 'form' && (
        <>
          {/* ── PAGE TITLE ── */}
          <div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#071c2c',
                margin: 0,
                fontFamily: 'var(--font-display, inherit)',
                letterSpacing: '-0.01em',
              }}
            >
              Distribusi Dokumen
            </h1>
          </div>

          {/* ── CARD CONTAINER ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(7, 28, 44, 0.03)',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Back Button */}
            <div>
              <button
                type="button"
                onClick={() => setViewState('table')}
                style={{
                  background: '#071c2c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 3px rgba(7,28,44,0.12)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0d2d47')}
                onMouseLeave={e => (e.currentTarget.style.background = '#071c2c')}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            </div>



            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '16px',
                marginBottom: '6px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setDistMode('NEW_DOC');
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  border: distMode === 'NEW_DOC' ? '2px solid #071c2c' : '1px solid #e2e8f0',
                  background: distMode === 'NEW_DOC' ? '#f0f5fa' : '#ffffff',
                  color: distMode === 'NEW_DOC' ? '#071c2c' : '#64748b',
                  fontSize: '13px',
                  fontWeight: distMode === 'NEW_DOC' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                <FolderPlus size={16} color={distMode === 'NEW_DOC' ? '#0284c7' : '#94a3b8'} />
                <span>Dokumen Baru (Pilih Folder &amp; Sub Folder)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDistMode('REVISION_UPDATE');
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  border: distMode === 'REVISION_UPDATE' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  background: distMode === 'REVISION_UPDATE' ? '#f0f9ff' : '#ffffff',
                  color: distMode === 'REVISION_UPDATE' ? '#0284c7' : '#64748b',
                  fontSize: '13px',
                  fontWeight: distMode === 'REVISION_UPDATE' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                <RefreshCw size={16} color={distMode === 'REVISION_UPDATE' ? '#0284c7' : '#94a3b8'} />
                <span>Update Dokumen Revisi (Pilih Berkas Terdaftar)</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* MODE 1: DOKUMEN BARU */}
              {distMode === 'NEW_DOC' && (
                <>
                  {/* Field 1: Folder Dokumen Utama */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Pilih Folder Utama <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={selectedFolderId}
                      onChange={e => {
                        setSelectedFolderId(e.target.value ? Number(e.target.value) : '');
                        setSelectedSubFolderId('');
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: selectedFolderId ? '#0f172a' : '#94a3b8',
                        background: '#ffffff',
                        outline: 'none',
                      }}
                      required
                    >
                      <option value="">-- Pilih Folder Utama Masterlist --</option>
                      {masterFolders.map(f => (
                        <option key={f.id} value={f.id} style={{ color: '#0f172a' }}>
                          📁 {f.name} ({f.docs?.length || 0} docs, {f.subfolders?.length || 0} sub)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field 2: Sub Folder Dokumen (Bertingkat) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Pilih Sub Folder (Bertingkat / Opsional)
                    </label>
                    <select
                      value={selectedSubFolderId}
                      onChange={e => setSelectedSubFolderId(e.target.value)}
                      disabled={!selectedFolderId}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: selectedSubFolderId ? '#0f172a' : '#64748b',
                        background: !selectedFolderId ? '#f8fafc' : '#ffffff',
                        outline: 'none',
                      }}
                    >
                      <option value="">-Root Folder (Tanpa Sub Folder)-</option>
                      {selectedFolderId &&
                        (masterFolders.find(f => f.id === Number(selectedFolderId))?.subfolders || []).map(sub => (
                          <option key={sub.id} value={sub.id} style={{ color: '#0f172a' }}>
                            📂 {sub.name} ({sub.docs?.length || 0} docs)
                          </option>
                        ))}
                    </select>
                    {selectedFolderId && (masterFolders.find(f => f.id === Number(selectedFolderId))?.subfolders || []).length === 0 && (
                      <span style={{ display: 'block', fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                        Folder ini belum memiliki sub-folder. Berkas akan dimasukkan langsung ke folder utama.
                      </span>
                    )}
                  </div>

                  {/* Field 3: Departemen & Jenis */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Departemen <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <select
                        value={dept}
                        onChange={e => setDept(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          color: dept ? '#0f172a' : '#94a3b8',
                          background: '#ffffff',
                          outline: 'none',
                        }}
                        required
                      >
                        <option value="">-Pilih Departemen-</option>
                        {DEPT_OPTIONS.map(d => (
                          <option key={d} value={d} style={{ color: '#0f172a' }}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Jenis Dokumen <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <select
                        value={jenis}
                        onChange={e => setJenis(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          color: jenis ? '#0f172a' : '#94a3b8',
                          background: '#ffffff',
                          outline: 'none',
                        }}
                        required
                      >
                        <option value="">-Pilih Jenis-</option>
                        {JENIS_OPTIONS.map(j => (
                          <option key={j} value={j} style={{ color: '#0f172a' }}>
                            {j}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Field 4: Nomor Dokumen & Revisi */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Nomor Dokumen (Opsional / Otomatis)
                      </label>
                      <input
                        type="text"
                        value={docNumber}
                        onChange={e => setDocNumber(e.target.value)}
                        placeholder="Contoh: THI-QHSSE-SOP-009"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          color: '#0f172a',
                          background: '#ffffff',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Revisi Ke
                      </label>
                      <input
                        type="text"
                        value={revisiKe}
                        onChange={e => setRevisiKe(e.target.value)}
                        placeholder="00"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          color: '#0f172a',
                          background: '#ffffff',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Field 5: Judul Dokumen */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Judul Dokumen <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={judulDokumen}
                      onChange={e => setJudulDokumen(e.target.value)}
                      placeholder="Masukkan nama judul lengkap dokumen..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: '#0f172a',
                        background: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>

                  {/* Field 6: Upload Dokumen */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Upload Berkas Dokumen (PDF/Word/Excel, Max: 2MB)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      style={{ fontSize: '13px', color: '#475569' }}
                    />
                  </div>
                </>
              )}

              {/* MODE 2: UPDATE REVISI DOKUMEN TERDAFTAR */}
              {distMode === 'REVISION_UPDATE' && (
                <>
                  {/* Field 1: Pilih Dokumen Masterlist */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Pilih Dokumen dari Masterlist yang Akan Direvisi <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={selectedExistingDocId}
                      onChange={e => setSelectedExistingDocId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: selectedExistingDocId ? '#0f172a' : '#94a3b8',
                        background: '#ffffff',
                        outline: 'none',
                      }}
                      required
                    >
                      <option value="">-- Pilih Dokumen Terdaftar --</option>
                      {flattenedDocs.map(doc => (
                        <option key={doc.id} value={doc.id} style={{ color: '#0f172a' }}>
                          [{doc.number}] {doc.title} — Current: {doc.revision} ({doc.folderName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Document Summary Card if selected */}
                  {selectedExistingDoc && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderLeft: '4px solid #0284c7',
                        borderRadius: '6px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '12.5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#071c2c', fontSize: '13.5px' }}>
                          {selectedExistingDoc.number} · {selectedExistingDoc.title}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: '#0284c7',
                            background: '#e0f2fe',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          Revisi Terdaftar: {selectedExistingDoc.revision}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '12px' }}>
                        <span>📁 Folder: <strong>{selectedExistingDoc.folderName}</strong></span>
                        {selectedExistingDoc.subFolderName && (
                          <span>📂 Sub Folder: <strong>{selectedExistingDoc.subFolderName}</strong></span>
                        )}
                        <span>Tipe: <strong>{selectedExistingDoc.type}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Field 2: Nomor Revisi Baru */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Nomor Revisi Baru <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={newRevisionNumber}
                      onChange={e => setNewRevisionNumber(e.target.value)}
                      placeholder="Contoh: Rev.04"
                      style={{
                        width: '100%',
                        maxWidth: '240px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0284c7',
                        background: '#f0f9ff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                    <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                      Sistem secara otomatis menaikkan nomor revisi berikutnya. Anda dapat menyesuaikannya bila perlu.
                    </span>
                  </div>

                  {/* Field 3: Catatan Perubahan Revisi */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Catatan Perubahan / Alasan Revisi (Change Notes) <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={revisionNotes}
                      onChange={e => setRevisionNotes(e.target.value)}
                      placeholder="Jelaskan ringkasan bagian atau klausul apa saja yang diperbarui pada revisi ini..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                      required
                    />
                  </div>

                  {/* Field 4: Upload File Revisi Baru */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Upload Berkas File Revisi Terbaru (PDF/Word/Excel, Max: 2MB) <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      ref={revFileInputRef}
                      type="file"
                      onChange={handleRevFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      style={{ fontSize: '13px', color: '#475569' }}
                      required
                    />
                  </div>
                </>
              )}

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="submit"
                  style={{
                    padding: '9px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#071c2c',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(7, 28, 44, 0.2)',
                  }}
                >
                  <Check size={14} />
                  <span>{distMode === 'NEW_DOC' ? 'Distribusikan Dokumen Baru' : 'Rilis Berkas Revisi'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
