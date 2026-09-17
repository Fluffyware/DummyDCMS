import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { getSessionUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/settings?key=doc_types|departments
 * Returns settings value from Supabase app_settings table.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database tidak terhubung.' }, { status: 503 });
    }

    if (key) {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .eq('key', key)
        .single();

      if (error || !data) {
        return NextResponse.json({ success: true, key, value: null });
      }
      return NextResponse.json(
        { success: true, key: data.key, value: data.value },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Return all settings
    const { data, error } = await supabase.from('app_settings').select('key, value');
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const result: Record<string, unknown> = {};
    (data || []).forEach((row) => { result[row.key] = row.value; });

    return NextResponse.json(
      { success: true, settings: result },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

/**
 * PUT /api/settings
 * Body: { key: string, value: unknown }
 * Admin-only write.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Akses ditolak: Harap login terlebih dahulu.' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Admin QMS.' }, { status: 403 });
    }

    const body = await req.json();
    const { key, value } = body;
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Parameter key dan value wajib diisi.' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database tidak terhubung.' }, { status: 503 });
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString(), updated_by: user.name },
        { onConflict: 'key' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
