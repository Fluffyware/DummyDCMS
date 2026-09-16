import { NextRequest, NextResponse } from 'next/server';
import { isR2Configured, uploadBufferToR2 } from '@/lib/r2';
import { getSupabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docNumber = (formData.get('docNumber') as string) || '';
    const docTitle = (formData.get('docTitle') as string) || '';
    const docType = (formData.get('docType') as string) || 'SOP';
    const docRevision = (formData.get('docRevision') as string) || 'Rev.00';
    const docClassification = (formData.get('docClassification') as string) || 'INTERNAL';
    const folderId = (formData.get('folderId') as string) || '';
    const subFolderId = (formData.get('subFolderId') as string) || '';
    const subFolderName = (formData.get('subFolderName') as string) || '';
    const uploader = (formData.get('uploader') as string) || 'QMS';

    if (!docNumber || !docTitle) {
      return NextResponse.json(
        { error: 'Nomor dokumen dan judul wajib diisi.' },
        { status: 400 }
      );
    }

    let r2Key: string | null = null;
    let r2Url: string | null = null;
    let fileSizeStr = '1.85 MB';
    let fileExt = 'pdf';

    // 1. Upload to Cloudflare R2 if file exists and R2 is configured
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      fileExt = ext;
      fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      if (isR2Configured()) {
        const cleanDocNum = docNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
        const timestamp = Date.now();
        const safeFileName = `${cleanDocNum}_${docRevision}_${timestamp}.${ext}`;
        const key = `documents/${safeFileName}`;

        const uploadResult = await uploadBufferToR2({
          buffer,
          key,
          contentType: file.type || 'application/pdf',
        });

        r2Key = uploadResult.key;
        r2Url = uploadResult.url;
      }
    }

    const docId = `doc-${Date.now()}`;
    const newDocRecord = {
      id: docId,
      number: docNumber.trim().toUpperCase(),
      title: docTitle.trim(),
      type: docType,
      revision: docRevision.trim() || 'Rev.00',
      status: 'CURRENT',
      classification: docClassification,
      folder_id: folderId || null,
      subfolder_id: subFolderId || null,
      subfolder_name: subFolderName || null,
      file_size: fileSizeStr,
      file_ext: fileExt,
      r2_key: r2Key,
      r2_url: r2Url,
      uploaded_by: uploader,
    };

    // 2. Insert into Supabase if configured
    const supabaseServer = getSupabaseServer();
    if (supabaseServer) {
      try {
        let { error: dbError } = await supabaseServer
          .from('documents')
          .insert([newDocRecord]);

        if (dbError && dbError.message?.toLowerCase().includes('foreign key')) {
          // Retry with null foreign keys if subfolder or folder doesn't exist in master tables
          const { error: retryError } = await supabaseServer
            .from('documents')
            .insert([{ ...newDocRecord, subfolder_id: null, folder_id: null }]);
          if (retryError) {
            console.warn('Supabase insert fallback warning:', retryError.message);
          }
        } else if (dbError) {
          console.warn('Supabase insert warning:', dbError.message);
        }
      } catch (dbErr: any) {
        console.warn('Supabase insert skipped or failed:', dbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        ...newDocRecord,
        effectiveDate: 'Hari Ini',
        reviewDate: '1 Tahun Mendatang',
        size: fileSizeStr,
        fileExt,
        subFolderId,
        subFolderName,
      },
      storage: isR2Configured() ? 'cloudflare_r2' : 'local_fallback',
      database: supabaseServer ? 'supabase' : 'local_fallback',
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal mengunggah berkas.' },
      { status: 500 }
    );
  }
}
