import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: [true, "Hospital ID is required"],
            index: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: [true, "Patient ID is required"],
            index: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            default: null,
        },
        visitDate: {
            type: Date,
            default: Date.now,
        },
        visitType: {
            type: String,
            enum: ["Walk-in", "Scheduled"],
            required: [true, "Visit type is required"],
        },
        reasonForVisit: {
            type: String,
            required: [true, "Reason for visit is required"],
            trim: true,
        },
        visitStatus: {
            type: String,
            enum: ["Active", "Completed", "Cancelled"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

// One appointment can only ever generate one visit record
visitSchema.index({ appointmentId: 1 }, { unique: true, sparse: true });
visitSchema.index({ hospitalId: 1, patientId: 1, createdAt: -1 });

const Visit = mongoose.model("Visit", visitSchema);
export default Visit;