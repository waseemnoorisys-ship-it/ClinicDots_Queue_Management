import QueueEntry from "../model/queueEntry.model.js";
import QueueEvent from "../model/queueEvent.model.js";
import DoctorSchedule from "../../doctorSchedule/model/doctorSchedule.model.js";
import Visit from "../../visit/model/visit.model.js";
import Doctor from "../../doctor/model/doctor.model.js";
import { TokenService } from "../../token/service/token.service.js";
import AppError from "../../../shared/errors/AppError.js";
import { QueueSocket } from "../../../sockets/queue.socket.js";

// In-memory set to track paused doctors
const pausedDoctors = new Set();

export class QueueService {
    /**
     * Create queue entry and place patient into the Pool Box
     */
    static async addToPool({ hospitalId, patientId, visitId, appointmentId = null, visitType, scheduledTime = null }) {
        const tokenType = visitType === "Scheduled" ? "A" : "W";
        const tokenInfo = await TokenService.generateToken({ hospitalId, tokenType });

        const queueEntry = await QueueEntry.create({
            hospitalId,
            patientId,
            visitId,
            appointmentId,
            tokenNumber: tokenInfo.tokenNumber,
            tokenType: tokenInfo.tokenType,
            tokenSequence: tokenInfo.tokenSequence,
            tokenDate: tokenInfo.tokenDate,
            visitType,
            arrivalStatus: "Arrived",
            assignmentStatus: "Unassigned",
            queueStatus: "Waiting",
            scheduledTime,
        });

        // Log Event
        await QueueEvent.create({
            hospitalId,
            queueEntryId: queueEntry._id,
            eventType: "PATIENT_ARRIVED",
            metadata: { tokenNumber: queueEntry.tokenNumber, visitType },
        });

        // Broadcast to receptionists
        QueueSocket.emitQueueUpdate(hospitalId, { action: "PATIENT_ARRIVED", queueEntry });

        return queueEntry;
    }

    /**
     * Get Pool Box (all unassigned arrived patients)
     */
    static async getPoolBox(hospitalId) {
        return QueueEntry.find({
            hospitalId,
            assignmentStatus: "Unassigned",
            arrivalStatus: "Arrived",
            queueStatus: "Waiting",
        })
            .populate("patientId", "fname contact age gender uniqueId")
            .populate("visitId", "reasonForVisit createdAt")
            .sort({ createdAt: 1 })
            .lean();
    }

    /**
     * Assign patient from Pool Box to a Doctor
     */
    static async assignDoctor({ queueEntryId, doctorId, hospitalId }) {
        const [entry, doctor] = await Promise.all([
            QueueEntry.findOne({ _id: queueEntryId, hospitalId }),
            Doctor.findOne({ _id: doctorId, hospitalId, isDeleted: false }),
        ]);

        if (!entry) throw new AppError("Queue entry not found", 404);
        if (!doctor) throw new AppError("Doctor not found", 404);

        entry.doctorId = doctorId;
        entry.assignmentStatus = "Assigned";
        await entry.save();

        // Also update Visit with doctorId
        await Visit.findByIdAndUpdate(entry.visitId, { doctorId });

        // Log Event
        await QueueEvent.create({
            hospitalId,
            queueEntryId: entry._id,
            doctorId,
            eventType: "PATIENT_ASSIGNED",
            metadata: { doctorName: `Dr. ${doctor.fname} ${doctor.lname}` },
        });

        // Broadcast queue update
        QueueSocket.emitQueueUpdate(hospitalId, { action: "PATIENT_ASSIGNED", queueEntry: entry });

        return entry;
    }

    /**
     * Fetch a specific doctor's queue state
     */
    static async getDoctorQueue({ hospitalId, doctorId }) {
        const isPaused = pausedDoctors.has(doctorId.toString());

        const [currentConsultation, waitingPatients, skippedPatients] = await Promise.all([
            QueueEntry.findOne({ hospitalId, doctorId, queueStatus: "In Progress" })
                .populate("patientId", "fname contact age gender uniqueId")
                .populate("visitId", "reasonForVisit")
                .lean(),
            QueueEntry.find({
                hospitalId,
                doctorId,
                queueStatus: "Waiting",
                arrivalStatus: "Arrived",
            })
                .populate("patientId", "fname contact age gender uniqueId")
                .populate("visitId", "reasonForVisit")
                .sort({ tokenType: 1, tokenSequence: 1 })
                .lean(),
            QueueEntry.find({ hospitalId, doctorId, queueStatus: "Skipped" })
                .populate("patientId", "fname contact age gender uniqueId")
                .populate("visitId", "reasonForVisit")
                .sort({ skippedAt: 1 })
                .lean(),
        ]);

        return {
            isPaused,
            currentConsultation: currentConsultation || null,
            waitingPatients: waitingPatients || [],
            skippedPatients: skippedPatients || [],
            waitingCount: waitingPatients?.length || 0,
        };
    }

