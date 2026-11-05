import { VisitService } from "../service/visit.service.js";
import AppError from "../../../shared/errors/AppError.js";

export const createWalkInVisit = async (req, res, next) => {
    try {
        const { hospitalId, patientId, doctorId, reasonForVisit } = req.body;

        if (!hospitalId || !patientId || !reasonForVisit) {
            throw new AppError("hospitalId, patientId, and reasonForVisit are required", 400);
        }

        const visit = await VisitService.createWalkInVisit(req.body);

        res.status(201).json({
            success: true,
            message: "Walk-in visit created successfully",
            data: visit,
        });
    } catch (error) {
        next(error);
    }
};