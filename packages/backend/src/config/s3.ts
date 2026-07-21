import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';

// ─── S3 Client ──────────────────────────────

export const s3 = new S3Client({
  region: env.AWS_REGION || 'us-east-1',
  ...(env.AWS_ACCESS_KEY_ID &&
    env.AWS_SECRET_ACCESS_KEY && {
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    }),
});

const BUCKET = env.AWS_S3_BUCKET_NAME || 'fiscalflow-uploads';

// ─── Upload ─────────────────────────────────

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<{ key: string; bucket: string }> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return { key, bucket: BUCKET };
}

// ─── Presigned Download URL ─────────────────

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn });
}

// ─── Presigned Upload URL (for direct client upload) ─

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, { expiresIn });
}

// ─── Delete ─────────────────────────────────

export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );
}

// ─── Key Generator ──────────────────────────

export function generateS3Key(orgId: string, fileName: string, version?: number): string {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const versionSuffix = version ? `_v${version}` : '';
  return `organizations/${orgId}/documents/${timestamp}_${versionSuffix}_${safeName}`;
}
