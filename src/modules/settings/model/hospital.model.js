import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Hospital name is required"],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        phone_code: {
            type: String,
            default: "+91",
        },
        mobile: {
            type: String,
            trim: true,
            default: "",
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },
        logo: {
            type: String,
            default: "",
        },
        timezone: {
            type: String,
            default: "Asia/Kolkata", // Determines token daily reset boundary
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Hospital = mongoose.model("Hospital", hospitalSchema);
export default Hospital;