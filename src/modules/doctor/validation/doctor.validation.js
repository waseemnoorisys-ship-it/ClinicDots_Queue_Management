import AppError from "../../../shared/errors/AppError.js";
import mongoose from "mongoose";

export const validateGetDoctors = (req, res, next) => {
    const { hospitalId } = req.query;
    if (hospitalId && !mongoose.Types.ObjectId.isValid(hospitalId)) {
        return next(new AppError("Invalid hospitalId format", 400));
    }
    next();
};
