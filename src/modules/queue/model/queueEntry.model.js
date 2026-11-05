import mongoose from "mongoose";

const queueEntrySchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            index: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            index: true,
        },
        visitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Visit",
            required: true,
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
            index: true,
        },
        tokenNumber: {
            type: String, // e.g. W_01 or A_01
            required: true,
        },
        tokenType: {
            type: String,
            enum: ["W", "A"],
            required: true,
        },
        tokenSequence: {
            type: Number,
            required: true,
        },
        tokenDate: {
            type: String, // YYYY-MM-DD
            required: true,
        },
        visitType: {
            type: String,
            enum: ["Walk-in", "Scheduled"],
            required: true,
        },
        arrivalStatus: {
            type: String,
            enum: ["Not Arrived", "Arrived"],
            default: "Arrived",
            index: true,
        },
        assignmentStatus: {
            type: String,
            enum: ["Unassigned", "Assigned"],
            default: "Unassigned",
            index: true,
        },
        queueStatus: {
            type: String,
            enum: ["Waiting", "In Progress", "Completed", "Skipped"],
            default: "Waiting",
            index: true,
        },
        scheduledTime: {
            type: String, // e.g. "10:30 AM" (used for priority sorting among scheduled patients)
            default: null,
        },
        calledAt: { type: Date, default: null },
        startedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        skippedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
    }
);

queueEntrySchema.index({ hospitalId: 1, tokenDate: 1, tokenType: 1, tokenSequence: 1 }, { unique: true });
queueEntrySchema.index({ hospitalId: 1, doctorId: 1, queueStatus: 1 });
queueEntrySchema.index({ hospitalId: 1, assignmentStatus: 1, createdAt: 1 });

const QueueEntry = mongoose.model("QueueEntry", queueEntrySchema);
export default QueueEntry;