import AppError from "../../../shared/errors/AppError.js";
import mongoose from "mongoose";

export const validateAssignDoctor = (req, res, next) => {
    const { hospitalId, doctorId, queueEntryId } = req.body;

    if (!queueEntryId || !mongoose.Types.ObjectId.isValid(queueEntryId)) {
        return next(new AppError("Valid queueEntryId is required in body", 400));
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

export const validateCallNext = (req, res, next) => {
    const { hospitalId, doctorId } = req.body;

    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError("Valid doctorId is required in body", 400));
    }
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId is required in body", 400));
    }

    next();
};

export const validateQueueAction = (req, res, next) => {
    const { hospitalId, doctorId, queueEntryId } = req.body;

    if (!queueEntryId || !mongoose.Types.ObjectId.isValid(queueEntryId)) {
        return next(new AppError("Valid queueEntryId is required in body", 400));
    }
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId is required in body", 400));
    }
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError("Valid doctorId is required in body", 400));
    }

    next();
};

export const validateTogglePause = (req, res, next) => {
    const { hospitalId, doctorId } = req.body;

    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError("Valid doctorId is required in body", 400));
    }
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId is required in body", 400));
    }

    next();
};
