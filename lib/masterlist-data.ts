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
  r2Key?: string;
  r2Url?: string;
}

export interface MasterSubFolder {
  id: string;
  name: string;
  docs: MasterDocItem[];
  subfolders?: MasterSubFolder[];
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
    docs: [],
    subfolders: [
      {
        id: 'sub-1-1',
        name: '1.1 Standar K3LH & Mutu Internasional',
        docs: [],
      },
      {
        id: 'sub-1-2',
        name: '1.2 Standar Kelautan IMCA & Marine Compliance',
        docs: [],
      },
    ],
  },
  {
    id: 2,
    name: '2. Kebijakan',
    category: 'HEAD_OFFICE',
    description: 'Pernyataan komitmen formal manajemen puncak PT Taka Hydrocore Indonesia.',
    docs: [],
    subfolders: [
      {
        id: 'sub-2-1',
        name: '2.1 Kebijakan Tata Kelola & Integritas',
        docs: [],
      },
    ],
  },
  {
    id: 3,
    name: '3. Peraturan Direksi',
    category: 'HEAD_OFFICE',
    description: 'Surat keputusan dan regulasi operasional yang ditetapkan oleh Direksi.',
    docs: [],
    subfolders: [],
  },
  {
    id: 4,
    name: '4. Proses Bisnis',
    category: 'HEAD_OFFICE',
    description: 'Peta keterkaitan antarproses inti dan pendukung operasional perusahaan.',
    docs: [],
    subfolders: [],
  },
  {
    id: 5,
    name: '5. Manual Sistem Manajemen',
    category: 'HEAD_OFFICE',
    description: 'Buku panduan induk sistem manajemen mutu, keselamatan, dan lingkungan.',
    docs: [],
    subfolders: [],
  },
  {
    id: 6,
    name: '6. Corporate Planning & Evaluation',
    category: 'HEAD_OFFICE',
    description: 'Rencana kerja strategis, sasaran tahunan, dan evaluasi capaian kinerja.',
    docs: [],
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
        docs: [],
      },
      {
        id: 'sub-7-2',
        name: '7.2 Work Instruction (WI) & Formulir',
        docs: [],
      },
    ],
  },
  {
    id: 8,
    name: '8. Marketing & Sales',
    category: 'HEAD_OFFICE',
    description: 'Prosedur penawaran tender, kontrak jasa survei, dan manajemen kepuasan klien.',
    docs: [],
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
        docs: [],
      },
      {
        id: 'sub-9-2',
        name: '9.2 Soil Mechanics Laboratory Testing',
        docs: [],
      },
    ],
  },
  {
    id: 10,
    name: '10. Information Technology',
    category: 'HEAD_OFFICE',
    description: 'Prosedur keamanan data, akses jaringan offshore-to-shore, dan lisensi perangkat lunak.',
    docs: [],
    subfolders: [],
  },
  {
    id: 11,
    name: '11. Logistic',
    category: 'HEAD_OFFICE',
    description: 'Pengelolaan pergudangan, rantai pasok material kapal, dan mobilisasi peralatan berat.',
    docs: [],
    subfolders: [],
  },
  {
    id: 12,
    name: '12. Project Management',
    category: 'HEAD_OFFICE',
    description: 'Tata laksana eksekusi proyek, pembuatan jadwal kerja, dan laporan kemajuan harian (DPR).',
    docs: [],
    subfolders: [],
  },
  {
    id: 13,
    name: '13. Human Capital',
    category: 'HEAD_OFFICE',
    description: 'Regulasi ketenagakerjaan, sertifikasi pelaut (BOSIET/OGUK), dan pengembangan kompetensi.',
    docs: [],
    subfolders: [],
  },
  {
    id: 14,
    name: '14. General Affair',
    category: 'HEAD_OFFICE',
    description: 'Pemeliharaan fasilitas kantor pusat, mess kru operasional, dan perizinan operasional umum.',
    docs: [],
    subfolders: [],
  },
  {
    id: 15,
    name: '15. Finance & Accounting',
    category: 'HEAD_OFFICE',
    description: 'Standar penagihan proyek klien (invoicing), kas kecil lapangan, dan audit laporan keuangan.',
    docs: [],
    subfolders: [],
  },
];

const STORAGE_KEY = 'thi_master_folders_v3';

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
