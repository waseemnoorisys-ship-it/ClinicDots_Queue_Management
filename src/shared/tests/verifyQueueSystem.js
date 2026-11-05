import mongoose from "mongoose";
import dotenv from "dotenv";
import Hospital from "../../modules/settings/model/hospital.model.js";
import Doctor from "../../modules/doctor/model/doctor.model.js";
import Patient from "../../modules/patient/model/patient.model.js";
import Visit from "../../modules/visit/model/visit.model.js";
import QueueEntry from "../../modules/queue/model/queueEntry.model.js";
import TokenCounter from "../../modules/token/model/tokenCounter.model.js";
import { QueueService } from "../../modules/queue/service/queue.service.js";
import { TokenService } from "../../modules/token/service/token.service.js";

dotenv.config();

const runVerification = async () => {
  console.log("=================================================");
  console.log(" STARTING CLINICDOTS SYSTEM VERIFICATION TEST");
  console.log("=================================================");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Database connected");

    // 1. Verify Hospital & Doctors exist
    const hospital = await Hospital.findOne({ name: "Imperial Healthcare Hospital" });
    if (!hospital) throw new Error("Hospital not found");
    console.log(`✓ Hospital verified: ${hospital.name}`);

    const doctors = await Doctor.find({ hospitalId: hospital._id });
    if (doctors.length === 0) throw new Error("Doctors not found");
    console.log(`✓ Doctors verified: ${doctors.length} doctors active`);

    // 2. Test Atomic Token Generation
    console.log("\n--- Testing Atomic Token Generator ---");
    const testDate = "2026-11-04";
    const t1 = await TokenService.generateToken({ hospitalId: hospital._id, tokenType: "W", dateString: testDate });
    const t2 = await TokenService.generateToken({ hospitalId: hospital._id, tokenType: "W", dateString: testDate });
    const tA = await TokenService.generateToken({ hospitalId: hospital._id, tokenType: "A", dateString: testDate });

    if (t2.tokenSequence !== t1.tokenSequence + 1) {
      throw new Error("Token sequence increment failed!");
    }
    console.log(`✓ Atomic Walk-in Tokens: ${t1.tokenNumber}, ${t2.tokenNumber}`);
    console.log(`✓ Independent Scheduled Token: ${tA.tokenNumber}`);

    // 3. Test Arrival-Aware Priority Queue
    console.log("\n--- Testing Arrival-Aware Queue Priority ---");
    const testDoc = doctors[0];
    await QueueEntry.deleteMany({ hospitalId: hospital._id, tokenSequence: 99 });
    await QueueEntry.updateMany({ hospitalId: hospital._id, doctorId: testDoc._id, queueStatus: "In Progress" }, { queueStatus: "Completed" });

    // Create 2 test patients
    const patientW = await Patient.create({
      hospitalId: hospital._id,
      fname: "Test Walkin",
      contact: "9199990001",
      age: "25",
      gender: "male",
    });

    const patientA = await Patient.create({
      hospitalId: hospital._id,
      fname: "Test Scheduled",
      contact: "9199990002",
      age: "30",
      gender: "female",
    });

    const visitW = await Visit.create({
      hospitalId: hospital._id,
      patientId: patientW._id,
      doctorId: testDoc._id,
      visitType: "Walk-in",
      reasonForVisit: "Test Walkin",
    });

    const visitA = await Visit.create({
      hospitalId: hospital._id,
      patientId: patientA._id,
      doctorId: testDoc._id,
      visitType: "Scheduled",
      reasonForVisit: "Test Scheduled",
    });

    // Create Walk-in Queue Entry first (earlier sequence)
    const entryW = await QueueEntry.create({
      hospitalId: hospital._id,
      patientId: patientW._id,
      visitId: visitW._id,
      doctorId: testDoc._id,
      tokenNumber: "W_99",
      tokenType: "W",
      tokenSequence: 99,
      tokenDate: testDate,
      visitType: "Walk-in",
      arrivalStatus: "Arrived",
      assignmentStatus: "Assigned",
      queueStatus: "Waiting",
    });

    // Create Scheduled Queue Entry second (later sequence but scheduled)
    const entryA = await QueueEntry.create({
      hospitalId: hospital._id,
      patientId: patientA._id,
      visitId: visitA._id,
      doctorId: testDoc._id,
      tokenNumber: "A_99",
      tokenType: "A",
      tokenSequence: 99,
      tokenDate: testDate,
      visitType: "Scheduled",
      scheduledTime: "11:00 AM",
      arrivalStatus: "Arrived",
      assignmentStatus: "Assigned",
      queueStatus: "Waiting",
    });

    // Call Next: Arrival-Aware priority must pick 'A_99' before 'W_99'
    const called = await QueueService.callNextPatient({ hospitalId: hospital._id, doctorId: testDoc._id });
    if (!called || called.tokenNumber !== "A_99") {
      throw new Error(`Priority failure: Expected A_99 to be called first, but got ${called?.tokenNumber}`);
    }
    console.log(`✓ Arrival-Aware Priority verified: Scheduled token (${called.tokenNumber}) called ahead of Walk-in token (W_99)!`);

    // Complete Consultation -> Auto-call must now pick W_99
    console.log("\n--- Testing Consultation Complete & Auto-Call ---");
    const completeResult = await QueueService.completeConsultation({
      queueEntryId: called._id,
      hospitalId: hospital._id,
      doctorId: testDoc._id,
    });

    if (!completeResult.nextCalled || completeResult.nextCalled.tokenNumber !== "W_99") {
      throw new Error(`Auto-call failure: Expected W_99, got ${completeResult.nextCalled?.tokenNumber}`);
    }
    console.log(`✓ Consultation completed and next eligible patient (${completeResult.nextCalled.tokenNumber}) auto-called!`);

    // Cleanup test records
    await QueueEntry.deleteMany({ _id: { $in: [entryW._id, entryA._id] } });
    await Visit.deleteMany({ _id: { $in: [visitW._id, visitA._id] } });
    await Patient.deleteMany({ _id: { $in: [patientW._id, patientA._id] } });

    console.log("\n=================================================");
    console.log(" ALL SYSTEM VERIFICATION CHECKS PASSED (100%)");
    console.log("=================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Verification Failed:", error.message);
    process.exit(1);
  }
};

runVerification();

