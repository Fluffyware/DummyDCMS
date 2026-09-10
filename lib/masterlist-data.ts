/* ─── THI MASTERLIST DOCUMENT DATA & PERSISTENCE ────────────────── */

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
  subFolderId?: string;
  subFolderName?: string;
}

export interface MasterSubFolder {
  id: string;
  name: string;
  docs: MasterDocItem[];
}

export interface MasterFolder {
  id: number;
  name: string;
  category: 'HEAD_OFFICE' | 'OFFSHORE' | 'PROJECT_SITE';
  description: string;
  docs: MasterDocItem[];
  subfolders?: MasterSubFolder[];
}

export const INITIAL_MASTER_FOLDERS: MasterFolder[] = [
  {
    id: 1,
    name: '1. Standar Sistem Manajemen',
    category: 'HEAD_OFFICE',
    description: 'Dokumen standar acuan ISO dan sertifikasi kepatuhan internasional.',
    docs: [
      { id: 'd1-1', number: 'THI-STD-001', title: 'ISO 9001:2015 Quality Management System Requirements', revision: 'Rev.03', effectiveDate: '01 Jan 2026', reviewDate: '01 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Standar', size: '2.4 MB', fileExt: 'pdf' },
      { id: 'd1-2', number: 'THI-STD-002', title: 'ISO 14001:2015 Environmental Management Standard', revision: 'Rev.02', effectiveDate: '15 Jan 2026', reviewDate: '15 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Standar', size: '1.9 MB', fileExt: 'pdf' },
    ],
    subfolders: [
      {
        id: 'sub-1-1',
        name: '1.1 Standar K3LH & Mutu Internasional',
        docs: [
          { id: 'd1-3', number: 'THI-STD-003', title: 'ISO 45001:2018 Occupational Health & Safety Standard', revision: 'Rev.02', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Standar', size: '3.1 MB', fileExt: 'pdf', subFolderId: 'sub-1-1', subFolderName: '1.1 Standar K3LH & Mutu Internasional' },
        ],
      },
      {
        id: 'sub-1-2',
        name: '1.2 Standar Kelautan IMCA & Marine Compliance',
        docs: [
          { id: 'd1-4', number: 'THI-STD-004', title: 'IMCA Marine & Survey Standard Compliance Matrix', revision: 'Rev.01', effectiveDate: '10 Feb 2026', reviewDate: '10 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Standar', size: '1.5 MB', fileExt: 'pdf', subFolderId: 'sub-1-2', subFolderName: '1.2 Standar Kelautan IMCA & Marine Compliance' },
        ],
      },
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
    ],
    subfolders: [
      {
        id: 'sub-2-1',
        name: '2.1 Kebijakan Tata Kelola & Integritas',
        docs: [
          { id: 'd2-3', number: 'THI-POL-003', title: 'Kebijakan Anti-Penyuapan, Etika Bisnis & Tata Kelola', revision: 'Rev.02', effectiveDate: '15 Feb 2026', reviewDate: '15 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Kebijakan', size: '1.1 MB', fileExt: 'pdf', subFolderId: 'sub-2-1', subFolderName: '2.1 Kebijakan Tata Kelola & Integritas' },
          { id: 'd2-4', number: 'THI-POL-004', title: 'Kebijakan Bebas Alkohol & Obat-Obatan Terlarang (D&A)', revision: 'Rev.02', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Kebijakan', size: '640 KB', fileExt: 'pdf', subFolderId: 'sub-2-1', subFolderName: '2.1 Kebijakan Tata Kelola & Integritas' },
        ],
      },
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
    subfolders: [],
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
    subfolders: [],
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
    subfolders: [],
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
    subfolders: [],
  },
  {
    id: 7,
    name: '7. QHSSE Management System',
    category: 'HEAD_OFFICE',
    description: 'Prosedur keselamatan kerja, manajemen bahaya, dan kesehatan lingkungan kerja.',
    docs: [],
    subfolders: [
      {
        id: 'sub-7-1',
        name: '7.1 Standard Operating Procedure (SOP)',
        docs: [
          { id: 'd7-1', number: 'THI-QHSSE-SOP-001', title: 'Prosedur Identifikasi Bahaya & Penilaian Risiko (HIRA / HAZID)', revision: 'Rev.03', effectiveDate: '10 Jan 2026', reviewDate: '10 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '1.7 MB', fileExt: 'pdf', subFolderId: 'sub-7-1', subFolderName: '7.1 Standard Operating Procedure (SOP)' },
          { id: 'd7-2', number: 'THI-QHSSE-SOP-002', title: 'Prosedur Investigasi Insiden, Pelaporan Kecelakaan & Near Miss', revision: 'Rev.03', effectiveDate: '15 Jan 2026', reviewDate: '15 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '2.0 MB', fileExt: 'pdf', subFolderId: 'sub-7-1', subFolderName: '7.1 Standard Operating Procedure (SOP)' },
        ],
      },
      {
        id: 'sub-7-2',
        name: '7.2 Work Instruction (WI) & Formulir',
        docs: [
          { id: 'd7-3', number: 'THI-QHSSE-WI-003', title: 'Instruksi Kerja Penggunaan APD Standar Pekerjaan Offshore & Rig', revision: 'Rev.02', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Work Instruction', size: '980 KB', fileExt: 'pdf', subFolderId: 'sub-7-2', subFolderName: '7.2 Work Instruction (WI) & Formulir' },
          { id: 'd7-4', number: 'THI-QHSSE-FRM-004', title: 'Formulir Izin Kerja Aman (Permit to Work - PTW)', revision: 'Rev.04', effectiveDate: '01 Feb 2026', reviewDate: '01 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Formulir', size: '420 KB', fileExt: 'docx', subFolderId: 'sub-7-2', subFolderName: '7.2 Work Instruction (WI) & Formulir' },
        ],
      },
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
    subfolders: [],
  },
  {
    id: 9,
    name: '9. Engineering',
    category: 'HEAD_OFFICE',
    description: 'Standar metodologi geoteknik, uji laboratorium tanah, dan survei geofisika.',
    docs: [],
    subfolders: [
      {
        id: 'sub-9-1',
        name: '9.1 Offshore Geotechnical Investigation',
        docs: [
          { id: 'd9-1', number: 'THI-ENG-SOP-001', title: 'Prosedur Pemboran Inti & Soil Sampling Lepas Pantai', revision: 'Rev.03', effectiveDate: '15 Jan 2026', reviewDate: '15 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '4.2 MB', fileExt: 'pdf', subFolderId: 'sub-9-1', subFolderName: '9.1 Offshore Geotechnical Investigation' },
          { id: 'd9-2', number: 'THI-ENG-SOP-002', title: 'Kalibrasi & Pelaksanaan Cone Penetration Test (CPT/PCPT)', revision: 'Rev.02', effectiveDate: '22 Jan 2026', reviewDate: '22 Jan 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'SOP', size: '3.1 MB', fileExt: 'pdf', subFolderId: 'sub-9-1', subFolderName: '9.1 Offshore Geotechnical Investigation' },
        ],
      },
      {
        id: 'sub-9-2',
        name: '9.2 Soil Mechanics Laboratory Testing',
        docs: [
          { id: 'd9-3', number: 'THI-ENG-WI-003', title: 'Instruksi Kerja Pengujian Laboratorium Mekanika Tanah Onshore', revision: 'Rev.01', effectiveDate: '05 Feb 2026', reviewDate: '05 Feb 2027', status: 'CURRENT', classification: 'INTERNAL', type: 'Work Instruction', size: '1.8 MB', fileExt: 'pdf', subFolderId: 'sub-9-2', subFolderName: '9.2 Soil Mechanics Laboratory Testing' },
        ],
      },
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
    subfolders: [],
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
    subfolders: [],
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
    subfolders: [],
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
    subfolders: [],
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
    subfolders: [],
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
    subfolders: [],
  },
];

const STORAGE_KEY = 'thi_master_folders_v2';

export function loadMasterFolders(): MasterFolder[] {
  if (typeof window === 'undefined') return INITIAL_MASTER_FOLDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load master folders from localStorage:', err);
  }
  return INITIAL_MASTER_FOLDERS;
}

export function saveMasterFolders(folders: MasterFolder[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  } catch (err) {
    console.error('Failed to save master folders to localStorage:', err);
  }
}

export interface FlattenedDocItem extends MasterDocItem {
  folderId: number;
  folderName: string;
  subFolderId?: string;
  subFolderName?: string;
}

export function getAllFlattenedDocs(folders: MasterFolder[]): FlattenedDocItem[] {
  const allDocs: FlattenedDocItem[] = [];
  folders.forEach(f => {
    (f.docs || []).forEach(doc => {
      allDocs.push({
        ...doc,
        folderId: f.id,
        folderName: f.name,
      });
    });
    (f.subfolders || []).forEach(sub => {
      (sub.docs || []).forEach(doc => {
        allDocs.push({
          ...doc,
          folderId: f.id,
          folderName: f.name,
          subFolderId: sub.id,
          subFolderName: sub.name,
        });
      });
    });
  });
  return allDocs;
}
