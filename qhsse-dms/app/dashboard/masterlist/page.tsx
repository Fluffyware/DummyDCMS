'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Folder,
  FolderOpen,
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
  Filter,
  CheckCircle2,
  Clock,
  FileCheck,
  X,
  ExternalLink,
  Layers,
  ShieldAlert,
  History,
} from 'lucide-react';

/* ─── Type Definitions ────────────────────────────────────────── */
export interface RevisionLog {
  rev: string;
  date: string;
  author: string;
  approver: string;
  notes: string;
  isCurrent: boolean;
  size: string;
}
export interface MasterDocItem {
  id: string;
  number: string;
  title: string;
  revision: string;
  effectiveDate: string;
  reviewDate: string;
  status: 'CURRENT' | 'DRAFT' | 'REVISED';
  classification: 'INTERNAL' | 'CONFIDENTIAL' | 'PUBLIC';
  type: string;
  size: string;
  fileExt: 'pdf' | 'docx' | 'xlsx';
}

export interface MasterFolder {
  id: number;
  name: string;
  category: 'HEAD_OFFICE' | 'OFFSHORE' | 'PROJECT_SITE';
  description: string;
  docs: MasterDocItem[];
}

/* ─── 15 Folders Data with Exact Names ────────────────────────── */
const MASTER_FOLDERS: MasterFolder[] = [
  {
    id: 1,
    name: '1. Standar Sistem Manajemen',
    category: 'HEAD_OFFICE',
    description: 'Dokumen standar acuan ISO dan sertifikasi kepatuhan internasional.',
    docs: [
      { id: 'd1-1', number: 'THI-STD-001', title: 'ISO 9001:2015 Quality Management System Requirements', revision: 'Rev.03', effectiveDate: '01 Jan 2026', reviewDate: '01 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Standar', size: '2.4 MB', fileExt: 'pdf' },
      { id: 'd1-2', number: 'THI-STD-002', title: 'ISO 14001:2015 Environmental Management Standard', revision: 'Rev.02', effectiveDate: '15 Jan 2026', reviewDate: '15 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Standar', size: '1.9 MB', fileExt: 'pdf' },
      { id: 'd1-3', number: 'THI-STD-003', title: 'ISO 45001:2018 Occupational Health & Safety Standard', revision: 'Rev.02', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Standar', size: '3.1 MB', fileExt: 'pdf' },
      { id: 'd1-4', number: 'THI-STD-004', title: 'IMCA Marine & Survey Standard Compliance Matrix', revision: 'Rev.01', effectiveDate: '10 Feb 2026', reviewDate: '10 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Standar', size: '1.5 MB', fileExt: 'pdf' },
    ],
  },
  {
    id: 2,
    name: '2. Kebijakan',
    category: 'HEAD_OFFICE',
    description: 'Pernyataan komitmen formal manajemen puncak PT Taka Hydrocore Indonesia.',
    docs: [
      { id: 'd2-1', number: 'THI-POL-001', title: 'Kebijakan Terintegrasi Mutu, K3 & Lingkungan (QHSSE Policy)', revision: 'Rev.04', effectiveDate: '01 Jan 2026', reviewDate: '01 Jan 2027', status: 'CURRENT', classification: 'PUBLIC', type: 'Kebijakan', size: '890 KB', fileExt: 'pdf' },
      { id: 'd2-2', number: 'THI-POL-002', title: 'Kebijakan Stop Work Authority (SWA) Seluruh Personel', revision: 'Rev.03', effectiveDate: '01 Jan 2026', reviewDate: '01 Jan 2027', status: 'CURRENT', classification: 'PUBLIC', type: 'Kebijakan', size: '720 KB', fileExt: 'pdf' },
      { id: 'd2-3', number: 'THI-POL-003', title: 'Kebijakan Anti-Penyuapan, Etika Bisnis & Tata Kelola', revision: 'Rev.02', effectiveDate: '15 Feb 2026', reviewDate: '15 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Kebijakan', size: '1.1 MB', fileExt: 'pdf' },
      { id: 'd2-4', number: 'THI-POL-004', title: 'Kebijakan Bebas Alkohol & Obat-Obatan Terlarang (D&A)', revision: 'Rev.02', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Kebijakan', size: '640 KB', fileExt: 'pdf' },
    ],
  },
  {
    id: 3,
    name: '3. Peraturan Direksi',
    category: 'HEAD_OFFICE',
    description: 'Surat keputusan dan regulasi operasional yang ditetapkan oleh Direksi.',
    docs: [
      { id: 'd3-1', number: 'THI-SKD-2026-01', title: 'SK Direksi tentang Struktur Organisasi Perusahaan & Penunjukan MR', revision: 'Rev.00', effectiveDate: '02 Jan 2026', reviewDate: '02 Jan 2027', status: 'CURRENT', classification: 'CONFIDENTIAL', type: 'Peraturan Direksi', size: '1.8 MB', fileExt: 'pdf' },
      { id: 'd3-2', number: 'THI-SKD-2026-02', title: 'Peraturan Direksi tentang Batasan Otoritas Finansial (DOA)', revision: 'Rev.01', effectiveDate: '15 Jan 2026', reviewDate: '15 Jan 2027', status: 'CURRENT', classification: 'CONFIDENTIAL', type: 'Peraturan Direksi', size: '1.4 MB', fileExt: 'pdf' },
      { id: 'd3-3', number: 'THI-SKD-2026-03', title: 'Ketentuan Tunjangan Penugasan Lepas Pantai (Offshore Allowance)', revision: 'Rev.02', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Peraturan Direksi', size: '950 KB', fileExt: 'pdf' },
    ],
  },
  {
    id: 4,
    name: '4. Proses Bisnis',
    category: 'HEAD_OFFICE',
    description: 'Peta keterkaitan antarproses inti dan pendukung operasional perusahaan.',
    docs: [
      { id: 'd4-1', number: 'THI-BP-001', title: 'Peta Arsitektur Proses Bisnis Terpadu PT Taka Hydrocore Indonesia', revision: 'Rev.02', effectiveDate: '10 Jan 2026', reviewDate: '10 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Proses Bisnis', size: '3.8 MB', fileExt: 'pdf' },
      { id: 'd4-2', number: 'THI-BP-002', title: 'Alur Proses Layanan Geoteknik Kelautan (Offshore Geotechnical Flow)', revision: 'Rev.03', effectiveDate: '20 Jan 2026', reviewDate: '20 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Proses Bisnis', size: '2.1 MB', fileExt: 'pdf' },
      { id: 'd4-3', number: 'THI-BP-003', title: 'Prosedur Manajemen Perubahan Operasional (Management of Change)', revision: 'Rev.01', effectiveDate: '05 Feb 2026', reviewDate: '05 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Proses Bisnis', size: '1.2 MB', fileExt: 'pdf' },
    ],
  },
  {
    id: 5,
    name: '5. Manual Sistem Manajemen',
    category: 'HEAD_OFFICE',
    description: 'Buku panduan induk sistem manajemen mutu, keselamatan, dan lingkungan.',
    docs: [
      { id: 'd5-1', number: 'THI-MAN-001', title: 'Integrated Management System Manual (IMS Manual)', revision: 'Rev.04', effectiveDate: '01 Jan 2026', reviewDate: '01 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Manual', size: '5.2 MB', fileExt: 'pdf' },
      { id: 'd5-2', number: 'THI-MAN-002', title: 'Manual Tanggap Darurat & Penanggulangan Krisis Perusahaan', revision: 'Rev.02', effectiveDate: '15 Jan 2026', reviewDate: '15 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Manual', size: '3.4 MB', fileExt: 'pdf' },
    ],
  },
  {
    id: 6,
    name: '6. Corporate Planning & Evaluation',
    category: 'HEAD_OFFICE',
    description: 'Rencana kerja strategis, sasaran tahunan, dan evaluasi capaian kinerja.',
    docs: [
      { id: 'd6-1', number: 'THI-CPE-001', title: 'Rencana Strategis & Target Tahunan Perusahaan 2026', revision: 'Rev.01', effectiveDate: '05 Jan 2026', reviewDate: '05 Jan 2027', status: 'CURRENT', classification: 'CONFIDENTIAL', type: 'Corporate Plan', size: '2.7 MB', fileExt: 'pdf' },
      { id: 'd6-2', number: 'THI-CPE-002', title: 'Matriks Pengukuran KPI Organisasi & Corporate Scorecard', revision: 'Rev.02', effectiveDate: '12 Jan 2026', reviewDate: '12 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Evaluasi', size: '1.6 MB', fileExt: 'xlsx' },
    ],
  },
  {
    id: 7,
    name: '7. QHSSE Management System',
    category: 'HEAD_OFFICE',
    description: 'Prosedur keselamatan kerja, manajemen bahaya, dan kesehatan lingkungan kerja.',
    docs: [
      { id: 'd7-1', number: 'THI-QHSSE-SOP-001', title: 'Prosedur Identifikasi Bahaya & Penilaian Risiko (HIRA / HAZID)', revision: 'Rev.03', effectiveDate: '10 Jan 2026', reviewDate: '10 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '1.7 MB', fileExt: 'pdf' },
      { id: 'd7-2', number: 'THI-QHSSE-SOP-002', title: 'Prosedur Investigasi Insiden, Pelaporan Kecelakaan & Near Miss', revision: 'Rev.03', effectiveDate: '15 Jan 2026', reviewDate: '15 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '2.0 MB', fileExt: 'pdf' },
      { id: 'd7-3', number: 'THI-QHSSE-WI-003', title: 'Instruksi Kerja Penggunaan APD Standar Pekerjaan Offshore & Rig', revision: 'Rev.02', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Work Instruction', size: '980 KB', fileExt: 'pdf' },
      { id: 'd7-4', number: 'THI-QHSSE-FRM-004', title: 'Formulir Izin Kerja Aman (Permit to Work - PTW)', revision: 'Rev.04', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Formulir', size: '420 KB', fileExt: 'docx' },
    ],
  },
  {
    id: 8,
    name: '8. Marketing & Sales',
    category: 'HEAD_OFFICE',
    description: 'Prosedur penawaran tender, kontrak jasa survei, dan manajemen kepuasan klien.',
    docs: [
      { id: 'd8-1', number: 'THI-MKT-SOP-001', title: 'Prosedur Penyusunan Proposal Teknis & Komersial Tender', revision: 'Rev.02', effectiveDate: '08 Jan 2026', reviewDate: '08 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '1.3 MB', fileExt: 'pdf' },
      { id: 'd8-2', number: 'THI-MKT-PRO-002', title: 'Prosedur Pengukuran Kepuasan Pelanggan (Customer Satisfaction Survey)', revision: 'Rev.01', effectiveDate: '20 Jan 2026', reviewDate: '20 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Prosedur', size: '820 KB', fileExt: 'pdf' },
    ],
  },
  {
    id: 9,
    name: '9. Engineering',
    category: 'HEAD_OFFICE',
    description: 'Standar metodologi geoteknik, uji laboratorium tanah, dan survei geofisika.',
    docs: [
      { id: 'd9-1', number: 'THI-ENG-SOP-001', title: 'Prosedur Pemboran Inti & Soil Sampling Lepas Pantai', revision: 'Rev.03', effectiveDate: '15 Jan 2026', reviewDate: '15 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '4.2 MB', fileExt: 'pdf' },
      { id: 'd9-2', number: 'THI-ENG-SOP-002', title: 'Kalibrasi & Pelaksanaan Cone Penetration Test (CPT/PCPT)', revision: 'Rev.02', effectiveDate: '22 Jan 2026', reviewDate: '22 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '3.1 MB', fileExt: 'pdf' },
      { id: 'd9-3', number: 'THI-ENG-WI-003', title: 'Instruksi Kerja Pengujian Laboratorium Mekanika Tanah Onshore', revision: 'Rev.01', effectiveDate: '05 Feb 2026', reviewDate: '05 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Work Instruction', size: '1.8 MB', fileExt: 'pdf' },
    ],
  },
  {
    id: 10,
    name: '10. Information Technology',
    category: 'HEAD_OFFICE',
    description: 'Prosedur keamanan data, akses jaringan offshore-to-shore, dan lisensi perangkat lunak.',
    docs: [
      { id: 'd10-1', number: 'THI-IT-SOP-001', title: 'Prosedur Keamanan Informasi & Akses Jaringan Komputer', revision: 'Rev.02', effectiveDate: '12 Jan 2026', reviewDate: '12 Jan 2027', status: 'CURRENT', classification: 'CONFIDENTIAL', type: 'SOP', size: '1.4 MB', fileExt: 'pdf' },
      { id: 'd10-2', number: 'THI-IT-WI-002', title: 'Panduan Backup Data Akuisisi Survei Kapal & Cloud Storage DMS', revision: 'Rev.01', effectiveDate: '25 Jan 2026', reviewDate: '25 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Work Instruction', size: '910 KB', fileExt: 'pdf' },
    ],
  },
  {
    id: 11,
    name: '11. Logistic',
    category: 'HEAD_OFFICE',
    description: 'Pengelolaan pergudangan, rantai pasok material kapal, dan mobilisasi peralatan berat.',
    docs: [
      { id: 'd11-1', number: 'THI-LOG-SOP-001', title: 'Prosedur Pengadaan Barang & Seleksi Pemasok Terkualifikasi', revision: 'Rev.02', effectiveDate: '10 Jan 2026', reviewDate: '10 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '1.6 MB', fileExt: 'pdf' },
      { id: 'd11-2', number: 'THI-LOG-SOP-002', title: 'Prosedur Mobilisasi dan Demobilisasi Alat Survei Kelautan', revision: 'Rev.03', effectiveDate: '18 Jan 2026', reviewDate: '18 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '2.5 MB', fileExt: 'pdf' },
    ],
  },
  {
    id: 12,
    name: '12. Project Management',
    category: 'HEAD_OFFICE',
    description: 'Tata laksana eksekusi proyek, pembuatan jadwal kerja, dan laporan kemajuan harian (DPR).',
    docs: [
      { id: 'd12-1', number: 'THI-PM-SOP-001', title: 'Prosedur Perencanaan & Pengendalian Proyek Survei Kelautan', revision: 'Rev.02', effectiveDate: '14 Jan 2026', reviewDate: '14 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '2.8 MB', fileExt: 'pdf' },
      { id: 'd12-2', number: 'THI-PM-TMP-002', title: 'Template Standar Daily Progress Report (DPR) Offshore', revision: 'Rev.03', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Template', size: '640 KB', fileExt: 'xlsx' },
    ],
  },
  {
    id: 13,
    name: '13. Human Capital',
    category: 'HEAD_OFFICE',
    description: 'Regulasi ketenagakerjaan, sertifikasi pelaut (BOSIET/OGUK), dan pengembangan kompetensi.',
    docs: [
      { id: 'd13-1', number: 'THI-HC-SOP-001', title: 'Prosedur Rekrutmen, Onboarding & Verifikasi Sertifikat Kru Kapal', revision: 'Rev.02', effectiveDate: '08 Jan 2026', reviewDate: '08 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '1.5 MB', fileExt: 'pdf' },
      { id: 'd13-2', number: 'THI-HC-SOP-002', title: 'Prosedur Matriks Pelatihan & Pengembangan Kompetensi Karyawan', revision: 'Rev.01', effectiveDate: '20 Jan 2026', reviewDate: '20 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '1.2 MB', fileExt: 'pdf' },
    ],
  },
  {
    id: 14,
    name: '14. General Affair',
    category: 'HEAD_OFFICE',
    description: 'Pemeliharaan fasilitas kantor pusat, mess kru operasional, dan perizinan operasional umum.',
    docs: [
      { id: 'd14-1', number: 'THI-GA-SOP-001', title: 'Prosedur Pengelolaan Fasilitas Kantor & Mess Karyawan', revision: 'Rev.01', effectiveDate: '12 Jan 2026', reviewDate: '12 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '1.1 MB', fileExt: 'pdf' },
      { id: 'd14-2', number: 'THI-GA-WI-002', title: 'Instruksi Kerja Pemeliharaan Kendaraan Operasional & Pool Mobil', revision: 'Rev.01', effectiveDate: '28 Jan 2026', reviewDate: '28 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Work Instruction', size: '850 KB', fileExt: 'pdf' },
    ],
  },
  {
    id: 15,
    name: '15. Finance & Accounting',
    category: 'HEAD_OFFICE',
    description: 'Standar penagihan proyek klien (invoicing), kas kecil lapangan, dan audit laporan keuangan.',
    docs: [
      { id: 'd15-1', number: 'THI-FIN-SOP-001', title: 'Prosedur Penagihan Pembayaran Proyek (Invoicing) & Rekonsiliasi', revision: 'Rev.02', effectiveDate: '10 Jan 2026', reviewDate: '10 Jan 2027', status: 'CURRENT', classification: 'CONFIDENTIAL', type: 'SOP', size: '1.7 MB', fileExt: 'pdf' },
      { id: 'd15-2', number: 'THI-FIN-SOP-002', title: 'Prosedur Pengelolaan Kas Kecil Lapangan (Offshore Petty Cash)', revision: 'Rev.02', effectiveDate: '25 Jan 2026', reviewDate: '25 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '1.3 MB', fileExt: 'pdf' },
    ],
  },
];

/* ─── Main Masterlist Component ───────────────────────────────── */
export default function MasterlistPage() {
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Active category filter tab
  const [activeTab, setActiveTab] = useState<'HEAD_OFFICE' | 'OFFSHORE' | 'PROJECT_SITE'>('HEAD_OFFICE');

  // Expanded folders state (set of folder IDs)
  const [expandedFolderIds, setExpandedFolderIds] = useState<number[]>([1]); // folder 1 open by default

  // Selected document for preview modal
  const [previewDoc, setPreviewDoc] = useState<MasterDocItem | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'history'>('info');

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

  // Total documents count
  const totalDocsCount = useMemo(() => {
    return MASTER_FOLDERS.reduce((acc, f) => acc + f.docs.length, 0);
  }, []);

  // Filter folders based on category & search query
  const filteredFolders = useMemo(() => {
    let folders = MASTER_FOLDERS;
    if (activeTab !== 'HEAD_OFFICE') {
      // In demo data, default folders are under HEAD_OFFICE, but we can filter or show subset
      folders = MASTER_FOLDERS.filter(f => f.category === activeTab);
    }

    if (!searchQuery.trim()) {
      return folders;
    }

    const q = searchQuery.toLowerCase().trim();
    return folders
      .map(folder => {
        const folderMatches = folder.name.toLowerCase().includes(q) || folder.description.toLowerCase().includes(q);
        const matchedDocs = folder.docs.filter(
          d =>
            d.number.toLowerCase().includes(q) ||
            d.title.toLowerCase().includes(q) ||
            d.type.toLowerCase().includes(q) ||
            d.classification.toLowerCase().includes(q)
        );

        if (folderMatches || matchedDocs.length > 0) {
          return {
            ...folder,
            // If the folder matched but no docs specifically matched, show all its docs, otherwise show matched docs
            docs: matchedDocs.length > 0 ? matchedDocs : folder.docs,
          };
        }
        return null;
      })
      .filter((f): f is MasterFolder => f !== null);
  }, [searchQuery, activeTab]);


  // Toggle single folder
  const toggleFolder = (folderId: number) => {
    setExpandedFolderIds(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  // Expand all folders
  const handleExpandAll = () => {
    setExpandedFolderIds(MASTER_FOLDERS.map(f => f.id));
  };

  // Collapse all folders
  const handleCollapseAll = () => {
    setExpandedFolderIds([]);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
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
          {/* Official Logo (Clean, No Card) */}
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


      </div>

      {/* ─── Search Bar (exact minimalist design matching screenshot) ─── */}
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
            placeholder="Search for file .."
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
        {/* Exact Location Pill matching screenshot: "HEAD OFFICE" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('HEAD_OFFICE')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'HEAD_OFFICE' ? '#1e1b4b' : '#f1f5f9',
              color: activeTab === 'HEAD_OFFICE' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'HEAD_OFFICE' ? '0 2px 4px rgba(30, 27, 75, 0.2)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={13} />
            HEAD OFFICE
          </button>

          <button
            onClick={() => setActiveTab('OFFSHORE')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'OFFSHORE' ? '#1e1b4b' : '#f1f5f9',
              color: activeTab === 'OFFSHORE' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            <Ship size={13} />
            VESSEL & OFFSHORE
          </button>

          <button
            onClick={() => setActiveTab('PROJECT_SITE')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'PROJECT_SITE' ? '#1e1b4b' : '#f1f5f9',
              color: activeTab === 'PROJECT_SITE' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            <HardHat size={13} />
            PROJECT BASE
          </button>
        </div>

        {/* Expand / Collapse All */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {filteredFolders.length} Kategori · {totalDocsCount} Dokumen
          </span>
          <span style={{ color: '#cbd5e1' }}>·</span>
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

      {/* ─── MAIN CONTENT VIEW ─────────────────────────────────────── */}
      {
        /* ─── MINIMALIST FOLDER LIST (Matching Screenshot Exactly) ─── */
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

              return (
                <div
                  key={folder.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.18s ease',
                    boxShadow: isExpanded ? '0 2px 6px rgba(0,0,0,0.02)' : 'none',
                  }}
                >
                  {/* ── Single Folder Row ── */}
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
                    {/* Left: Folder Icon & Exact Name */}
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
                          <FolderOpen size={18} strokeWidth={1.75} color="#0284c7" />
                        ) : (
                          <Folder size={18} strokeWidth={1.75} />
                        )}
                      </div>

                      <div>
                        <span
                          style={{
                            fontSize: '13.5px',
                            fontWeight: 500,
                            color: isExpanded ? '#071c2c' : '#334155',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {folder.name}
                        </span>
                      </div>
                    </div>

                    {/* Right: Counter badge & '+' or '−' toggle icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          fontWeight: 500,
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '10px',
                        }}
                      >
                        {folder.docs.length} Dokumen
                      </span>

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
                          transition: 'transform 0.15s ease',
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

                  {/* ── Expanded Document List ── */}
                  {isExpanded && (
                    <div style={{ background: '#ffffff', padding: '6px 0' }}>
                      {folder.docs.length === 0 ? (
                        <div style={{ padding: '16px 24px', fontSize: '12.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Belum ada dokumen yang terdaftar dalam folder ini.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {folder.docs.map((doc, idx) => (
                            <div
                              key={doc.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 18px 10px 48px',
                                borderTop: idx > 0 ? '1px solid #f8fafc' : 'none',
                                transition: 'background 0.12s ease',
                              }}
                              onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              {/* Left: Doc Icon, Number, Title */}
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
                                      letterSpacing: '0.01em',
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
                                      maxWidth: '520px',
                                    }}
                                  >
                                    {doc.title}
                                  </span>
                                </div>
                              </div>

                              {/* Right: Meta & Clean Actions */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontFamily: 'var(--font-mono)',
                                    color: '#64748b',
                                  }}
                                >
                                  {doc.revision}
                                </span>

                                <span
                                  style={{
                                    fontSize: '11.5px',
                                    color: '#94a3b8',
                                  }}
                                >
                                  {doc.effectiveDate}
                                </span>



                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      setModalTab('info');
                                      setPreviewDoc(doc);
                                    }}
                                    title="Lihat Detail & Pratinjau Dokumen"
                                    style={{
                                      background: 'transparent',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '5px',
                                      padding: '6px',
                                      color: '#334155',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.15s ease',
                                    }}
                                    onMouseOver={e => {
                                      e.currentTarget.style.borderColor = '#0284c7';
                                      e.currentTarget.style.color = '#0284c7';
                                    }}
                                    onMouseOut={e => {
                                      e.currentTarget.style.borderColor = '#e2e8f0';
                                      e.currentTarget.style.color = '#334155';
                                    }}
                                  >
                                    <Eye size={14} />
                                  </button>

                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      setModalTab('history');
                                      setPreviewDoc(doc);
                                    }}
                                    title="Lihat Riwayat Revisi & Change Log"
                                    style={{
                                      background: '#f0f9ff',
                                      border: '1px solid #bae6fd',
                                      borderRadius: '5px',
                                      padding: '6px',
                                      color: '#0369a1',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.15s ease',
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.background = '#e0f2fe')}
                                    onMouseOut={e => (e.currentTarget.style.background = '#f0f9ff')}
                                  >
                                    <History size={14} />
                                  </button>

                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      alert(`Mengunduh file resmi ${doc.number} (${doc.fileExt.toUpperCase()})`);
                                    }}
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
                                    onMouseOver={e => (e.currentTarget.style.background = '#e2e8f0')}
                                    onMouseOut={e => (e.currentTarget.style.background = '#f8fafc')}
                                  >
                                    <Download size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      }

      {/* ─── Minimalist Document Preview Modal ────────────────────── */}

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
            {/* Modal Header with Logo Accent */}
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
