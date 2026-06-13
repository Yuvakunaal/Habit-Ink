import { Router, type IRouter } from "express";

import entriesRouter from "./entries";
import habitsRouter from "./habits";
import healthRouter from "./health";
import journalsRouter from "./journals";

const router: IRouter = Router();

router.use(healthRouter);
router.use(habitsRouter);
router.use(entriesRouter);
router.use(journalsRouter);

export default router;
