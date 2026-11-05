import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: [true, "Doctor ID is required"],
            index: true,
        },
        appointmentDate: {
            type: Date,
            required: [true, "Appointment date is required"],
        },
        appointmentTime: {
            type: String,
            required: [true, "Appointment time/slot is required"],
            trim: true,
        },
        reason: {
            type: String,
            required: [true, "Reason for appointment is required"],
            trim: true,
        },
        appointmentType: {
            type: String,
            enum: ["Scheduled"],
            default: "Scheduled",
        },
        status: {
            type: String,
            enum: ["Scheduled", "Confirmed", "Arrived", "In Progress", "Completed", "Cancelled", "No Show"],
            default: "Scheduled",
            index: true,
        },
        tokenNumber: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

appointmentSchema.index({ hospitalId: 1, doctorId: 1, appointmentDate: 1, status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;