    /**
     * Call Next Patient using Arrival-Aware Priority Algorithm
     */
    static async callNextPatient({ hospitalId, doctorId }) {
        const doctorKey = doctorId.toString();
        if (pausedDoctors.has(doctorKey)) {
            throw new AppError("Doctor queue is paused. Resume before calling the next patient.", 400);
        }

        // 1. Check if doctor is already consulting a patient
        const active = await QueueEntry.findOne({ hospitalId, doctorId, queueStatus: "In Progress" });
        if (active) {
            throw new AppError(`Patient with token ${active.tokenNumber} is already In Progress. Complete or skip first.`, 400);
        }

        // 2. Fetch all eligible patients
        const eligibleEntries = await QueueEntry.find({
            hospitalId,
            doctorId,
            queueStatus: "Waiting",
            arrivalStatus: "Arrived",
        }).lean();

        if (eligibleEntries.length === 0) {
            return null; // No waiting patients
        }

        // 3. Separate Arrived Scheduled (A) vs Arrived Walk-ins (W)
        const scheduled = eligibleEntries.filter((e) => e.tokenType === "A");
        const walkIns = eligibleEntries.filter((e) => e.tokenType === "W");

        let nextPatient = null;

        if (scheduled.length > 0) {
            // Arrived scheduled patients take precedence -> sort by scheduledTime, then tokenSequence
            scheduled.sort((a, b) => {
                if (a.scheduledTime && b.scheduledTime) {
                    return a.scheduledTime.localeCompare(b.scheduledTime);
                }
                return a.tokenSequence - b.tokenSequence;
            });
            nextPatient = scheduled[0];
        } else {
            // Arrived walk-in patients -> sort strictly by original tokenSequence
            walkIns.sort((a, b) => a.tokenSequence - b.tokenSequence);
            nextPatient = walkIns[0];
        }

        // 4. Mark In Progress
        const updated = await QueueEntry.findByIdAndUpdate(
            nextPatient._id,
            {
                queueStatus: "In Progress",
                calledAt: new Date(),
                startedAt: new Date(),
            },
            { new: true }
        )
            .populate("patientId", "fname contact age gender uniqueId")
            .populate("doctorId", "fname lname cabinNumber");

        // 5. Log Event
        await QueueEvent.create({
            hospitalId,
            queueEntryId: updated._id,
            doctorId,
            eventType: "PATIENT_CALLED",
            metadata: { tokenNumber: updated.tokenNumber },
        });

        // 6. Broadcast to screens & public display
        QueueSocket.emitPatientCalled(hospitalId, doctorId, updated);

        return updated;
    }

    /**
     * Skip current patient
     */
    static async skipPatient({ queueEntryId, hospitalId, doctorId }) {
        const entry = await QueueEntry.findOne({ _id: queueEntryId, hospitalId, doctorId });
        if (!entry) throw new AppError("Active queue entry not found", 404);

        entry.queueStatus = "Skipped";
        entry.skippedAt = new Date();
        await entry.save();

        await QueueEvent.create({
            hospitalId,
            queueEntryId: entry._id,
            doctorId,
            eventType: "PATIENT_SKIPPED",
            metadata: { tokenNumber: entry.tokenNumber },
        });

        QueueSocket.emitQueueUpdate(hospitalId, { action: "PATIENT_SKIPPED", queueEntry: entry });

        return entry;
    }

    /**
     * Recall previously skipped patient
     */
    static async recallPatient({ queueEntryId, hospitalId, doctorId }) {
        const entry = await QueueEntry.findOne({ _id: queueEntryId, hospitalId, doctorId, queueStatus: "Skipped" });
        if (!entry) throw new AppError("Skipped patient entry not found", 404);

        // Re-queue at the end of eligible line
        entry.queueStatus = "Waiting";
        entry.skippedAt = null;
        await entry.save();

        await QueueEvent.create({
            hospitalId,
            queueEntryId: entry._id,
            doctorId,
            eventType: "PATIENT_RECALLED",
            metadata: { tokenNumber: entry.tokenNumber },
        });

        QueueSocket.emitQueueUpdate(hospitalId, { action: "PATIENT_RECALLED", queueEntry: entry });

        return entry;
    }

    /**
     * Complete consultation and automatically call the next eligible patient
     */
    static async completeConsultation({ queueEntryId, hospitalId, doctorId }) {
        const entry = await QueueEntry.findOne({ _id: queueEntryId, hospitalId, doctorId });
        if (!entry) throw new AppError("Active consultation not found", 404);

        entry.queueStatus = "Completed";
        entry.completedAt = new Date();
        await entry.save();

        // Mark visit completed
        await Visit.findByIdAndUpdate(entry.visitId, { visitStatus: "Completed" });

        // Log completion
        await QueueEvent.create({
            hospitalId,
            queueEntryId: entry._id,
            doctorId,
            eventType: "CONSULTATION_COMPLETED",
            metadata: { tokenNumber: entry.tokenNumber },
        });

        QueueSocket.emitQueueUpdate(hospitalId, { action: "CONSULTATION_COMPLETED", queueEntry: entry });

        // Auto-call next patient if not paused
        let nextCalled = null;
        if (!pausedDoctors.has(doctorId.toString())) {
            nextCalled = await this.callNextPatient({ hospitalId, doctorId });
        }

        return {
            completedEntry: entry,
            nextCalled,
        };
    }

    /**
     * Pause or resume a doctor's queue
     */
    static async toggleDoctorPause({ hospitalId, doctorId, isPaused }) {
        const doctorKey = doctorId.toString();

        if (isPaused) {
            pausedDoctors.add(doctorKey);
        } else {
            pausedDoctors.delete(doctorKey);
        }

        await QueueEvent.create({
            hospitalId,
            doctorId,
            eventType: isPaused ? "DOCTOR_PAUSED" : "DOCTOR_RESUMED",
        });

        QueueSocket.emitDoctorPause(hospitalId, doctorId, isPaused);

        return { doctorId, isPaused };
    }
}
