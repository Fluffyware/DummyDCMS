import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export type DistributionType = 'NEW_DOC' | 'REVISION_UPDATE' | 'ANNOUNCEMENT';

export interface EmailDistributionPayload {
  to: string; // e.g. 'filayati_akbar@yahoo.com'
  documentTitle: string;
  documentNumber: string;
  revision: string;
  department: string;
  jenisDokumen?: string;
  distributionType?: DistributionType;
  customSubject?: string;
  appOrigin?: string;
  logoUrl?: string;
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
  distributionType?: DistributionType;
  customSubject?: string;
  appOrigin?: string;
  logoUrl?: string;
  documents: BatchEmailDoc[];
  distributorName?: string;
  notes?: string;
}

/**
 * Generate a batch HTML email listing multiple documents in one email.
 * Format: "Dear All, Here i attach [new/revised/socialization] document for [Category]: 1. Title: URL..."
 */
export function generateBatchDistributionEmailHtml(data: BatchEmailPayload): string {
  let logoUrl = data.logoUrl;
  if (!logoUrl || logoUrl.includes('localhost') || logoUrl.startsWith('/')) {
    if (data.appOrigin && !data.appOrigin.includes('localhost')) {
      logoUrl = `${data.appOrigin}/thi-logo-official.png`;
    } else if (process.env.VERCEL_URL && !process.env.VERCEL_URL.includes('localhost')) {
      logoUrl = `https://${process.env.VERCEL_URL}/thi-logo-official.png`;
    } else {
      // Public CDN hosted logo URL (ensures image loads in Gmail / Outlook even when testing from localhost)
      logoUrl = 'https://raw.githubusercontent.com/Fluffyware/DummyDCMS/main/public/thi-logo-official.png';
    }
  }

  const docListHtml = data.documents
    .map(
      (doc, idx) => `
      <p style="margin: 0 0 18px; font-size: 14px; color: #1e293b; line-height: 1.8;">
        <strong>${idx + 1}. ${doc.title}:</strong><br>
        ${doc.fileUrl
          ? `<a href="${doc.fileUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 6px; padding: 8px 18px; background-color: #0284c7; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 4px rgba(2,132,199,0.2);">Lihat Dokumen</a>`
          : `<span style="color: #64748b; font-size: 13px;">—</span>`
        }
      </p>`
    )
    .join('');

  let introLine = `Here i attach new document for <strong>${data.category}</strong>:`;
  if (data.distributionType === 'REVISION_UPDATE') {
    introLine = `Here i attach revised document for <strong>${data.category}</strong>:`;
  } else if (data.distributionType === 'ANNOUNCEMENT') {
    introLine = `Here i attach controlled document for socialization:`;
  }

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
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(7,28,44,0.08); border: 1px solid #e2e8f0;">

          <!-- Header Section with Official THI Logo -->
          <tr>
            <td style="padding: 24px 40px; background-color: #ffffff; border-bottom: 3px solid #0284c7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="middle" style="vertical-align: middle;">
                    <img src="${logoUrl}" alt="PT Taka Hydrocore Indonesia" style="height: 38px; width: auto; max-width: 220px; display: block; border: 0;" />
                  </td>
                  <td align="right" valign="middle" style="vertical-align: middle; text-align: right;">
                    <span style="font-size: 11px; font-weight: 800; color: #071c2c; text-transform: uppercase; letter-spacing: 0.06em; display: block;">Document Control</span>
                    <span style="font-size: 10.5px; color: #0284c7; font-weight: 600; display: block; margin-top: 2px;">QHSE &amp; QMS Division</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 40px 28px;">
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.8; color: #1e293b;">Dear All</p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.8; color: #1e293b;">
                ${introLine}
              </p>
              ${docListHtml}
              <p style="margin: 10px 0 0; font-size: 14px; line-height: 1.9; color: #1e293b;">
                If you have any questions, please contact me or the relevant<br>Sub-Department. Thank you.
              </p>
            </td>
          </tr>

          <!-- Contact Persons Section -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="margin: 0 0 4px; font-size: 13.5px; line-height: 1.9; color: #1e293b;">
                Contact Persons: <strong>Rizal Ramdani</strong> - <a href="mailto:rizal@thi.co.id" style="color: #0284c7; text-decoration: none;">rizal@thi.co.id</a> / <strong>Hetty Monalisa</strong> – <a href="mailto:admin.hse@thi.co.id" style="color: #0284c7; text-decoration: none;">admin.hse@thi.co.id</a> / <strong>Kahbil Nazhif Haqiki</strong> - <a href="mailto:qms@thi.co.id" style="color: #0284c7; text-decoration: none;">qms@thi.co.id</a>
              </p>
              ${data.notes ? `<p style="margin: 12px 0 0; font-size: 13px; color: #64748b; font-style: italic; background-color: #f8fafc; padding: 10px 14px; border-left: 3px solid #cbd5e1; border-radius: 4px;">${data.notes}</p>` : ''}
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px; font-size: 13.5px; color: #475569; line-height: 1.6;">Best Regards,</p>
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
  const docTitle = data.distributionType === 'REVISION_UPDATE'
    ? `${data.documentNumber ? data.documentNumber + ' ' : ''}(Rev.${data.revision}) ${data.documentTitle}`
    : `${data.documentNumber ? data.documentNumber + ' ' : ''}${data.documentTitle}`;

  return generateBatchDistributionEmailHtml({
    to: data.to,
    category: data.jenisDokumen || 'Corporate Documents',
    distributionType: data.distributionType,
    customSubject: data.customSubject,
    appOrigin: data.appOrigin,
    logoUrl: data.logoUrl,
    documents: [
      {
        title: docTitle,
        fileUrl: data.fileUrl,
      },
    ],
    distributorName: data.distributorName,
    notes: data.notes,
  });
}

function resolveDistributionSubject(type?: DistributionType, custom?: string): string {
  if (custom) return custom;
  if (type === 'REVISION_UPDATE') return 'Taka Hydrocore - Released Revised Document';
  if (type === 'ANNOUNCEMENT') return 'Taka Hydrocore - Document Socialization';
  return 'Taka Hydrocore - Released New Document';
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
  const subject = resolveDistributionSubject(payload.distributionType, payload.customSubject);
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
  const subject = resolveDistributionSubject(payload.distributionType, payload.customSubject);
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

      const logoPath = path.join(process.cwd(), 'public/thi-logo-official.png');
      const hasLogo = fs.existsSync(logoPath);

      const mailOptions: any = {
        from: smtpFrom,
        to,
        subject,
        html: hasLogo
          ? htmlContent.replace(/src="[^"]*thi-logo-official\.png[^"]*"/g, 'src="cid:thi-logo-official"')
          : htmlContent,
      };

      if (hasLogo) {
        mailOptions.attachments = [
          {
            filename: 'thi-logo-official.png',
            path: logoPath,
            cid: 'thi-logo-official',
          },
        ];
      }

      const info = await transporter.sendMail(mailOptions);

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

