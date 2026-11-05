import Doctor from "../model/doctor.model.js";
import AppError from "../../../shared/errors/AppError.js";

export class DoctorService {
    static async getDoctorsByHospital(hospitalId) {
        let filter = { isDeleted: false, isActive: true };
        if (hospitalId) {
            filter.hospitalId = hospitalId;
        }

        let doctors = await Doctor.find(filter)
            .select("fname lname email mobileNumber degree specialities cabinNumber hospitalId")
            .sort({ fname: 1 })
            .lean();

        // If specific hospitalId yielded no doctors, fallback to all active doctors
        if (doctors.length === 0 && hospitalId) {
            doctors = await Doctor.find({ isDeleted: false, isActive: true })
                .select("fname lname email mobileNumber degree specialities cabinNumber hospitalId")
                .sort({ fname: 1 })
                .lean();
        }

        return doctors;
    }

    static async getDoctorById(doctorId, hospitalId) {
        const filter = { _id: doctorId, isDeleted: false };
        if (hospitalId) filter.hospitalId = hospitalId;

        const doctor = await Doctor.findOne(filter);
        if (!doctor) throw new AppError("Doctor not found", 404);
        return doctor;
    }
}
