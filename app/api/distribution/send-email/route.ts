import { NextRequest, NextResponse } from 'next/server';
import {
  sendDistributionEmail,
  sendBatchDistributionEmail,
  EmailDistributionPayload,
  BatchEmailPayload,
} from '@/lib/email-service';
import { getSessionUser } from '@/lib/server-auth';
import { generateSignedFileToken } from '@/lib/security';
import { getSupabaseServer } from '@/lib/supabase';

/**
 * Attaches a secure HMAC signed token to document URLs sent via email,
 * allowing recipients to download or view without having an active web portal session.
 */
function signDocumentUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl, 'http://localhost');
    const key = parsed.searchParams.get('key');
    if (key && (parsed.pathname.includes('/api/r2/view') || parsed.pathname.includes('/api/r2/download'))) {
      const token = generateSignedFileToken(key);
      parsed.searchParams.set('token', token);
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        return parsed.toString();
      } else {
        return `${parsed.pathname}?${parsed.searchParams.toString()}`;
      }
    }
  } catch (err) {
    console.warn('Gagal menandatangani tautan dokumen untuk email:', err);
  }
  return rawUrl;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce authentication & admin authorization
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Harap masuk (login) ke sistem terlebih dahulu.' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya Admin QMS yang memiliki izin mendistribusikan dokumen via email.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // ── Batch mode: send one email listing multiple documents ──
    if (body.batch === true && Array.isArray(body.documents)) {
      const { to, category, documents, notes, distributionType, customSubject, appOrigin, logoUrl } = body;

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

      // Securely sign all document file URLs for email recipients
      const signedDocs = documents.map((doc: any) => ({
        ...doc,
        fileUrl: signDocumentUrl(doc.fileUrl),
      }));

      const payload: BatchEmailPayload = {
        to: String(to).trim(),
        category: category || 'Corporate Documents',
        distributionType: distributionType || 'NEW_DOC',
        customSubject: customSubject || undefined,
        appOrigin: appOrigin || undefined,
        logoUrl: logoUrl || undefined,
        documents: signedDocs,
        distributorName: user.name || 'QMS THI',
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

      // Persist distribution history to Supabase audit_logs so all laptops see the distribution
      const supabase = getSupabaseServer();
      if (supabase) {
        try {
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const dateFormatted = `${day} ${months[now.getMonth()]} ${now.getFullYear()}`;
          const moPad = String(now.getMonth() + 1).padStart(2, '0');
          const yrShort = String(now.getFullYear()).slice(-2);

          const rowsToInsert = signedDocs.map((doc: any, i: number) => ({
            action: 'DISTRIBUTION',
            entity: 'distribution',
            user_name: user.name || 'QMS THI',
            user_email: user.email || null,
            role: user.role,
            type: distributionType || 'NEW_DOC',
            detail: JSON.stringify({
              id: doc.id && !doc.id.startsWith('dist-') ? doc.id : `DIS${moPad}${yrShort}.${String(i + 1).padStart(3, '0')}`,
              idRegistrasi: doc.number || doc.idRegistrasi || '-',
              dept: doc.dept || department || 'Corporate Documents',
              jenis: doc.jenis || jenisDokumen || category || 'SOP',
              judul: doc.title || doc.judul || 'Dokumen Terdistribusi',
              revisi: doc.revisi || doc.revision || '00',
              folder: doc.folder || category || 'Umum',
              groupDoc: 'HEAD_OFFICE',
              fileName: doc.fileName || null,
              fileUrl: doc.fileUrl || null,
              status: 'Released',
              createdAt: dateFormatted,
              distType: distributionType || 'NEW_DOC',
              recipientEmail: payload.to,
            }),
          }));
          await supabase.from('audit_logs').insert(rowsToInsert);
        } catch (dbErr) {
          console.warn('Gagal mencatat distribusi batch ke audit_logs:', dbErr);
        }
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
      distributionType,
      customSubject,
      appOrigin,
      logoUrl,
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
      distributionType: distributionType || 'NEW_DOC',
      customSubject: customSubject || undefined,
      appOrigin: appOrigin || undefined,
      logoUrl: logoUrl || undefined,
      fileUrl: signDocumentUrl(fileUrl),
      fileName: fileName || null,
      distributorName: user.name || 'QMS THI',
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

      // Persist distribution history to Supabase audit_logs
      const supabase = getSupabaseServer();
      if (supabase) {
        try {
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          const dateFormatted = `${day} ${months[now.getMonth()]} ${now.getFullYear()}`;
          const moPad = String(now.getMonth() + 1).padStart(2, '0');
          const yrShort = String(now.getFullYear()).slice(-2);

          await supabase.from('audit_logs').insert([{
            action: 'DISTRIBUTION',
            entity: 'distribution',
            user_name: user.name || 'QMS THI',
            user_email: user.email || null,
            role: user.role,
            type: distributionType || 'NEW_DOC',
            detail: JSON.stringify({
              id: `DIS${moPad}${yrShort}.001`,
              idRegistrasi: documentNumber || '-',
              dept: department || 'Operations',
              jenis: jenisDokumen || 'SOP',
              judul: documentTitle,
              revisi: revision || '00',
              folder: department || 'Umum',
              groupDoc: 'HEAD_OFFICE',
              fileName: fileName || null,
              fileUrl: payload.fileUrl || null,
              status: 'Released',
              createdAt: dateFormatted,
              distType: distributionType || 'NEW_DOC',
              recipientEmail: payload.to,
            }),
          }]);
        } catch (dbErr) {
          console.warn('Gagal mencatat distribusi ke audit_logs:', dbErr);
        }
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
