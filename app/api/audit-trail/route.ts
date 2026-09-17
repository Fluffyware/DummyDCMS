import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/audit-trail
 * Returns audit log entries from Supabase (excludes DISTRIBUTION rows).
 * Query params: ?limit=50&type=create|approve|...
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const typeFilter = searchParams.get('type');
    const limit = Math.min(parseInt(limitParam || '200', 10), 500);

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ success: true, logs: [] });
    }

    let query = supabase
      .from('audit_logs')
      .select('*')
      .neq('action', 'DISTRIBUTION')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (typeFilter) {
      query = query.eq('type', typeFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Error fetching audit_logs:', error.message);
      return NextResponse.json({ success: true, logs: [] });
    }

    const logs = (data || []).map((row) => {
      const rawDate = row.created_at ? new Date(row.created_at) : new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${pad(rawDate.getDate())}/${pad(rawDate.getMonth() + 1)}/${rawDate.getFullYear()}, ${pad(rawDate.getHours())}:${pad(rawDate.getMinutes())} WIB`;

      // Map DB action strings to frontend type categories
      const typeMap: Record<string, string> = {
        CREATE_DOCUMENT: 'create',
        UPLOAD_FILE: 'create',
        SUBMIT_DOCUMENT: 'create',
        APPROVE_DOCUMENT: 'approve',
        REJECT_DOCUMENT: 'reject',
        PUBLISH_DOCUMENT: 'publish',
        DISTRIBUTE_DOCUMENT: 'distribute',
        DISTRIBUTION: 'distribute',
        ACKNOWLEDGE_DOCUMENT: 'acknowledge',
        CREATE_REVISION: 'revise',
        SUPERSEDE_DOCUMENT: 'archive',
        ARCHIVE_DOCUMENT: 'archive',
      };

      const mappedType = row.type || typeMap[row.action] || 'create';

      return {
        id: row.id,
        action: row.action || 'ACTION',
        user: row.user_name || 'System',
        role: row.role || 'Staff',
        entity: row.entity || '-',
        detail: row.detail || '',
        timestamp,
        type: mappedType,
      };
    });

    return NextResponse.json(
      { success: true, logs },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('GET /api/audit-trail error:', err);
    return NextResponse.json({ success: false, logs: [] }, { status: 500 });
  }
}
