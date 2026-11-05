import Visit from "../model/visit.model.js";
import Patient from "../../patient/model/patient.model.js";
import Doctor from "../../doctor/model/doctor.model.js";
import AppError from "../../../shared/errors/AppError.js";
import { QueueService } from "../../queue/service/queue.service.js";
export class VisitService {
    /**
     * Create direct visit for Walk-in patient
     */
    static async createWalkInVisit({ hospitalId, patientId, doctorId, reasonForVisit }) {
        const patient = await Patient.findOne({ _id: patientId, hospitalId, isDelete: false });
        if (!patient) throw new AppError("Patient not found in this hospital", 404);

        if (doctorId) {
            const doctor = await Doctor.findOne({ _id: doctorId, hospitalId, isDeleted: false });
            if (!doctor) throw new AppError("Doctor not found in this hospital", 404);
        }

        const visit = await Visit.create({
            hospitalId,
            patientId,
            doctorId: doctorId || null,
            visitType: "Walk-in",
            reasonForVisit,
            visitStatus: "Active",
        });
        // Automatically add to Pool Box
        const queueEntry = await QueueService.addToPool({
            hospitalId,
            patientId,
            visitId: visit._id,
            visitType: "Walk-in",
        });

        return { visit, queueEntry };
    }
}