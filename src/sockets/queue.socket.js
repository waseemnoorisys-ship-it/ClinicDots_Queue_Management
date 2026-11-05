import { getIO } from "./socketManager.js";
import { logger } from "../shared/utils/logger.js";

export class QueueSocket {
    /**
     * Broadcast pool box / queue update to the hospital room
     */
    static emitQueueUpdate(hospitalId, data = {}) {
        try {
            const io = getIO();
            io.to(`hospital:${hospitalId}`).emit("queue:updated", data);
        } catch (err) {
            logger.error("Failed to emit queue:updated", { error: err.message });
        }
    }

    /**
     * Broadcast patient called to Doctor, Hospital, and Public Display rooms
     */
    static emitPatientCalled(hospitalId, doctorId, queueEntry) {
        try {
            const io = getIO();

            const doctorName = queueEntry.doctorId
                ? `Dr. ${queueEntry.doctorId.fname} ${queueEntry.doctorId.lname}`
                : "Doctor";
            const cabinNumber = queueEntry.doctorId?.cabinNumber || "Cabin 01";
            const patientName = queueEntry.patientId?.fname || "Patient";

            const payload = {
                queueEntry,
                tokenNumber: queueEntry.tokenNumber,
                patientName,
                doctorName,
                cabinNumber,
                calledAt: queueEntry.calledAt,
            };

            // 1. Notify doctor's screen
            io.to(`doctor:${doctorId}`).emit("patient:called", payload);

            // 2. Notify receptionists
            io.to(`hospital:${hospitalId}`).emit("queue:updated", payload);

            // 3. Notify Public Display TV with announcement text
            io.to(`display:${hospitalId}`).emit("display:announcement", {
                tokenNumber: queueEntry.tokenNumber,
                patientName,
                doctorName,
                cabinNumber,
                speechText: `Token ${queueEntry.tokenNumber}, ${patientName}. Please proceed to ${doctorName}, ${cabinNumber}.`,
            });
        } catch (err) {
            logger.error("Failed to emit patient:called", { error: err.message });
        }
    }

    /**
     * Broadcast doctor pause/resume state
     */
    static emitDoctorPause(hospitalId, doctorId, isPaused) {
        try {
            const io = getIO();
            io.to(`hospital:${hospitalId}`).to(`doctor:${doctorId}`).emit("doctor:paused", {
                doctorId,
                isPaused,
            });
        } catch (err) {
            logger.error("Failed to emit doctor:paused", { error: err.message });
        }
    }
}