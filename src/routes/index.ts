import { Router } from "express";
import route from "./container";

const router = Router();

router.use("/containers", route);

export default router;
