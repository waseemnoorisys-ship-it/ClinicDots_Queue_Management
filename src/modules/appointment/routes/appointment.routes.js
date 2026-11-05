import { Router } from "express";
import {
    bookAppointment,
    confirmArrival,
    getAppointments,
} from "../controller/appointment.controller.js";
import { validateBookAppointment, validateConfirmArrival } from "../validation/appointment.validation.js";

const router = Router();

// ==========================================
// Action-Based Appointment APIs (POST, IDs in Body)
// ==========================================
// POST /api/v1/appointments/check-in - Confirm arrival & issue priority token
router.post("/check-in", validateConfirmArrival, confirmArrival);

// ==========================================
// Standard Booking & Listing
// ==========================================
// POST /api/v1/appointments - Book appointment
router.post("/", validateBookAppointment, bookAppointment);

// GET /api/v1/appointments?hospitalId=... - List appointments
router.get("/", getAppointments);

export default router;
