import { Router, type Request, type Response, type NextFunction } from 'express';
import { createClientSchema, updateClientSchema, clientQuerySchema } from './client.validation';
import * as clientService from './client.service';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── GET /api/clients ───────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = clientQuerySchema.parse(req.query);
    const orgId = req.user!.sub; // Simplified: use user's org
    const result = await clientService.listClients(orgId, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/clients/tags ──────────────────

router.get('/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user!.sub;
    const tags = await clientService.getClientTags(orgId);
    res.json({ tags });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/clients/:id ───────────────────

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user!.sub;
    const client = await clientService.getClient(String(req.params.id), orgId);
    res.json({ client });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/clients ──────────────────────

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createClientSchema.parse(req.body);
    const orgId = req.user!.sub;
    const userId = req.user!.sub;
    const client = await clientService.createClient(orgId, userId, data);
    res.status(201).json({ message: 'Client created successfully', client });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/clients/:id ───────────────────

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateClientSchema.parse(req.body);
    const orgId = req.user!.sub;
    const client = await clientService.updateClient(String(req.params.id), orgId, data);
    res.json({ message: 'Client updated successfully', client });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/clients/:id ────────────────

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user!.sub;
    const result = await clientService.deleteClient(String(req.params.id), orgId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
