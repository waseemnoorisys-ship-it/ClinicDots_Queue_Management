import { Router } from "express";
import {
    getPoolBox,
    assignDoctor,
    getDoctorQueue,
    callNextPatient,
    skipPatient,
    recallPatient,
    completeConsultation,
    togglePause,
} from "../controller/queue.controller.js";
import {
    validateAssignDoctor,
    validateDoctorQueue,
    validateCallNext,
    validateQueueAction,
    validateTogglePause,
} from "../validation/queue.validation.js";

const router = Router();

// ==========================================
// Action-Based Queue APIs (POST-Only, IDs in Body)
// ==========================================
router.post("/call-next", validateCallNext, callNextPatient);
router.post("/complete", validateQueueAction, completeConsultation);
router.post("/skip", validateQueueAction, skipPatient);
router.post("/recall", validateQueueAction, recallPatient);
router.post("/assign", validateAssignDoctor, assignDoctor);
router.post("/toggle-pause", validateTogglePause, togglePause);

// ==========================================
// Read-Only Query Endpoints (GET)
// ==========================================
router.get("/pool", getPoolBox);
router.get("/doctors/:doctorId", validateDoctorQueue, getDoctorQueue);

export default router;
