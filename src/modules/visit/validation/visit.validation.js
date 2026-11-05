import AppError from "../../../shared/errors/AppError.js";
import mongoose from "mongoose";

export const validateWalkInVisit = (req, res, next) => {
    const { hospitalId, patientId, doctorId, reasonForVisit } = req.body;

    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId is required", 400));
    }
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
        return next(new AppError("Valid patientId is required", 400));
    }
    if (doctorId && !mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError("Invalid doctorId format", 400));
    }
    if (!reasonForVisit || !reasonForVisit.trim()) {
        return next(new AppError("reasonForVisit is required", 400));
    }

    next();
};