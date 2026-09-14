/* ─── THI SUGGESTIONS & IDEAS PERSISTENCE & SYNC ──────────────── */

import { supabase, isSupabaseConfigured } from './supabase';

export interface Suggestion {
  id: string; // e.g. 'SGS-001'
  nama: string;
  dept: string;
  judul: string;
  masalah: string;
  idePerbaikan: string;
  foto: string | null; // base64 data URL or null
  fotoName: string | null;
  status: 'Baru' | 'Ditinjau' | 'Diterima' | 'Ditolak';
  createdAt: string; // format: DD/MM/YYYY
  userId?: string; // e.g. 'staff-hr'
  supabaseId?: string;
}

export const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 'SGS-001',
    nama: 'Staff Geotechnical',
    dept: 'Geotechnical',
    judul: 'Digitalisasi Lembar Log Pemboran Lapangan Offshore',
    masalah: 'Pencatatan soil sampling dan SPT di kapal/rig masih memakai formulir kertas, rentan rusak terkena air laut dan lambat direkap ke master database kantor pusat.',
    idePerbaikan: 'Implementasi input digital langsung melalui formulir DMS di tablet kerja lapangan agar data log pengeboran tersinkronisasi terpusat.',
    foto: null,
    fotoName: null,
    status: 'Diterima',
    createdAt: '10/09/2026',
    userId: 'staff-geo',
  },
  {
    id: 'SGS-002',
    nama: 'Staff HR & General Affairs',
    dept: 'HR & General Affairs',
    judul: 'Penyederhanaan Form Pengajuan Cuti & Roster Lapangan',
    masalah: 'Approval pergantian roster kru kapal dan izin cuti membutuhkan 3 tanda tangan basah fisik sehingga butuh 3-5 hari sebelum kru berangkat.',
    idePerbaikan: 'Gunakan alur verifikasi digital satu pintu di sistem DMS dengan notifikasi otomatis agar persetujuan selesai dalam 24 jam.',
    foto: null,
    fotoName: null,
    status: 'Ditinjau',
    createdAt: '12/09/2026',
    userId: 'staff-hr',
  },
  {
    id: 'SGS-003',
    nama: 'Staff Operations',
    dept: 'Operations',
    judul: 'Pemberian Label QR Code Checklist Harian Alat Berat & Crane',
    masalah: 'Operator lapangan sering kesulitan mengecek riwayat inspeksi berkala pada unit crane dan winch sebelum mulai operasional harian.',
    idePerbaikan: 'Pasang pelat/stiker QR Code tahan cuaca pada setiap unit alat yang langsung membuka lembar checklist dan SOP perawatan di DMS.',
    foto: null,
    fotoName: null,
    status: 'Baru',
    createdAt: '14/09/2026',
    userId: 'staff-ops',
  },
];

const STORAGE_KEY = 'thi_suggestions_v3';

/**
 * Load suggestions from localStorage with fallback to INITIAL_SUGGESTIONS
 */
export function loadSuggestions(): Suggestion[] {
  if (typeof window === 'undefined') return INITIAL_SUGGESTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load suggestions from localStorage:', err);
  }
  // If nothing in storage, seed and return initial suggestions
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUGGESTIONS));
  } catch {}
  return INITIAL_SUGGESTIONS;
}

/**
 * Save suggestions to localStorage and notify other components
 */
export function saveSuggestions(items: Suggestion[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('thi_suggestions_updated', { detail: items }));
  } catch (err) {
    console.error('Failed to save suggestions to localStorage:', err);
  }
}

/**
 * Format current date as DD/MM/YYYY
 */
