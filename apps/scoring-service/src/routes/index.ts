import { Router } from 'express';
import { scoringController } from '../controllers/scoring.controller';

const router = Router();

router.get('/health', scoringController.health);
router.get('/innings/match/:matchId', scoringController.getInningsByMatch);
router.post('/innings', scoringController.createInnings);
router.post('/innings/:inningsId/ball', scoringController.recordBall);

export default router;
