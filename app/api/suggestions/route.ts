import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { getSessionUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

/* ─── Helper: format Supabase row → Suggestion ─────────────── */
function rowToSuggestion(row: any, idx: number) {
  let extra: Record<string, any> = {};
  try {
    if (row.description && row.description.startsWith('{')) {
      extra = JSON.parse(row.description);
    }
  } catch { /* ignore */ }

  const rawDate = row.created_at ? new Date(row.created_at) : new Date();
  const dateStr = `${String(rawDate.getDate()).padStart(2, '0')}/${String(rawDate.getMonth() + 1).padStart(2, '0')}/${rawDate.getFullYear()}`;

  const displayId = extra.displayId || `SGS-${String(idx + 1).padStart(3, '0')}`;

  let status: 'Baru' | 'Ditinjau' | 'Diterima' | 'Ditolak' = 'Baru';
  if (row.status === 'Ditinjau') status = 'Ditinjau';
  else if (row.status === 'Diterima') status = 'Diterima';
  else if (row.status === 'Ditolak') status = 'Ditolak';

  return {
    id: displayId,
    supabaseId: row.id,
    nama: row.submitted_by || extra.nama || 'Staff',
    dept: row.department || 'Operations',
    judul: row.title || 'Saran Perbaikan',
    masalah: extra.masalah || row.description || '',
    idePerbaikan: extra.idePerbaikan || '',
    foto: null as null,
    fotoName: extra.fotoName || null,
    status,
    createdAt: dateStr,
    userId: extra.userId,
  };
}

/**
 * GET /api/suggestions
 * Returns all suggestions from Supabase.
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching suggestions:', error.message);
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const suggestions = (data || []).map((row, idx) => rowToSuggestion(row, idx));

    return NextResponse.json(
      { success: true, suggestions },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('GET /api/suggestions error:', err);
    return NextResponse.json({ success: false, suggestions: [] }, { status: 500 });
  }
}

/**
 * POST /api/suggestions
 * Body: { nama, dept, judul, masalah, idePerbaikan, fotoName?, status?, userId? }
 * Creates a new suggestion.
 */
export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    // Both staff and admin can submit suggestions; no auth check for read
    const body = await req.json();
    const { nama, dept, judul, masalah, idePerbaikan, fotoName, userId } = body;

    if (!judul || !dept || !masalah) {
      return NextResponse.json({ error: 'Field judul, dept, dan masalah wajib diisi.' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database tidak terhubung.' }, { status: 503 });
    }

    // Count existing to generate display ID
    const { count } = await supabase.from('suggestions').select('id', { count: 'exact', head: true });
    const displayId = `SGS-${String((count || 0) + 1).padStart(3, '0')}`;

    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        title: judul,
        description: JSON.stringify({ masalah, idePerbaikan, fotoName: fotoName || null, displayId, nama, userId }),
        department: dept,
        submitted_by: nama || user?.name || 'Staff',
        status: 'Baru',
      })
      .select('*')
      .single();

    if (error || !data) {
      throw error || new Error('Insert failed');
    }

    const suggestion = rowToSuggestion(data, (count || 0));
    return NextResponse.json({ success: true, suggestion });
  } catch (err: any) {
    console.error('POST /api/suggestions error:', err);
    return NextResponse.json({ error: err?.message || 'Gagal menyimpan saran.' }, { status: 500 });
  }
}

/**
 * PATCH /api/suggestions
 * Body: { supabaseId: string, status: string }
 * Updates suggestion status. Admin-only.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Hanya Admin QMS yang dapat mengubah status saran.' }, { status: 403 });
    }

    const body = await req.json();
    const { supabaseId, status } = body;
    if (!supabaseId || !status) {
      return NextResponse.json({ error: 'supabaseId dan status wajib diisi.' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database tidak terhubung.' }, { status: 503 });
    }

    const { error } = await supabase
      .from('suggestions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', supabaseId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

/**
 * DELETE /api/suggestions?id=<supabaseId>
 * Admin-only.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Hanya Admin QMS.' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const supabaseId = searchParams.get('id');
    if (!supabaseId) return NextResponse.json({ error: 'Parameter id wajib diisi.' }, { status: 400 });

    const supabase = getSupabaseServer();
    if (!supabase) return NextResponse.json({ error: 'Database tidak terhubung.' }, { status: 503 });

    const { error } = await supabase.from('suggestions').delete().eq('id', supabaseId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
