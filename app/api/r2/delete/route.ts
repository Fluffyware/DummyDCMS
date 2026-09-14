import { NextRequest, NextResponse } from 'next/server';
import { isR2Configured, deleteObjectFromR2 } from '@/lib/r2';
import { getSupabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { docId, docNumber, r2Key, folderId, subFolderId, type } = body;

    const supabaseServer = getSupabaseServer();

    if (type === 'document') {
      // 1. Delete object from Cloudflare R2 if key is available
      if (r2Key && isR2Configured()) {
        try {
          await deleteObjectFromR2(r2Key);
        } catch (r2Err) {
          console.warn('R2 delete warning:', r2Err);
        }
      }

      // 2. Delete document record from Supabase if configured
      if (supabaseServer) {
        if (docId) {
          await supabaseServer.from('documents').delete().eq('id', docId);
        }
        if (docNumber) {
          await supabaseServer.from('documents').delete().eq('number', docNumber);
        }
      }
    } else if (type === 'folder' && folderId) {
      if (supabaseServer) {
        await supabaseServer.from('master_folders').delete().eq('id', String(folderId));
      }
    } else if (type === 'subfolder' && subFolderId) {
      if (supabaseServer) {
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
