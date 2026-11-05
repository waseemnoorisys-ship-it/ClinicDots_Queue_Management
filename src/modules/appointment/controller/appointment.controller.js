import { AppointmentService } from "../service/appointment.service.js";
import AppError from "../../../shared/errors/AppError.js";

export const bookAppointment = async (req, res, next) => {
    try {
        const { hospitalId, patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

        if (!hospitalId || !patientId || !doctorId || !appointmentDate || !appointmentTime || !reason) {
            throw new AppError("All fields (hospitalId, patientId, doctorId, appointmentDate, appointmentTime, reason) are required in body", 400);
        }

        const appointment = await AppointmentService.bookAppointment(req.body);

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: appointment,
        });
    } catch (error) {
        next(error);
    }
};

export const confirmArrival = async (req, res, next) => {
    try {
        const { hospitalId, appointmentId } = req.body;

        const result = await AppointmentService.confirmArrival({
            appointmentId,
            hospitalId,
        });

        res.status(200).json({
            success: true,
            message: "Patient arrival confirmed and visit created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getAppointments = async (req, res, next) => {
    try {
        const { hospitalId, doctorId, date, status } = req.query;
        if (!hospitalId) throw new AppError("hospitalId query parameter is required", 400);

        const appointments = await AppointmentService.getAppointments({
            hospitalId,
            doctorId,
            date,
            status,
        });

        res.status(200).json({
            success: true,
            message: "Appointments retrieved successfully",
            data: appointments,
        });
    } catch (error) {
        next(error);
    }
};
