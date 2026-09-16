import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { getSessionUser } from '@/lib/server-auth';
import { DistributionDoc } from '@/lib/masterlist-data';

export const dynamic = 'force-dynamic';

/**
 * GET /api/distribution
 * Returns centralized distribution history from Supabase audit_logs.
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ success: true, distributions: [] });
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'DISTRIBUTION')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching distribution logs:', error.message);
      return NextResponse.json({ success: true, distributions: [] });
    }

    const distributions: DistributionDoc[] = [];
    (data || []).forEach((row, idx) => {
      try {
        if (row.detail) {
          const parsed = JSON.parse(row.detail);

          // Clean up ID: if it has raw timestamp format like dist-1789532437363-0-1i8u
          let cleanId = parsed.id;
          const rawDate = row.created_at || parsed.createdAt;
          const dateObj = rawDate ? new Date(rawDate) : new Date();
          const moPad = String(dateObj.getMonth() + 1).padStart(2, '0');
          const yrShort = String(dateObj.getFullYear()).slice(-2);
          const seq = String(idx + 1).padStart(3, '0');

          if (!cleanId || cleanId.startsWith('dist-')) {
            cleanId = `DIS${moPad}${yrShort}.${seq}`;
          }

          // Clean up date format from raw ISO string
          let formattedDate = parsed.createdAt || row.created_at;
          if (formattedDate && (formattedDate.includes('T') || formattedDate.includes('Z'))) {
            try {
              const d = new Date(formattedDate);
              if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0');
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                formattedDate = `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
              }
            } catch {
              // fallback
            }
          }

          distributions.push({
            no: idx + 1,
            id: cleanId,
            idRegistrasi: parsed.idRegistrasi && parsed.idRegistrasi !== '-' ? parsed.idRegistrasi : (parsed.docNumber || '-'),
            dept: parsed.dept || 'Operations',
            jenis: parsed.jenis || 'SOP',
            judul: parsed.judul || 'Dokumen Terdistribusi',
            revisi: parsed.revisi || '00',
            folder: parsed.folder || 'Umum',
            groupDoc: parsed.groupDoc || 'HEAD_OFFICE',
            fileName: parsed.fileName || null,
            fileSize: parsed.fileSize || undefined,
            fileUrl: parsed.fileUrl || undefined,
            status: parsed.status || 'Released',
            createdAt: formattedDate,
            distType: parsed.distType || 'NEW_DOC',
          });
        }
      } catch (err) {
        console.warn('Could not parse distribution detail:', err);
      }
    });

    return NextResponse.json(
      { success: true, distributions },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('API /api/distribution GET error:', error);
    return NextResponse.json({ success: true, distributions: [] });
  }
}

/**
 * POST /api/distribution
 * Stores new distribution record(s) into Supabase audit_logs.
 */
export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Akses ditolak: Harap login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { distributions } = body;
    const items: DistributionDoc[] = Array.isArray(distributions) ? distributions : (body.distribution ? [body.distribution] : []);

    if (items.length === 0) {
      return NextResponse.json({ error: 'Tidak ada item distribusi untuk disimpan.' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database belum terhubung.' }, { status: 503 });
    }

    const rowsToInsert = items.map(item => ({
      action: 'DISTRIBUTION',
      entity: 'distribution',
      user_name: user.name || 'QMS',
      user_email: user.email || null,
      role: user.role,
      type: item.distType || 'NEW_DOC',
      detail: JSON.stringify(item),
    }));

    const { error } = await supabase.from('audit_logs').insert(rowsToInsert);
    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, count: items.length });
  } catch (error: any) {
    console.error('API /api/distribution POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal menyimpan riwayat distribusi.' },
      { status: 500 }
    );
  }
}
