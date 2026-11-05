import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: [true, "Hospital ID is required"],
            index: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: [true, "Doctor ID is required"],
            index: true,
        },
        workingDays: {
            type: [String],
            default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
        workingHours: {
            start: { type: String, default: "09:00" },
            end: { type: String, default: "17:00" },
        },
        slotDuration: {
            type: Number,
            default: 15, // in minutes
        },
        estimatedDailyCapacity: {
            type: Number,
            default: 40,
        },
        maxScheduledCapacity: {
            type: Number,
            default: 28, // 70% of 40
        },
        reservedWalkInCapacity: {
            type: Number,
            default: 12, // 30% of 40
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

doctorScheduleSchema.index({ hospitalId: 1, doctorId: 1, isActive: 1 });

const DoctorSchedule = mongoose.model("DoctorSchedule", doctorScheduleSchema);
export default DoctorSchedule;