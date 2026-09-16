import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import mammoth from 'mammoth';
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

function renderDocxViewerHtml({
  fileName,
  key,
  token,
  contentHtml,
}: {
  fileName: string;
  key: string;
  token?: string | null;
  contentHtml: string;
}): string {
  const downloadUrl = `/api/r2/download?key=${encodeURIComponent(key)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName} - PT Taka Hydrocore Indonesia (DCMS)</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #071c2c;
      border-bottom: 1px solid #1e293b;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-img {
      height: 32px;
      width: auto;
      background: #ffffff;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .doc-meta {
      display: flex;
      flex-direction: column;
    }
    .doc-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .doc-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #38bdf8;
      font-weight: 600;
      margin-top: 2px;
    }
    .badge-controlled {
      background: rgba(2, 132, 199, 0.25);
      border: 1px solid #0284c7;
      color: #38bdf8;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .btn-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      font-size: 12.5px;
      font-weight: 600;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #0284c7;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #0369a1;
    }
    .btn-outline {
      background: rgba(255,255,255,0.08);
      color: #f1f5f9;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .btn-outline:hover {
      background: rgba(255,255,255,0.15);
    }
    .viewer-viewport {
      padding: 32px 16px 80px;
      display: flex;
      justify-content: center;
    }
    .paper-sheet {
      width: 100%;
      max-width: 880px;
      background: #ffffff;
      padding: 64px 72px;
      border-radius: 6px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      font-size: 14.5px;
      line-height: 1.8;
      color: #0f172a;
      min-height: 1000px;
    }
    .paper-sheet table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13.5px;
    }
    .paper-sheet th, .paper-sheet td {
      border: 1px solid #cbd5e1;
      padding: 9px 12px;
      vertical-align: top;
    }
    .paper-sheet tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .paper-sheet h1, .paper-sheet h2, .paper-sheet h3 {
      color: #071c2c;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .paper-sheet p {
      margin: 10px 0;
    }
    .paper-sheet img {
      max-width: 100%;
      height: auto;
    }
    .watermark-banner {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11.5px;
      color: #64748b;
    }
    .watermark-title {
      font-size: 13px;
      font-weight: 800;
      color: #071c2c;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    @media (max-width: 768px) {
      .top-bar { flex-direction: column; align-items: flex-start; }
      .paper-sheet { padding: 28px 20px; }
    }
    @media print {
      .no-print { display: none !important; }
      body { background: #ffffff !important; }
      .viewer-viewport { padding: 0 !important; }
      .paper-sheet {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <header class="top-bar no-print">
    <div class="logo-area">
      <img src="https://raw.githubusercontent.com/Fluffyware/DummyDCMS/main/public/thi-logo-official.png" alt="THI Logo" class="logo-img" />
      <div class="doc-meta">
        <h1 class="doc-title">${fileName}</h1>
        <div class="doc-badge">
          <span class="badge-controlled">DOKUMEN TERKENDALI</span>
          <span>PT Taka Hydrocore Indonesia</span>
        </div>
      </div>
    </div>
    <div class="btn-group">
      <button onclick="window.print()" class="btn btn-outline" title="Cetak dokumen ini">
        🖨️ Cetak
      </button>
      <a href="${downloadUrl}" class="btn btn-primary" title="Unduh berkas asli">
        ⬇️ Unduh Berkas
      </a>
    </div>
  </header>

  <main class="viewer-viewport">
    <article class="paper-sheet">
      <div class="watermark-banner">
        <div>
          <div class="watermark-title">PT TAKA HYDROCORE INDONESIA</div>
          <div>Quality, Health, Safety, Security &amp; Environment Management System</div>
        </div>
        <div style="text-align: right;">
          <span class="badge-controlled">CONTROLLED COPY</span>
        </div>
      </div>

      <div class="document-content">
        ${contentHtml}
      </div>
    </article>
  </main>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const token = searchParams.get('token');
    const isRaw = searchParams.get('raw') === 'true';

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

    const ext = key.split('.').pop()?.toLowerCase() ?? '';
    const fileName = key.split('/').pop() ?? key;

    // ── DOCX / Word Documents: Render directly in the browser tab without downloading ──
    if ((ext === 'docx' || ext === 'doc') && !isRaw) {
      try {
        const mammothResult = await mammoth.convertToHtml({ buffer: Buffer.from(body) });
        const pageHtml = renderDocxViewerHtml({
          fileName,
          key,
          token,
          contentHtml: mammothResult.value || '<p>Dokumen kosong.</p>',
        });

        return new NextResponse(pageHtml, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'private, max-age=3600',
          },
        });
      } catch (convErr) {
        console.warn('Mammoth conversion error, falling back to raw:', convErr);
      }
    }

    const mimeType = getMimeType(key);

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        // inline = display in browser instead of forcing download
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Content-Length': String(body.byteLength),
        // Allow browser to cache for 1 hour
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
