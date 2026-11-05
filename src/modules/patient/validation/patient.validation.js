import AppError from "../../../shared/errors/AppError.js";

export const validateRegisterPatient = (req, res, next) => {
    const { hospitalId, fname, contact, age, gender } = req.body;

    if (!hospitalId) {
        return next(new AppError("hospitalId is required in body", 400));
    }
    if (!fname || typeof fname !== "string" || !fname.trim()) {
        return next(new AppError("Patient name (fname) is required", 400));
    }
    if (!contact || typeof contact !== "string" || !contact.trim()) {
        return next(new AppError("Mobile number (contact) is required for new registration", 400));
    }

    // Clean and validate Indian 10-digit mobile number starting with 6, 7, 8, or 9
    const cleanContact = contact.replace(/[\s\-\(\)]/g, "");
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanContact)) {
        return next(new AppError("Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9", 400));
    }

    // Normalize contact to standard +91XXXXXXXXXX
    const digitsOnly = cleanContact.replace(/\D/g, "");
    const tenDigits = digitsOnly.slice(-10);
    req.body.contact = `+91${tenDigits}`;

    if (!age || isNaN(parseInt(age, 10)) || parseInt(age, 10) <= 0 || parseInt(age, 10) > 130) {
        return next(new AppError("A valid age between 1 and 130 is required", 400));
    }
    if (!gender || !["male", "female", "other"].includes(gender.toLowerCase())) {
        return next(new AppError("Gender must be 'male', 'female', or 'other'", 400));
    }

    next();
};

export const validatePatientSearch = (req, res, next) => {
    const { hospitalId } = req.query;
    if (!hospitalId) {
        return next(new AppError("Query parameter 'hospitalId' is required for patient search", 400));
    }
    next();
};
