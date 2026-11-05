import mongoose from "mongoose";

const queueEventSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            index: true,
        },
        queueEntryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "QueueEntry",
            required: false,
            index: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            default: null,
            index: true,
        },
        eventType: {
            type: String,
            required: true,
            enum: [
                "PATIENT_ARRIVED",
                "PATIENT_ASSIGNED",
                "PATIENT_CALLED",
                "PATIENT_SKIPPED",
                "PATIENT_RECALLED",
                "CONSULTATION_COMPLETED",
                "DOCTOR_PAUSED",
                "DOCTOR_RESUMED",
            ],
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

const QueueEvent = mongoose.model("QueueEvent", queueEventSchema);
export default QueueEvent;