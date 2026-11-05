import { Router } from "express";
import { createWalkInVisit } from "../controller/visit.controller.js";
import { validateWalkInVisit } from "../validation/visit.validation.js";
const router = Router();

// POST /api/v1/visits/walk-in
router.post("/walk-in", validateWalkInVisit, createWalkInVisit);

export default router;