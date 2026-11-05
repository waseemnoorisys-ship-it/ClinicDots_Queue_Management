import AppError from "../../../shared/errors/AppError.js";
import mongoose from "mongoose";

export const validateAssignDoctor = (req, res, next) => {
    const { id } = req.params;
    const { hospitalId, doctorId } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Valid queueEntry ID is required in URL parameter", 400));
    }
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId is required in body", 400));
    }
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError("Valid doctorId is required in body", 400));
    }

    next();
};

export const validateDoctorQueue = (req, res, next) => {
    const { doctorId } = req.params;
    const { hospitalId } = req.query;

    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError("Valid doctorId parameter is required", 400));
    }
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId query parameter is required", 400));
    }

    next();
};

