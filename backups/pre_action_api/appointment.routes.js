import { Router } from "express";
import {
    bookAppointment,
    confirmArrival,
    getAppointments,
} from "../controller/appointment.controller.js";
import { validateBookAppointment, validateConfirmArrival } from "../validation/appointment.validation.js";
const router = Router();

// POST /api/v1/appointments - Book appointment
router.post("/", validateBookAppointment, bookAppointment);

// GET /api/v1/appointments?hospitalId=... - List appointments
router.get("/", getAppointments);

// PATCH /api/v1/appointments/:id/arrive - Confirm arrival
router.patch("/:id/arrive", validateConfirmArrival, confirmArrival);

export default router;