export function getCurrentDateFormatted(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Generate a new unique SGS ID
 */
export function generateSuggestionId(currentItems: Suggestion[]): string {
  let maxNum = 0;
  currentItems.forEach(item => {
    const match = item.id.match(/^SGS-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  return `SGS-${String(maxNum + 1).padStart(3, '0')}`;
}

/**
 * Add a new suggestion, persist locally and sync to Supabase
 */
export async function addSuggestion(
  newSugg: Omit<Suggestion, 'id' | 'createdAt'> & { createdAt?: string }
): Promise<Suggestion> {
  const existing = loadSuggestions();
  const newId = generateSuggestionId(existing);
  const createdAt = newSugg.createdAt || getCurrentDateFormatted();

  const suggestionItem: Suggestion = {
    ...newSugg,
    id: newId,
    createdAt,
    status: newSugg.status || 'Baru',
  };

  const updated = [suggestionItem, ...existing];
  saveSuggestions(updated);

  // Sync to Supabase in the background
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('suggestions').insert({
        title: suggestionItem.judul,
        description: JSON.stringify({
          masalah: suggestionItem.masalah,
          idePerbaikan: suggestionItem.idePerbaikan,
          fotoName: suggestionItem.fotoName,
          displayId: newId,
          nama: suggestionItem.nama,
          userId: suggestionItem.userId,
        }),
        department: suggestionItem.dept,
        submitted_by: suggestionItem.nama,
        status: suggestionItem.status,
      }).select('id').single();

      if (!error && data?.id) {
        suggestionItem.supabaseId = data.id;
        // update item with supabaseId
        const updatedWithSb = updated.map(s => s.id === newId ? { ...s, supabaseId: data.id } : s);
        saveSuggestions(updatedWithSb);
      }
    } catch (sbErr) {
      console.warn('Supabase suggestion sync error (local storage preserved):', sbErr);
    }
  }

  return suggestionItem;
}

/**
 * Update the status of a suggestion
 */
export async function updateSuggestionStatus(
  id: string,
  newStatus: Suggestion['status']
): Promise<Suggestion[]> {
  const current = loadSuggestions();
  const target = current.find(s => s.id === id);
  const updated = current.map(s => (s.id === id ? { ...s, status: newStatus } : s));
  saveSuggestions(updated);

  if (isSupabaseConfigured() && supabase && target) {
    try {
      if (target.supabaseId) {
        await supabase.from('suggestions').update({ status: newStatus }).eq('id', target.supabaseId);
      } else {
        await supabase.from('suggestions').update({ status: newStatus }).eq('title', target.judul);
      }
    } catch (sbErr) {
      console.warn('Supabase status update error:', sbErr);
    }
  }

  return updated;
}

/**
 * Delete a suggestion
 */
export async function deleteSuggestion(id: string): Promise<Suggestion[]> {
  const current = loadSuggestions();
  const target = current.find(s => s.id === id);
  const updated = current.filter(s => s.id !== id);
  saveSuggestions(updated);

  if (isSupabaseConfigured() && supabase && target) {
    try {
      if (target.supabaseId) {
        await supabase.from('suggestions').delete().eq('id', target.supabaseId);
      } else {
        await supabase.from('suggestions').delete().eq('title', target.judul);
      }
    } catch (sbErr) {
      console.warn('Supabase delete error:', sbErr);
    }
  }

  return updated;
}

/**
 * Fetch and merge remote Supabase suggestions with local state
 */
export async function syncWithSupabase(): Promise<Suggestion[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return loadSuggestions();
  }

  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return loadSuggestions();
    }

    const localItems = loadSuggestions();
    const merged: Suggestion[] = [...localItems];

    data.forEach((row: any) => {
      let extra: any = {};
      try {
        if (row.description && row.description.startsWith('{')) {
          extra = JSON.parse(row.description);
        }
      } catch {}

      const displayId = extra.displayId || `SGS-SB-${row.id.slice(0, 4)}`;
      const alreadyExists = merged.some(m => m.supabaseId === row.id || m.id === displayId || (m.judul === row.title && m.dept === row.department));

      if (!alreadyExists) {
        const rawDate = row.created_at ? new Date(row.created_at) : new Date();
        const dateStr = `${String(rawDate.getDate()).padStart(2, '0')}/${String(rawDate.getMonth() + 1).padStart(2, '0')}/${rawDate.getFullYear()}`;

        let mappedStatus: Suggestion['status'] = 'Baru';
        if (row.status === 'Ditinjau' || row.status === 'REVIEW') mappedStatus = 'Ditinjau';
        else if (row.status === 'Diterima' || row.status === 'ACCEPTED') mappedStatus = 'Diterima';
        else if (row.status === 'Ditolak' || row.status === 'REJECTED') mappedStatus = 'Ditolak';

        merged.push({
          id: displayId,
          nama: row.submitted_by || extra.nama || 'Staff',
          dept: row.department || 'Operations',
          judul: row.title || 'Saran Perbaikan',
          masalah: extra.masalah || row.description || '',
          idePerbaikan: extra.idePerbaikan || 'Saran perbaikan operasional',
          foto: null,
          fotoName: extra.fotoName || null,
          status: mappedStatus,
          createdAt: dateStr,
          userId: extra.userId,
          supabaseId: row.id,
        });
      }
    });

    saveSuggestions(merged);
    return merged;
  } catch (err) {
    console.warn('Sync with Supabase failed, using local storage:', err);
    return loadSuggestions();
  }
}
