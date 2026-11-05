import { Router } from "express";
import Hospital from "../model/hospital.model.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const hospitals = await Hospital.find({ isActive: true }).lean();
    res.status(200).json({
      success: true,
      message: "Hospitals fetched successfully",
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

