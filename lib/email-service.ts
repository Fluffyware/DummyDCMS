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

export interface BatchEmailDoc {
  title: string;
  number?: string;
  fileUrl?: string | null;
}

export interface BatchEmailPayload {
  to: string;
  category: string; // e.g. "Corporate Policies"
  documents: BatchEmailDoc[];
  distributorName?: string;
  notes?: string;
}

/**
 * Generate a batch HTML email listing multiple documents in one email.
 * Format: "Dear All, Here i attach new document for [Category]: 1. Title: URL..."
 */
export function generateBatchDistributionEmailHtml(data: BatchEmailPayload): string {
  const docListHtml = data.documents
    .map(
      (doc, idx) => `
      <p style="margin: 0 0 18px; font-size: 14px; color: #1e293b; line-height: 1.8;">
        <strong>${idx + 1}. ${doc.title}:</strong><br>
        ${doc.fileUrl
          ? `<a href="${doc.fileUrl}" style="color: #0284c7; text-decoration: none; font-size: 13.5px; word-break: break-all;">${doc.fileUrl}</a>`
          : `<span style="color: #64748b; font-size: 13px;">—</span>`
        }
      </p>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Distribution - PT Taka Hydrocore Indonesia</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, Helvetica, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(7,28,44,0.08); border: 1px solid #e2e8f0;">

          <tr>
            <td style="padding: 36px 40px 28px;">
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.8; color: #1e293b;">Dear All</p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.8; color: #1e293b;">
                Here i attach new document for <strong>${data.category}</strong>:
              </p>
              ${docListHtml}
              <p style="margin: 10px 0 0; font-size: 14px; line-height: 1.9; color: #1e293b;">
                If you have any questions, please contact me or the relevant<br>Sub-Department. Thank you.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0 0 4px; font-size: 13.5px; line-height: 1.9; color: #1e293b;">
                Contact Persons: <strong>Rizal Ramdani</strong> - <a href="mailto:rizal@thi.co.id" style="color: #0284c7; text-decoration: none;">rizal@thi.co.id</a> / <strong>Hetty Monalisa</strong> – <a href="mailto:admin.hse@thi.co.id" style="color: #0284c7; text-decoration: none;">admin.hse@thi.co.id</a> / <strong>Kahbil Nazhif Haqiki</strong> - <a href="mailto:qms@thi.co.id" style="color: #0284c7; text-decoration: none;">qms@thi.co.id</a>
              </p>
              ${data.notes ? `<p style="margin: 12px 0 0; font-size: 13px; color: #64748b; font-style: italic;">${data.notes}</p>` : ''}
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px; font-size: 13.5px; color: #475569; line-height: 1.7;">Best Regards,</p>
              <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #071c2c;">Quality Management System</p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">PT Taka Hydrocore Indonesia &mdash; QHSE &amp; QMS Division</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate single-document HTML email (delegates to batch template for consistency).
 */
export function generateDistributionEmailHtml(data: EmailDistributionPayload): string {
  return generateBatchDistributionEmailHtml({
    to: data.to,
    category: data.jenisDokumen || 'Corporate Documents',
    documents: [
      {
        title: `${data.documentNumber ? data.documentNumber + ' ' : ''}${data.documentTitle}`,
        fileUrl: data.fileUrl,
      },
    ],
    distributorName: data.distributorName,
    notes: data.notes,
  });
}

/**
 * Send a batch email with multiple documents listed in one email.
 */
export async function sendBatchDistributionEmail(payload: BatchEmailPayload): Promise<{
  success: boolean;
  provider: 'resend' | 'nodemailer' | 'simulated';
  messageId?: string;
  error?: string;
}> {
  const htmlContent = generateBatchDistributionEmailHtml(payload);
  const subject = `[DISTRIBUSI RESMI] New Document for ${payload.category} (${payload.documents.length} file${payload.documents.length > 1 ? 's' : ''})`;
  return _sendEmail(payload.to, subject, htmlContent);
}

/**
 * Send email via Resend or Nodemailer (Gmail / SMTP) — single document.
 */
export async function sendDistributionEmail(payload: EmailDistributionPayload): Promise<{
  success: boolean;
  provider: 'resend' | 'nodemailer' | 'simulated';
  messageId?: string;
  error?: string;
}> {
  const htmlContent = generateDistributionEmailHtml(payload);
  const subject = `[DISTRIBUSI RESMI] ${payload.documentNumber ? payload.documentNumber + ' - ' : ''}${payload.documentTitle} (Rev.${payload.revision || '00'})`;
  return _sendEmail(payload.to, subject, htmlContent);
}

/**
 * Internal: send email through the configured provider.
 */
async function _sendEmail(to: string, subject: string, htmlContent: string): Promise<{
  success: boolean;
  provider: 'resend' | 'nodemailer' | 'simulated';
  messageId?: string;
  error?: string;
}> {
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
        to,
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
        to: [to],
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
        to,
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
To: ${to}
Subject: ${subject}
Note: Kredensial email perusahaan (SMTP_HOST / SMTP_USER / SMTP_PASS atau RESEND_API_KEY) belum diisi di .env.local.
  `);

  return {
    success: false,
    provider: 'simulated',
    error: 'Kredensial email perusahaan belum dikonfigurasi di .env.local. Silakan masukkan SMTP_HOST, SMTP_USER, dan SMTP_PASS.',
  };
}

