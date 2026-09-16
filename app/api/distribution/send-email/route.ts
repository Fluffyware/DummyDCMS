import { NextRequest, NextResponse } from 'next/server';
import {
  sendDistributionEmail,
  sendBatchDistributionEmail,
  EmailDistributionPayload,
  BatchEmailPayload,
} from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Batch mode: send one email listing multiple documents ──
    if (body.batch === true && Array.isArray(body.documents)) {
      const { to, category, documents, distributorName, notes } = body;

      if (!to) {
        return NextResponse.json(
          { success: false, error: 'Alamat email penerima (to) wajib diisi.' },
          { status: 400 }
        );
      }

      if (!documents || documents.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Minimal 1 dokumen diperlukan.' },
          { status: 400 }
        );
      }

      const payload: BatchEmailPayload = {
        to: String(to).trim(),
        category: category || 'Corporate Documents',
        documents,
        distributorName: distributorName || 'QMS THI',
        notes: notes || '',
      };

      const result = await sendBatchDistributionEmail(payload);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            provider: result.provider,
            error: result.error,
            message: 'Gagal mengirim email. Silakan periksa kredensial pengirim.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        provider: result.provider,
        messageId: result.messageId,
        message: `Email distribusi berhasil dikirim ke ${payload.to} (${documents.length} dokumen)`,
      });
    }

    // ── Single document mode (legacy) ──
    const {
      to,
      documentTitle,
      documentNumber,
      revision,
      department,
      jenisDokumen,
      fileUrl,
      fileName,
      distributorName,
      notes,
    } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Alamat email penerima (to) wajib diisi.' },
        { status: 400 }
      );
    }

    if (!documentTitle) {
      return NextResponse.json(
        { success: false, error: 'Judul dokumen wajib diisi.' },
        { status: 400 }
      );
    }

    const payload: EmailDistributionPayload = {
      to: to.trim(),
      documentTitle: documentTitle.trim(),
      documentNumber: (documentNumber || '-').trim(),
      revision: revision || '00',
      department: department || 'Operations',
      jenisDokumen: jenisDokumen || 'SOP',
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      distributorName: distributorName || 'QMS THI',
      notes: notes || '',
    };

    const result = await sendDistributionEmail(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          provider: result.provider,
          error: result.error,
          message: 'Gagal mengirim email. Silakan periksa kredensial pengirim.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      messageId: result.messageId,
      message: `Email notifikasi distribusi berhasil dikirim ke ${payload.to}`,
    });
  } catch (error: any) {
    console.error('API send-email error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
