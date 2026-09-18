import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { getSessionUser } from '@/lib/server-auth';
import { deleteObjectFromR2 } from '@/lib/r2';
import { MasterFolder, MasterSubFolder, MasterDocItem, INITIAL_MASTER_FOLDERS } from '@/lib/masterlist-data';

export const dynamic = 'force-dynamic';

/**
 * GET /api/masterlist
 * Returns the unified folder and document hierarchy from Supabase.
 * Every user and laptop calling this receives the identical centralized database state.
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ success: true, folders: INITIAL_MASTER_FOLDERS, source: 'initial_fallback' });
    }

    // 1. Fetch folders, subfolders, and documents in parallel
    const [foldersRes, subfoldersRes, docsRes] = await Promise.all([
      supabase.from('master_folders').select('*').order('sort_order', { ascending: true }),
      supabase.from('master_subfolders').select('*').order('sort_order', { ascending: true }),
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
    ]);

    if (foldersRes.error) {
      console.warn('Error fetching master_folders:', foldersRes.error.message);
      return NextResponse.json({ success: true, folders: INITIAL_MASTER_FOLDERS, source: 'fallback_on_error' });
    }

    const dbFolders = foldersRes.data || [];
    const dbSubfolders = subfoldersRes.data || [];
    const dbDocs = docsRes.data || [];

    // 2. Transform Supabase document records to MasterDocItem
    const allDocs: (MasterDocItem & { folderId?: string; subFolderId?: string })[] = dbDocs.map(d => {
      const r2Key = d.r2_key || undefined;
      const r2Url = r2Key
        ? `/api/r2/view?key=${encodeURIComponent(r2Key)}`
        : d.r2_url || undefined;

      return {
        id: d.id,
        number: d.number,
        title: d.title,
        revision: d.revision || 'Rev.00',
        effectiveDate: d.effective_date || 'Hari Ini',
        reviewDate: d.review_date || '1 Tahun Mendatang',
        status: (d.status as 'CURRENT' | 'DRAFT' | 'REVISED') || 'CURRENT',
        classification: (d.classification as 'INTERNAL' | 'CONFIDENTIAL' | 'PUBLIC') || 'INTERNAL',
        type: d.type || 'SOP',
        size: d.file_size || '1.85 MB',
        fileExt: (d.file_ext as 'pdf' | 'docx' | 'xlsx') || 'pdf',
        subFolderId: d.subfolder_id || undefined,
        subFolderName: d.subfolder_name || undefined,
        r2Key,
        r2Url,
        folderId: d.folder_id ? String(d.folder_id) : undefined,
      };
    });

    // 2b. Repair orphaned documents that lost folderId/subFolderId due to previous foreign key bugs
    allDocs.forEach(doc => {
      // If folderId is missing but subFolderName exists, infer folder & subfolder from INITIAL_MASTER_FOLDERS
      if (!doc.folderId && doc.subFolderName) {
        for (const initFolder of INITIAL_MASTER_FOLDERS) {
          const matchSub = (initFolder.subfolders || []).find(
            s => s.name.toLowerCase().trim() === doc.subFolderName?.toLowerCase().trim() ||
                 (doc.subFolderId && s.id === doc.subFolderId)
          );
          if (matchSub) {
            doc.folderId = String(initFolder.id);
            doc.subFolderId = matchSub.id;
            break;
          }
        }
      }

      // If still missing folderId, default to the first folder (or '1') so it is NEVER lost/hidden
      if (!doc.folderId && dbFolders.length > 0) {
        doc.folderId = String(dbFolders[0].id);
      }
    });

    // 3. Build subfolders map grouped by folder_id
    const subfolderMap = new Map<string, MasterSubFolder[]>();
    dbSubfolders.forEach(sf => {
      const fId = String(sf.folder_id);
      if (!subfolderMap.has(fId)) {
        subfolderMap.set(fId, []);
      }

      // Filter documents belonging to this subfolder
      const sfDocs = allDocs
        .filter(doc => doc.subFolderId === sf.id || (doc.subFolderName && doc.subFolderName.trim().toLowerCase() === sf.name.trim().toLowerCase()))
        .map(({ folderId: _, ...cleanDoc }) => cleanDoc);

      subfolderMap.get(fId)!.push({
        id: sf.id,
        name: sf.name,
        docs: sfDocs,
      });
    });

    // 3b. Synthesize dynamic subfolders from documents if not yet present in master_subfolders table
    allDocs.forEach(doc => {
      if (doc.folderId && (doc.subFolderName || doc.subFolderId)) {
        const fId = doc.folderId;
        if (!subfolderMap.has(fId)) {
          subfolderMap.set(fId, []);
        }
        const existingSubs = subfolderMap.get(fId)!;
        const subName = doc.subFolderName || `Subfolder ${doc.subFolderId}`;
        const subId = doc.subFolderId || `sub-${fId}-${encodeURIComponent(subName)}`;

        const alreadyExists = existingSubs.some(
          s => s.id === subId || s.name.trim().toLowerCase() === subName.trim().toLowerCase()
        );

        if (!alreadyExists) {
          const matchedDocs = allDocs
            .filter(d => d.folderId === fId && (
              d.subFolderId === subId ||
              (d.subFolderName && d.subFolderName.trim().toLowerCase() === subName.trim().toLowerCase())
            ))
            .map(({ folderId: _, ...cleanDoc }) => cleanDoc);

          existingSubs.push({
            id: subId,
            name: subName,
            docs: matchedDocs,
          });
        }
      }
    });

    // 4. Build folders array
    const folders: MasterFolder[] = dbFolders.map(f => {
      const fIdStr = String(f.id);
      const fIdNum = parseInt(f.id, 10) || 1;

      // Subfolders for this folder
      const subfolders = subfolderMap.get(fIdStr) || [];

      // Docs directly under this folder (not inside any subfolder)
      const subfolderDocIds = new Set<string>();
      subfolders.forEach(sf => sf.docs.forEach(d => subfolderDocIds.add(d.id)));

      const directDocs = allDocs
        .filter(doc => doc.folderId === fIdStr && !subfolderDocIds.has(doc.id))
        .map(({ folderId: _, ...cleanDoc }) => cleanDoc);

      return {
        id: fIdNum,
        name: f.name,
        category: (f.category as 'HEAD_OFFICE' | 'OFFSHORE' | 'PROJECT_SITE') || 'HEAD_OFFICE',
        description: f.description || '',
        docs: directDocs,
        subfolders,
      };
    });

    return NextResponse.json(
      { success: true, folders, source: 'supabase' },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('API /api/masterlist GET error:', error);
    return NextResponse.json({ success: true, folders: INITIAL_MASTER_FOLDERS, source: 'fallback_catch' });
  }
}

/**
 * POST /api/masterlist
 * Admin mutations: create folder, create subfolder, update, or delete.
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

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin QMS yang dapat mengubah struktur folder masterlist.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, folder, subfolder, folderId, subFolderId } = body;
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Database belum terhubung.' }, { status: 503 });
    }

    if (action === 'create_folder' && folder) {
      const { error } = await supabase.from('master_folders').insert([{
        id: String(folder.id),
        number: String(folder.id).padStart(2, '0'),
        name: folder.name,
        category: folder.category || 'HEAD_OFFICE',
        description: folder.description || '',
        sort_order: folder.id,
      }]);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'create_subfolder' && subfolder && folderId) {
      const { error } = await supabase.from('master_subfolders').insert([{
        id: subfolder.id,
        folder_id: String(folderId),
        name: subfolder.name,
        sort_order: 99,
      }]);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_folder' && folderId) {
      // Cascading delete: find docs, delete from R2, delete docs, delete folder
      const { data: docs } = await supabase.from('documents').select('id, r2_key').eq('folder_id', String(folderId));
      if (docs && docs.length > 0) {
        for (const doc of docs) {
          if (doc.r2_key) {
             try { await deleteObjectFromR2(doc.r2_key); } catch (e) { /* ignore */ }
          }
        }
      }
      await supabase.from('documents').delete().eq('folder_id', String(folderId));
      const { error } = await supabase.from('master_folders').delete().eq('id', String(folderId));
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_subfolder' && subFolderId) {
      // Cascading delete: find docs, delete from R2, delete docs, delete subfolder
      const { data: docs } = await supabase.from('documents').select('id, r2_key').eq('subfolder_id', String(subFolderId));
      if (docs && docs.length > 0) {
        for (const doc of docs) {
          if (doc.r2_key) {
             try { await deleteObjectFromR2(doc.r2_key); } catch (e) { /* ignore */ }
          }
        }
      }
      await supabase.from('documents').delete().eq('subfolder_id', String(subFolderId));
      const { error } = await supabase.from('master_subfolders').delete().eq('id', String(subFolderId));
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/masterlist POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memperbarui masterlist di database.' },
      { status: 500 }
    );
  }
}
