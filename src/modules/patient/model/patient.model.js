import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: [true, "Hospital ID is required"],
            index: true,
        },
        fname: {
            type: String,
            required: [true, "Patient name is required"],
            trim: true,
        },
        contact: {
            type: String,
            trim: true,
            default: "", // String to preserve leading zeroes and country code
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        age: {
            type: String,
            required: [true, "Age is required"],
            trim: true,
        },
        gender: {
            type: String,
            required: [true, "Gender is required"],
            enum: ["male", "female", "other"],
            lowercase: true,
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },
        state: {
            type: String,
            trim: true,
            default: "",
        },
        profilePicture: {
            type: String,
            default: "",
        },
        uniqueId: {
            type: String,
            trim: true,
            index: true, // Unique external ID e.g. 626706
        },
        isWalkIn: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for high-speed scoped search
patientSchema.index({ hospitalId: 1, contact: 1 });
patientSchema.index({ hospitalId: 1, fname: 1 });
patientSchema.index({ hospitalId: 1, uniqueId: 1 });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;