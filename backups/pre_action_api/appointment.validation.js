import AppError from "../../../shared/errors/AppError.js";
import mongoose from "mongoose";

export const validateBookAppointment = (req, res, next) => {
    const { hospitalId, patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId is required", 400));
    }
    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
        return next(new AppError("Valid patientId is required", 400));
    }
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError("Valid doctorId is required", 400));
    }
    if (!appointmentDate || isNaN(new Date(appointmentDate).getTime())) {
        return next(new AppError("Valid appointmentDate is required (e.g. YYYY-MM-DD)", 400));
    }
    if (!appointmentTime || !appointmentTime.trim()) {
        return next(new AppError("appointmentTime is required", 400));
    }
    if (!reason || !reason.trim()) {
        return next(new AppError("reason for appointment is required", 400));
    }

    next();
};

export const validateConfirmArrival = (req, res, next) => {
    const { id } = req.params;
    const { hospitalId } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Valid appointment ID parameter is required", 400));
    }
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Valid hospitalId is required in body", 400));
    }

    next();
};

