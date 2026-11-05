import AppError from "../../../shared/errors/AppError.js";
import mongoose from "mongoose";

export const validateBookAppointment = (req, res, next) => {
    const { hospitalId, patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId is required in body", 400));
    }
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
        return next(new AppError("Valid patientId is required in body", 400));
    }
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError("Valid doctorId is required in body", 400));
    }
    if (!appointmentDate || isNaN(new Date(appointmentDate).getTime())) {
        return next(new AppError("Valid appointmentDate is required in body (e.g. YYYY-MM-DD)", 400));
    }
    if (!appointmentTime || !appointmentTime.trim()) {
        return next(new AppError("appointmentTime is required in body", 400));
    }
    if (!reason || !reason.trim()) {
        return next(new AppError("reason for appointment is required in body", 400));
    }

    next();
};

export const validateConfirmArrival = (req, res, next) => {
    const { hospitalId, appointmentId } = req.body;

    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
        return next(new AppError("Valid appointmentId is required in body", 400));
    }
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId is required in body", 400));
    }

    next();
};
