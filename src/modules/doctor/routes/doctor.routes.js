import { Router } from "express";
import { getDoctors } from "../controller/doctor.controller.js";
import { validateGetDoctors } from "../validation/doctor.validation.js";

const router = Router();
router.get("/", validateGetDoctors, getDoctors);
export default router;