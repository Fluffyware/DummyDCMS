import { NextRequest, NextResponse } from 'next/server';
import { isR2Configured, getPresignedDownloadUrl } from '@/lib/r2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Parameter key berkas diperlukan.' }, { status: 400 });
    }

    if (!isR2Configured()) {
      return NextResponse.json(
        { error: 'Penyimpanan berkas belum dikonfigurasi pada sistem.' },
        { status: 503 }
      );
    }

    const downloadUrl = await getPresignedDownloadUrl(key, 3600);
    return NextResponse.redirect(downloadUrl);
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses tautan unduhan.' },
      { status: 500 }
    );
  }
}
