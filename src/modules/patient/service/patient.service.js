import Patient from "../model/patient.model.js";
import AppError from "../../../shared/errors/AppError.js";

export class PatientService {
    /**
     * Search patients scoped to a hospital with server-side pagination
     */
    static async searchPatients({ hospitalId, query = "", page = 1, limit = 10 }) {
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        const filter = {
            hospitalId,
            isDelete: false,
            isActive: true,
        };

        if (query && query.trim()) {
            const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "i");
            filter.$or = [
                { fname: regex },
                { contact: regex },
                { uniqueId: regex },
            ];
        }

        const [patients, total] = await Promise.all([
            Patient.find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Patient.countDocuments(filter),
        ]);

        return {
            patients,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum) || 1,
            },
        };
    }

    /**
     * Register a new permanent patient record
     */
    static async registerPatient(data) {
        // Generate a random 6-digit uniqueId if not provided (matching SaaS pattern)
        if (!data.uniqueId) {
            data.uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
        }

        // Normalize contact to +91XXXXXXXXXX
        if (data.contact) {
            const digits = data.contact.replace(/\D/g, "");
            const tenDigits = digits.length > 10 ? digits.slice(-10) : digits;
            data.contact = `+91${tenDigits}`;
        }

        const newPatient = await Patient.create(data);
        return newPatient;
    }

    /**
     * Fetch single patient by ID
     */
    static async getPatientById(patientId, hospitalId) {
        const patient = await Patient.findOne({
            _id: patientId,
            hospitalId,
            isDelete: false,
        });
        if (!patient) {
            throw new AppError("Patient not found", 404);
        }
        return patient;
    }
}