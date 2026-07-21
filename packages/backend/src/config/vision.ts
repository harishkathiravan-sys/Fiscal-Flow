import Vision from '@google-cloud/vision';
import { env } from './env';

// ─── Vision Client ──────────────────────────

let client: InstanceType<typeof Vision.ImageAnnotatorClient> | null = null;

function getClient() {
  if (!client) {
    if (env.GOOGLE_APPLICATION_CREDENTIALS) {
      client = new Vision.ImageAnnotatorClient();
    } else {
      throw new Error(
        'Google Vision credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS in your .env file.',
      );
    }
  }
  return client;
}

// ─── Extract Text from Image/PDF ────────────

export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string,
): Promise<{ text: string; confidence: number; pages: number }> {
  const imageClient = getClient();

  if (mimeType === 'application/pdf') {
    const [result] = await (imageClient as any).batchAnnotateFiles({
      requests: [
        {
          inputConfig: {
            content: buffer,
            mimeType: 'application/pdf',
          },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          pages: [1],
        },
      ],
    });

    const response = (result as any).responses?.[0];
    const fullText = response?.responses?.[0]?.fullTextAnnotation?.text || '';
    const confidence = response?.responses?.[0]?.fullTextAnnotation?.pages?.[0]?.confidence || 0;

    return { text: fullText, confidence, pages: 1 };
  }

  // For images
  const [result] = await (imageClient as any).annotateImage({
    image: { content: buffer },
    features: [
      { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
      { type: 'TEXT_DETECTION', maxResults: 1 },
    ],
  });

  const fullText = (result as any).fullTextAnnotation?.text || '';
  const confidence = (result as any).fullTextAnnotation?.pages?.[0]?.confidence || 0;

  return { text: fullText, confidence, pages: 1 };
}
