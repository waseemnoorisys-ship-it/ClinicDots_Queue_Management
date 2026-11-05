import { Router } from "express";
import {
    searchPatients,
    registerPatient,
    getPatientById,
} from "../controller/patient.controller.js";
import {
    validateRegisterPatient,
    validatePatientSearch,
} from "../validation/patient.validation.js";

const router = Router();

// GET /api/v1/patients/search?hospitalId=...&query=...&page=1&limit=10
router.get("/search", validatePatientSearch, searchPatients);

// POST /api/v1/patients
router.post("/", validateRegisterPatient, registerPatient);

// GET /api/v1/patients/:id?hospitalId=...
router.get("/:id", getPatientById);

export default router;