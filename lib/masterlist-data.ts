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
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load master folders from localStorage:', err);
  }
  return [];
}

export function saveMasterFolders(folders: MasterFolder[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
    window.dispatchEvent(new Event('thi_master_folders_v3'));
  } catch (err) {
    console.error('Failed to save master folders to localStorage:', err);
  }
}

/**
 * Fetches the centralized master folders and active documents from Supabase.
 * Updates localStorage as local cache for instant zero-flicker loading.
 */
export async function fetchMasterFoldersFromServer(): Promise<MasterFolder[]> {
  try {
    const res = await fetch('/api/masterlist', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.folders)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.folders));
          window.dispatchEvent(new Event('thi_master_folders_v3'));
        }
        return data.folders;
      }
    }
  } catch (err) {
    console.warn('Gagal memuat masterlist dari server, beralih ke cache:', err);
  }
  return loadMasterFolders();
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

/* ─── DISTRIBUTION PERSISTENCE ─────────────────────────────────── */
export interface DistributionDoc {
  no: number;
  id: string;
  idRegistrasi: string;
  dept: string;
  jenis: string;
  judul: string;
  revisi: string;
  folder: string;
  groupDoc: 'HEAD_OFFICE' | 'PROJECT';
  fileName: string | null;
  fileSize?: string;
  fileUrl?: string;
  status: 'Released' | 'Approved' | 'Draft';
  createdAt: string;
  distType: 'NEW_DOC' | 'REVISION_UPDATE' | 'ANNOUNCEMENT';
}

export const DISTRIBUTIONS_STORAGE_KEY = 'thi_distributions_v2';

export function loadDistributions(): DistributionDoc[] {
  // Distributions are now served exclusively from Supabase via /api/distribution
  // This function returns empty array — use fetchDistributionsFromServer() instead
  return [];
}

export function saveDistributions(_data: DistributionDoc[]) {
  // No-op: distributions are persisted via POST /api/distribution to Supabase
  // localStorage is no longer used for distribution data
}

/**
 * Fetches the centralized distribution history from Supabase.
 */
export async function fetchDistributionsFromServer(): Promise<DistributionDoc[]> {
  try {
    const res = await fetch('/api/distribution', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.distributions)) {
        return data.distributions;
      }
    }
  } catch (err) {
    console.warn('Gagal memuat distribusi dari server:', err);
  }
  return [];
}


/**
 * Saves a new distribution record to the server.
 */
export async function saveDistributionToServer(item: DistributionDoc | DistributionDoc[]): Promise<boolean> {
  try {
    const payload = Array.isArray(item) ? { distributions: item } : { distribution: item };
    const res = await fetch('/api/distribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal mengirim catatan distribusi ke server:', err);
    return false;
  }
}


