import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import {
  createDocumentSchema,
  updateDocumentSchema,
  createFolderSchema,
  documentQuerySchema,
} from './document.validation';
import * as docService from './document.service';
import { uploadToS3, generateS3Key } from '../../config/s3';
import { authenticate } from '../../middleware/auth';
import { processDocumentOcr } from './ocr.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(authenticate);

// ─── GET /api/documents ─────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = documentQuerySchema.parse(req.query);
    const orgId = req.user!.sub;
    const result = await docService.listDocuments(orgId, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/documents/folders ─────────────

router.get('/folders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user!.sub;
    const folders = await docService.listFolders(orgId);
    res.json({ folders });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/documents/folders ────────────

router.post('/folders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createFolderSchema.parse(req.body);
    const orgId = req.user!.sub;
    const folder = await docService.createFolder(orgId, data);
    res.status(201).json({ message: 'Folder created', folder });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/documents/folders/:id ──────

router.delete('/folders/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user!.sub;
    const result = await docService.deleteFolder(String(req.params.id), orgId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/documents/upload-url ─────────

router.post('/upload-url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName, mimeType } = req.body;
    const orgId = req.user!.sub;
    const result = await docService.requestUploadUrl(orgId, fileName, mimeType);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/documents/upload ─────────────

router.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const orgId = req.user!.sub;
      const userId = req.user!.sub;
      const file = req.file;

      // Upload to S3
      const s3Key = generateS3Key(orgId, file.originalname);
      await uploadToS3(s3Key, file.buffer, file.mimetype);

      // Parse metadata from body
      const metadata = {
        name: req.body.name || file.originalname,
        type: (req.body.type || 'OTHER') as any,
        description: req.body.description,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        folderId: req.body.folderId || null,
      };

      // Create document record
      const doc = await docService.createDocument(orgId, userId, {
        ...metadata,
        fileName: file.originalname,
        fileType: file.originalname.split('.').pop() || '',
        fileSize: file.size,
        mimeType: file.mimetype,
        s3Key,
      });

      // Trigger OCR processing for images and PDFs (async, non-blocking)
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        processDocumentOcr(doc.id).catch((err) => {
          console.error(`OCR trigger failed for document ${doc.id}:`, err);
        });
      }

      res.status(201).json({ message: 'Document uploaded successfully', document: doc });
    } catch (err) {
      next(err);
    }
  },
);

// ─── GET /api/documents/:id ─────────────────

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user!.sub;
    const document = await docService.getDocument(String(req.params.id), orgId);
    res.json({ document });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/documents/:id ─────────────────

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateDocumentSchema.parse(req.body);
    const orgId = req.user!.sub;
    const document = await docService.updateDocument(String(req.params.id), orgId, data);
    res.json({ message: 'Document updated', document });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/documents/:id/version ────────

router.post(
  '/:id/version',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const orgId = req.user!.sub;
      const userId = req.user!.sub;

      const result = await docService.uploadNewVersion(
        String(req.params.id),
        orgId,
        userId,
        {
          buffer: req.file.buffer,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        },
        req.body.comment,
      );

      res.json({ message: 'New version uploaded', document: result });
    } catch (err) {
      next(err);
    }
  },
);

// ─── DELETE /api/documents/:id ──────────────

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user!.sub;
    const result = await docService.deleteDocument(String(req.params.id), orgId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
