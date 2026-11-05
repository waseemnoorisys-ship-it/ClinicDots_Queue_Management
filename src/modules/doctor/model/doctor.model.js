import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: [true, "Hospital ID is required"],
            index: true,
        },
        fname: {
            type: String,
            required: [true, "Doctor first name is required"],
            trim: true,
        },
        lname: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        mobileNumber: {
            type: String,
            trim: true,
            default: "",
        },
        degree: {
            type: String,
            trim: true,
            default: "General Practitioner",
        },
        specialities: {
            type: [String],
            default: [],
        },
        cabinNumber: {
            type: String,
            trim: true,
            default: "Cabin 01", // Used on public display board
        },
        profileImage: {
            type: String,
            default: "",
        },
        isClinicDoctor: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual full name for UI convenience
doctorSchema.virtual("fullName").get(function () {
    return `Dr. ${this.fname} ${this.lname}`.trim();
});

doctorSchema.set("toJSON", { virtuals: true });
doctorSchema.set("toObject", { virtuals: true });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;