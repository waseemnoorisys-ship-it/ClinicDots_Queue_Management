import TokenCounter from "../model/tokenCounter.model.js";

export class TokenService {
    /**
     * Atomically generate a daily sequence token: W_01, A_01...
     */
    static async generateToken({ hospitalId, tokenType, dateString }) {
        // Defaults to today's date formatted as YYYY-MM-DD
        const today = dateString || new Date().toISOString().split("T")[0];

        const counter = await TokenCounter.findOneAndUpdate(
            { hospitalId, tokenDate: today, tokenType },
            { $inc: { seq: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const formattedSequence = String(counter.seq).padStart(2, "0");
        const tokenNumber = `${tokenType}_${formattedSequence}`;

        return {
            tokenNumber,
            tokenSequence: counter.seq,
            tokenType,
            tokenDate: today,
        };
    }
}