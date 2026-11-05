import mongoose from "mongoose";

const tokenCounterSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            index: true,
        },
        tokenDate: {
            type: String, // YYYY-MM-DD
            required: true,
        },
        tokenType: {
            type: String,
            enum: ["W", "A"],
            required: true,
        },
        seq: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

tokenCounterSchema.index({ hospitalId: 1, tokenDate: 1, tokenType: 1 }, { unique: true });

const TokenCounter = mongoose.model("TokenCounter", tokenCounterSchema);
export default TokenCounter;