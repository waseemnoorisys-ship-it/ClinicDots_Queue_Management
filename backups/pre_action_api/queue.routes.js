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
} from "../validation/queue.validation.js";

const router = Router();

// Pool Box
router.get("/pool", getPoolBox);
router.post("/:id/assign", validateAssignDoctor, assignDoctor);

// Doctor Queues
router.get("/doctors/:doctorId", validateDoctorQueue, getDoctorQueue);
router.post("/doctors/:doctorId/call-next", callNextPatient);
router.patch("/doctors/:doctorId/pause", togglePause);

// Actions on individual queue entries
router.post("/:id/skip", skipPatient);
router.post("/:id/recall", recallPatient);
router.post("/:id/complete", completeConsultation);

export default router;

