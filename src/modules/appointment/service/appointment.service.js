import Appointment from "../model/appointment.model.js";
import DoctorSchedule from "../../doctorSchedule/model/doctorSchedule.model.js";
import Visit from "../../visit/model/visit.model.js";
import Patient from "../../patient/model/patient.model.js";
import Doctor from "../../doctor/model/doctor.model.js";
import AppError from "../../../shared/errors/AppError.js";
import { QueueService } from "../../queue/service/queue.service.js";
export class AppointmentService {
    /**
     * Book a scheduled appointment with capacity validation
     */
    static async bookAppointment({
        hospitalId,
        patientId,
        doctorId,
        appointmentDate,
        appointmentTime,
        reason,
    }) {
        // 1. Validate Patient & Doctor existence
        const [patient, doctor] = await Promise.all([
            Patient.findOne({ _id: patientId, hospitalId, isDelete: false }),
            Doctor.findOne({ _id: doctorId, hospitalId, isDeleted: false }),
        ]);

        if (!patient) throw new AppError("Patient not found in this hospital", 404);
        if (!doctor) throw new AppError("Doctor not found in this hospital", 404);

        // 2. Normalize target date to midnight
        const targetDate = new Date(appointmentDate);
        targetDate.setHours(0, 0, 0, 0);

        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // 3. Check Doctor Schedule & Capacity
        const schedule = await DoctorSchedule.findOne({
            hospitalId,
            doctorId,
            isActive: true,
        });

        const maxScheduled = schedule ? schedule.maxScheduledCapacity : 28;

        // Count already booked active appointments on that date
        const bookedCount = await Appointment.countDocuments({
            hospitalId,
            doctorId,
            appointmentDate: { $gte: targetDate, $lt: nextDate },
            status: { $nin: ["Cancelled", "No Show"] },
        });

        if (bookedCount >= maxScheduled) {
            throw new AppError(
                `Doctor scheduled capacity full for this date (${bookedCount}/${maxScheduled}). Reserved walk-in slots remain available on arrival.`,
                400
            );
        }

        // 4. Create Appointment
        const appointment = await Appointment.create({
            hospitalId,
            patientId,
            doctorId,
            appointmentDate: targetDate,
            appointmentTime,
            reason,
            status: "Scheduled",
        });

        return appointment;
    }

    /**
     * Confirm Arrival of a scheduled patient -> Creates Visit record
     */
    static async confirmArrival({ appointmentId, hospitalId }) {
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            hospitalId,
        });

        if (!appointment) throw new AppError("Appointment not found", 404);

        if (appointment.status === "Arrived") {
            throw new AppError("Patient has already been marked as Arrived", 400);
        }
        if (["Cancelled", "No Show"].includes(appointment.status)) {
            throw new AppError(`Cannot check in an appointment with status: ${appointment.status}`, 400);
        }

        // 1. Update Appointment status to Arrived
        appointment.status = "Arrived";
        await appointment.save();

        // 2. Create Visit record linked to this appointment
        const visit = await Visit.create({
            hospitalId,
            patientId: appointment.patientId,
            appointmentId: appointment._id,
            doctorId: appointment.doctorId,
            visitType: "Scheduled",
            reasonForVisit: appointment.reason,
            visitStatus: "Active",
        });
        // Inside confirmArrival after Visit is created:
        const queueEntry = await QueueService.addToPool({
            hospitalId,
            patientId: appointment.patientId,
            visitId: visit._id,
            appointmentId: appointment._id,
            visitType: "Scheduled",
            scheduledTime: appointment.appointmentTime,
        });
        // Save token number in appointment
        appointment.tokenNumber = queueEntry.tokenNumber;
        await appointment.save();

        return { appointment, visit, queueEntry };
    }

    /**
     * Get appointments with filters
     */
    static async getAppointments({ hospitalId, doctorId, date, status }) {
        const filter = { hospitalId };

        if (doctorId) filter.doctorId = doctorId;
        if (status) filter.status = status;

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            filter.appointmentDate = { $gte: start, $lt: end };
        }

        return Appointment.find(filter)
            .populate("patientId", "fname contact age gender uniqueId")
            .populate("doctorId", "fname lname cabinNumber degree")
            .sort({ appointmentDate: 1, appointmentTime: 1 })
            .lean();
    }
}