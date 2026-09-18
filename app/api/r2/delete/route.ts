import { NextRequest, NextResponse } from 'next/server';
import { isR2Configured, deleteObjectFromR2, deleteObjectsByPrefix } from '@/lib/r2';
import { getSupabaseServer } from '@/lib/supabase';
import { getSessionUser } from '@/lib/server-auth';
import { validateDocumentKey } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce authentication & admin authorization
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Akses ditolak: Harap masuk (login) ke sistem terlebih dahulu.' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin QMS yang memiliki izin menghapus berkas atau folder.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { docId, docNumber, r2Key, folderId, subFolderId, type } = body;

    // Validate r2Key if supplied to prevent traversal
    if (r2Key) {
      const keyValidation = validateDocumentKey(r2Key);
      if (!keyValidation.valid) {
        return NextResponse.json({ error: keyValidation.error }, { status: 400 });
      }
    }

    const supabaseServer = getSupabaseServer();

    if (type === 'document') {
      // 1. Delete object from Cloudflare R2
      if (r2Key && isR2Configured()) {
        try {
          await deleteObjectFromR2(r2Key);
        } catch (r2Err) {
          console.warn('R2 delete warning:', r2Err);
        }
      } else if (docNumber && isR2Configured()) {
        // Fallback: Delete any object matching the document number prefix
        try {
          const cleanDocNum = docNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
          await deleteObjectsByPrefix(`documents/${cleanDocNum}`);
        } catch (r2Err) {
          console.warn('R2 delete prefix warning:', r2Err);
        }
      }

      // 2. Delete document record from Supabase if configured
      if (supabaseServer) {
        if (docId) {
          await supabaseServer.from('documents').delete().eq('id', docId);
        } else if (docNumber) {
          await supabaseServer.from('documents').delete().eq('number', docNumber);
        }
      }
    } else if (type === 'folder' && folderId) {
      if (supabaseServer) {
        // 1. Ambil semua dokumen di dalam folder ini
        const { data: docs } = await supabaseServer.from('documents').select('id, r2_key').eq('folder_id', String(folderId));
        
        // 2. Hapus file fisiknya dari Cloudflare R2
        if (docs && docs.length > 0 && isR2Configured()) {
          for (const doc of docs) {
            if (doc.r2_key) {
              try {
                await deleteObjectFromR2(doc.r2_key);
              } catch (e) {
                console.warn(`Gagal menghapus objek R2 dengan key ${doc.r2_key}:`, e);
              }
            }
          }
        }

        // 3. Hapus rekam data dokumennya dari Supabase (agar tidak orphaned)
        await supabaseServer.from('documents').delete().eq('folder_id', String(folderId));

        // 4. Terakhir, hapus folder itu sendiri
        await supabaseServer.from('master_folders').delete().eq('id', String(folderId));
      }
    } else if (type === 'subfolder' && subFolderId) {
      if (supabaseServer) {
        // 1. Ambil semua dokumen di dalam subfolder ini
        const { data: docs } = await supabaseServer.from('documents').select('id, r2_key').eq('subfolder_id', String(subFolderId));
        
        // 2. Hapus file fisiknya dari Cloudflare R2
        if (docs && docs.length > 0 && isR2Configured()) {
          for (const doc of docs) {
            if (doc.r2_key) {
              try {
                await deleteObjectFromR2(doc.r2_key);
              } catch (e) {
                console.warn(`Gagal menghapus objek R2 dengan key ${doc.r2_key}:`, e);
              }
            }
          }
        }

        // 3. Hapus rekam data dokumennya dari Supabase
        await supabaseServer.from('documents').delete().eq('subfolder_id', String(subFolderId));

        // 4. Terakhir, hapus subfolder itu sendiri
        await supabaseServer.from('master_subfolders').delete().eq('id', String(subFolderId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete handler error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses penghapusan berkas/folder.' },
      { status: 500 }
    );
  }
}
