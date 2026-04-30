import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import avatarsRouter from "./avatars";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(avatarsRouter);
router.use(leaderboardRouter);

export default router;
