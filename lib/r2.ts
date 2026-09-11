import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'thi-qhsse-documents';
const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

export const isR2Configured = (): boolean => {
  return Boolean(
    accountId &&
    accessKeyId &&
    secretAccessKey &&
    !accountId.includes('your-cloudflare-account-id')
  );
};

export const getR2Client = (): S3Client | null => {
  if (!isR2Configured()) return null;

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

/**
 * Upload a Buffer or Uint8Array directly to Cloudflare R2
 */
export async function uploadBufferToR2({
  buffer,
  key,
  contentType = 'application/octet-stream',
}: {
  buffer: Buffer | Uint8Array;
  key: string;
  contentType?: string;
}): Promise<{ key: string; url: string }> {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured. Check environment variables.');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  // Return public URL or fallback signed URL
  const fileUrl = publicUrl ? `${publicUrl.replace(/\/$/, '')}/${key}` : `/api/r2/download?key=${encodeURIComponent(key)}`;

  return {
    key,
    url: fileUrl,
  };
}

/**
 * Generate a pre-signed URL for client-side direct upload to R2
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string = 'application/pdf',
  expiresInSeconds: number = 3600
): Promise<string> {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a pre-signed URL for secure file downloading from R2
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}
