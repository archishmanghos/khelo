import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';

const router = Router();

router.get('/health', statsController.health);
router.get('/stats/leaderboard', statsController.getLeaderboard);
router.get('/stats/player/:playerId', statsController.getPlayerStats);
router.get('/stats/player/:playerId/batting', statsController.getPlayerBatting);
router.get('/stats/player/:playerId/bowling', statsController.getPlayerBowling);

export default router;
