import { PatientService } from "../service/patient.service.js";

export const searchPatients = async (req, res, next) => {
    try {
        const { hospitalId, query, page, limit } = req.query;
        const result = await PatientService.searchPatients({
            hospitalId,
            query,
            page,
            limit,
        });

        res.status(200).json({
            success: true,
            message: "Patients retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const registerPatient = async (req, res, next) => {
    try {
        const patient = await PatientService.registerPatient(req.body);

        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            data: patient,
        });
    } catch (error) {
        next(error);
    }
};

export const getPatientById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hospitalId } = req.query;
        const patient = await PatientService.getPatientById(id, hospitalId);

        res.status(200).json({
            success: true,
            message: "Patient fetched successfully",
            data: patient,
        });
    } catch (error) {
        next(error);
    }
};