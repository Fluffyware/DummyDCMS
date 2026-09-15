import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface EmailDistributionPayload {
  to: string; // e.g. 'filayati_akbar@yahoo.com'
  documentTitle: string;
  documentNumber: string;
  revision: string;
  department: string;
  jenisDokumen?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  distributorName?: string;
  notes?: string;
}

/**
 * Generate official PT Taka Hydrocore Indonesia HTML Email Template
 */
export function generateDistributionEmailHtml(data: EmailDistributionPayload): string {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Distribusi Dokumen Terkendali - PT Taka Hydrocore Indonesia</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(7, 28, 44, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #071c2c 0%, #0c3352 100%); padding: 30px 32px; text-align: left; border-bottom: 4px solid #0284c7;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 4px 10px; background: rgba(2, 132, 199, 0.2); border: 1px solid rgba(2, 132, 199, 0.4); border-radius: 6px; color: #38bdf8; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px;">
                      QHSSE Document Management System
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; line-height: 1.3;">
                      PT TAKA HYDROCORE INDONESIA
                    </h1>
                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">
                      Pemberitahuan Distribusi Dokumen Terkendali (Controlled Copy)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
                Yth. Bapak/Ibu <strong>${data.to}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #334155;">
                Melalui email ini, kami informasikan bahwa dokumen sistem manajemen baru/revisi telah berhasil diterbitkan dan didistribusikan ke departemen Anda melalui sistem <strong>THI QHSSE DMS</strong>.
              </p>

              <!-- Document Details Table -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 24px; border-collapse: separate; border-spacing: 0;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; font-weight: 600; width: 35%;">Nomor Dokumen</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0284c7; font-weight: 800; font-family: monospace;">${data.documentNumber || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; font-weight: 600;">Judul Dokumen</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 700;">${data.documentTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; font-weight: 600;">Departemen</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155;">${data.department}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; font-weight: 600;">Status & Revisi</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #15803d; font-weight: 700;">
                    Rev. ${data.revision || '00'} (EFFECTIVE / RELEASED)
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; font-weight: 600;">Tanggal Distribusi</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155;">${currentDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #64748b; font-weight: 600;">Didistribusikan Oleh</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155; font-weight: 600;">${data.distributorName || 'Admin QMS & Document Controller'}</td>
                </tr>
              </table>

              ${data.notes ? `
              <div style="background-color: #fffbeb; border: 1px solid #fef08a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 4px; text-transform: uppercase;">Catatan Sosialisasi:</div>
                <div style="font-size: 13px; color: #78350f; line-height: 1.5;">${data.notes}</div>
              </div>
              ` : ''}

              <!-- Action Call to Action -->
              <div style="text-align: center; margin: 32px 0 24px;">
                ${data.fileUrl ? `
                <a href="${data.fileUrl}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
                  Buka & Unduh Dokumen Resmi
                </a>
                ` : `
                <a href="https://dummy-dcms.vercel.app/dashboard/masterlist" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
                  Buka Dokumen di Portal DMS
                </a>
                `}
              </div>

              <!-- Compliance Note -->
              <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b;">
                  * Dokumen ini berstatus <strong>Controlled Copy</strong>. Harap pastikan seluruh personil di departemen Anda mengacu pada dokumen revisi terbaru ini dalam operasional kerja harian.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; color: #475569;">
                PT TAKA HYDROCORE INDONESIA
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                QHSE & Quality Management System Division<br>
                Email otomatis dari THI Electronic Document Control System. Jangan membalas email ini secara langsung.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send email via Resend or Nodemailer (Gmail / SMTP)
 */
export async function sendDistributionEmail(payload: EmailDistributionPayload): Promise<{
  success: boolean;
  provider: 'resend' | 'nodemailer' | 'simulated';
  messageId?: string;
  error?: string;
}> {
  const htmlContent = generateDistributionEmailHtml(payload);
  const subject = `[DISTRIBUSI RESMI] ${payload.documentNumber ? payload.documentNumber + ' - ' : ''}${payload.documentTitle} (Rev.${payload.revision || '00'})`;

  // ── Opsi 1: Corporate SMTP Server (mail.thi.co.id, smtp.office365.com, dsb) ──
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  const smtpFrom = process.env.SMTP_FROM || `"PT Taka Hydrocore Indonesia (DMS)" <${smtpUser || 'qhsse@thi.co.id'}>`;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false, // Prevents self-signed cert failure on internal company servers
        },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: payload.to,
        subject,
        html: htmlContent,
      });

      return {
        success: true,
        provider: 'nodemailer',
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error('Error sending email via Corporate SMTP:', err);
      return {
        success: false,
        provider: 'nodemailer',
        error: err.message || 'Gagal mengirim email via Corporate SMTP server.',
      };
    }
  }

  // ── Opsi 2: Resend API (Dengan Custom Domain Perusahaan thi.co.id) ──
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';

      const response = await resend.emails.send({
        from: `PT Taka Hydrocore Indonesia <${fromEmail}>`,
        to: [payload.to],
        subject,
        html: htmlContent,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return {
        success: true,
        provider: 'resend',
        messageId: response.data?.id,
      };
    } catch (err: any) {
      console.error('Error sending email via Resend:', err);
      return {
        success: false,
        provider: 'resend',
        error: err.message || 'Gagal mengirim email via Resend.',
      };
    }
  }

  // ── Opsi 3: Gmail SMTP / Google Workspace Korporat ──
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, ''),
        },
      });

      const info = await transporter.sendMail({
        from: `"PT Taka Hydrocore Indonesia (DMS)" <${gmailUser}>`,
        to: payload.to,
        subject,
        html: htmlContent,
      });

      return {
        success: true,
        provider: 'nodemailer',
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error('Error sending email via Gmail SMTP:', err);
      return {
        success: false,
        provider: 'nodemailer',
        error: err.message || 'Gagal mengirim email via Gmail SMTP.',
      };
    }
  }

  // ── Opsi 4: Belum terkonfigurasi (Simulated preview mode) ──
  console.warn(`
[EMAIL DISTRIBUTION SIMULATED]
To: ${payload.to}
Subject: ${subject}
Note: Kredensial email perusahaan (SMTP_HOST / SMTP_USER / SMTP_PASS atau RESEND_API_KEY) belum diisi di .env.local.
  `);

  return {
    success: false,
    provider: 'simulated',
    error: 'Kredensial email perusahaan belum dikonfigurasi di .env.local. Silakan masukkan SMTP_HOST, SMTP_USER, dan SMTP_PASS.',
  };
}
