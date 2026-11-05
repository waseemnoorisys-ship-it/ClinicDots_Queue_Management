// import Doctor from "../model/doctor.model.js";
// import AppError from "../../../shared/errors/AppError.js";

// export const getDoctors = async (req, res, next) => {
//     try {
//         const { hospitalId } = req.query;
//         if (!hospitalId) throw new AppError("hospitalId query parameter is required", 400);

//         const doctors = await Doctor.find({ hospitalId, isDeleted: false, isActive: true })
//             .select("fname lname email mobileNumber degree specialities cabinNumber")
//             .lean();

//         res.status(200).json({
//             success: true,
//             message: "Doctors fetched successfully",
//             data: doctors,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

import { DoctorService } from "../service/doctor.service.js";

export const getDoctors = async (req, res, next) => {
    try {
        const doctors = await DoctorService.getDoctorsByHospital(req.query.hospitalId);
        res.status(200).json({
            success: true,
            message: "Doctors fetched successfully",
            data: doctors,
        });
    } catch (error) {
        next(error);
    }
};