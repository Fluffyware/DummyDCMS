import { NextRequest, NextResponse } from 'next/server';
import { sendDistributionEmail, EmailDistributionPayload } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
      distributorName: distributorName || 'Admin QMS THI',
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
