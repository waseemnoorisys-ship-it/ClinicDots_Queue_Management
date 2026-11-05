import { QueueService } from "../service/queue.service.js";
import AppError from "../../../shared/errors/AppError.js";

export const getPoolBox = async (req, res, next) => {
    try {
        const { hospitalId } = req.query;
        if (!hospitalId) throw new AppError("hospitalId is required", 400);

        const pool = await QueueService.getPoolBox(hospitalId);
        res.status(200).json({ success: true, message: "Pool box fetched", data: pool });
    } catch (error) {
        next(error);
    }
};

export const assignDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hospitalId, doctorId } = req.body;

        const assigned = await QueueService.assignDoctor({ queueEntryId: id, doctorId, hospitalId });
        res.status(200).json({ success: true, message: "Patient assigned to doctor successfully", data: assigned });
    } catch (error) {
        next(error);
    }
};

export const getDoctorQueue = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { hospitalId } = req.query;

        const queue = await QueueService.getDoctorQueue({ hospitalId, doctorId });
        res.status(200).json({ success: true, message: "Doctor queue fetched", data: queue });
    } catch (error) {
        next(error);
    }
};

export const callNextPatient = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { hospitalId } = req.body;

        if (!hospitalId) throw new AppError("hospitalId is required in body", 400);

        const called = await QueueService.callNextPatient({ hospitalId, doctorId });
        res.status(200).json({
            success: true,
            message: called ? `Called patient token ${called.tokenNumber}` : "No waiting patients in queue",
            data: called,
        });
    } catch (error) {
        next(error);
    }
};

export const skipPatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hospitalId, doctorId } = req.body;

        const skipped = await QueueService.skipPatient({ queueEntryId: id, hospitalId, doctorId });
        res.status(200).json({ success: true, message: "Patient skipped", data: skipped });
    } catch (error) {
        next(error);
    }
};

export const recallPatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hospitalId, doctorId } = req.body;

        const recalled = await QueueService.recallPatient({ queueEntryId: id, hospitalId, doctorId });
        res.status(200).json({ success: true, message: "Patient recalled to waiting queue", data: recalled });
    } catch (error) {
        next(error);
    }
};

export const completeConsultation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hospitalId, doctorId } = req.body;

        const result = await QueueService.completeConsultation({ queueEntryId: id, hospitalId, doctorId });
        res.status(200).json({ success: true, message: "Consultation completed", data: result });
    } catch (error) {
        next(error);
    }
};

export const togglePause = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { hospitalId, isPaused } = req.body;

        const result = await QueueService.toggleDoctorPause({ hospitalId, doctorId, isPaused: Boolean(isPaused) });
        res.status(200).json({ success: true, message: isPaused ? "Doctor paused" : "Doctor resumed", data: result });
    } catch (error) {
        next(error);
    }
};

