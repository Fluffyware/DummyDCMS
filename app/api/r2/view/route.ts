import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { isR2Configured, getR2Client } from '@/lib/r2';
import { validateDocumentKey, verifySignedFileToken } from '@/lib/security';
import { getSessionUser } from '@/lib/server-auth';

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'thi-qhsse-documents';

// Map file extensions to MIME types that browsers can render inline
function getMimeType(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    html: 'text/html',
    htm: 'text/html',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  return map[ext] ?? 'application/octet-stream';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const token = searchParams.get('token');

    if (!key) {
      return NextResponse.json({ error: 'Parameter key berkas diperlukan.' }, { status: 400 });
    }

    // 1. Validate key to prevent path traversal & unauthorized bucket key access
    const keyValidation = validateDocumentKey(key);
    if (!keyValidation.valid) {
      return NextResponse.json({ error: keyValidation.error }, { status: 400 });
    }

    // 2. Authorization check: Either active session user or valid HMAC signed token
    const user = getSessionUser(req);
    const isTokenValid = verifySignedFileToken(key, token);

    if (!user && !isTokenValid) {
      return NextResponse.json(
        { error: 'Akses ditolak: Diperlukan sesi login atau token otorisasi dokumen yang sah.' },
        { status: 401 }
      );
    }

    if (!isR2Configured()) {
      return NextResponse.json(
        { error: 'Penyimpanan berkas belum dikonfigurasi pada sistem.' },
        { status: 503 }
      );
    }

    const client = getR2Client();
    if (!client) {
      return NextResponse.json({ error: 'Gagal terhubung ke penyimpanan berkas.' }, { status: 503 });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: 'Berkas tidak ditemukan.' }, { status: 404 });
    }

    // Convert the readable stream to a Uint8Array
    const chunks: Uint8Array[] = [];
    const reader = (response.Body as any).transformToWebStream().getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
    const body = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }

    const fileName = key.split('/').pop() ?? key;
    const mimeType = getMimeType(key);

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        // inline = display directly in browser without forcing download
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Content-Length': String(body.byteLength),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('View error:', error);
    if (error?.name === 'NoSuchKey' || error?.Code === 'NoSuchKey') {
      return NextResponse.json({ error: 'Berkas tidak ditemukan di penyimpanan.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || 'Gagal memuat berkas.' },
      { status: 500 }
    );
  }
}

