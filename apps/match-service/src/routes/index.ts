import { Router } from 'express';
import { matchController } from '../controllers/match.controller';

const router = Router();

router.get('/health', matchController.health);
router.get('/matches', matchController.getAll);
router.get('/matches/:id', matchController.getById);
router.post('/matches', matchController.create);
router.put('/matches/:id', matchController.update);
router.post('/matches/:id/start', matchController.start);

export default router;
