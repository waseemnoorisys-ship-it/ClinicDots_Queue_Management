import mongoose from "mongoose";
import dotenv from "dotenv";
import Hospital from "../../modules/settings/model/hospital.model.js";
import Doctor from "../../modules/doctor/model/doctor.model.js";
import Patient from "../../modules/patient/model/patient.model.js";
import Visit from "../../modules/visit/model/visit.model.js";
import QueueEntry from "../../modules/queue/model/queueEntry.model.js";
import TokenCounter from "../../modules/token/model/tokenCounter.model.js";

dotenv.config();

const seedTestQueue = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for test queue seeding...");

    // 1. Get Hospital & Doctors
    const hospital = await Hospital.findOne({ name: "Imperial Healthcare Hospital" });
    if (!hospital) {
      console.error("Please run node src/shared/seed/seedData.js first to create the hospital!");
      process.exit(1);
    }

    const doctors = await Doctor.find({ hospitalId: hospital._id }).sort({ fname: 1 });
    if (doctors.length === 0) {
      console.error("No doctors found! Please run seedData.js first.");
      process.exit(1);
    }

    const drChaitanya = doctors[0]; // Dr. Chaitanya Mehta (Cabin 01)
    const drVikram = doctors[1];    // Dr. Vikram Mehta (Cabin 02)

    // Clear existing queue entries & visits for clean test state
    await QueueEntry.deleteMany({ hospitalId: hospital._id });
    await Visit.deleteMany({ hospitalId: hospital._id });
    await TokenCounter.deleteMany({ hospitalId: hospital._id });

    const today = new Date().toISOString().split("T")[0];

    // 2. Dummy Patients Data
    const dummyPatients = [
      { fname: "Rahul Kumar", contact: "+919876540001", age: "28", gender: "male" },
      { fname: "Priya Sharma", contact: "+919876540002", age: "34", gender: "female" },
      { fname: "Ananya Deshmukh", contact: "+919876540003", age: "29", gender: "female" },
      { fname: "Amitabh Verma", contact: "+919876540004", age: "52", gender: "male" },
      { fname: "Sneha Patel", contact: "+919876540005", age: "24", gender: "female" },
      { fname: "Rajesh Iyer", contact: "+919876540006", age: "41", gender: "male" },
      { fname: "Farhan Ansari", contact: "+919876540007", age: "31", gender: "male" },
    ];

    const createdPatients = [];
    for (const p of dummyPatients) {
      const patient = await Patient.findOneAndUpdate(
        { hospitalId: hospital._id, contact: p.contact },
        { ...p, hospitalId: hospital._id, uniqueId: Math.floor(100000 + Math.random() * 900000).toString() },
        { upsert: true, new: true }
      );
      createdPatients.push(patient);
    }

    console.log(`Created/Verified ${createdPatients.length} dummy patients.`);

    // 3. Populate 2 Patients in POOL BOX (Unassigned)
    // Patient 0: Walk-in (W_01)
    const visit1 = await Visit.create({
      hospitalId: hospital._id,
      patientId: createdPatients[0]._id,
      visitType: "Walk-in",
      reasonForVisit: "Persistent throat pain and cough",
    });
    await QueueEntry.create({
      hospitalId: hospital._id,
      patientId: createdPatients[0]._id,
      visitId: visit1._id,
      tokenNumber: "W_01",
      tokenType: "W",
      tokenSequence: 1,
      tokenDate: today,
      visitType: "Walk-in",
      arrivalStatus: "Arrived",
      assignmentStatus: "Unassigned",
      queueStatus: "Waiting",
    });

    // Patient 1: Walk-in (W_02)
    const visit2 = await Visit.create({
      hospitalId: hospital._id,
      patientId: createdPatients[1]._id,
      visitType: "Walk-in",
      reasonForVisit: "Mild fever and body ache",
    });
    await QueueEntry.create({
      hospitalId: hospital._id,
      patientId: createdPatients[1]._id,
      visitId: visit2._id,
      tokenNumber: "W_02",
      tokenType: "W",
      tokenSequence: 2,
      tokenDate: today,
      visitType: "Walk-in",
      arrivalStatus: "Arrived",
      assignmentStatus: "Unassigned",
      queueStatus: "Waiting",
    });

    // 4. Populate 3 Patients assigned to Dr. Chaitanya (Cabin 01)
    // Patient 2: Scheduled A_01 (10:00 AM) - Arrived
    const visit3 = await Visit.create({
      hospitalId: hospital._id,
      patientId: createdPatients[2]._id,
      doctorId: drChaitanya._id,
      visitType: "Scheduled",
      reasonForVisit: "Diabetes Monthly Follow-up",
    });
    await QueueEntry.create({
      hospitalId: hospital._id,
      patientId: createdPatients[2]._id,
      visitId: visit3._id,
      doctorId: drChaitanya._id,
      tokenNumber: "A_01",
      tokenType: "A",
      tokenSequence: 1,
      tokenDate: today,
      visitType: "Scheduled",
      scheduledTime: "10:00 AM",
      arrivalStatus: "Arrived",
      assignmentStatus: "Assigned",
      queueStatus: "Waiting",
    });

    // Patient 3: Walk-in W_03 - Arrived
    const visit4 = await Visit.create({
      hospitalId: hospital._id,
      patientId: createdPatients[3]._id,
      doctorId: drChaitanya._id,
      visitType: "Walk-in",
      reasonForVisit: "Severe Migraine",
    });
    await QueueEntry.create({
      hospitalId: hospital._id,
      patientId: createdPatients[3]._id,
      visitId: visit4._id,
      doctorId: drChaitanya._id,
      tokenNumber: "W_03",
      tokenType: "W",
      tokenSequence: 3,
      tokenDate: today,
      visitType: "Walk-in",
      arrivalStatus: "Arrived",
      assignmentStatus: "Assigned",
      queueStatus: "Waiting",
    });

    // Patient 4: Scheduled A_02 (10:30 AM) - Arrived
    const visit5 = await Visit.create({
      hospitalId: hospital._id,
      patientId: createdPatients[4]._id,
      doctorId: drChaitanya._id,
      visitType: "Scheduled",
      reasonForVisit: "ECG Review",
    });
    await QueueEntry.create({
      hospitalId: hospital._id,
      patientId: createdPatients[4]._id,
      visitId: visit5._id,
      doctorId: drChaitanya._id,
      tokenNumber: "A_02",
      tokenType: "A",
      tokenSequence: 2,
      tokenDate: today,
      visitType: "Scheduled",
      scheduledTime: "10:30 AM",
      arrivalStatus: "Arrived",
      assignmentStatus: "Assigned",
      queueStatus: "Waiting",
    });

    // 5. Populate 2 Patients assigned to Dr. Vikram (Cabin 02)
    // Patient 5: Walk-in W_04
    const visit6 = await Visit.create({
      hospitalId: hospital._id,
      patientId: createdPatients[5]._id,
      doctorId: drVikram._id,
      visitType: "Walk-in",
      reasonForVisit: "Hypertension checkup",
    });
    await QueueEntry.create({
      hospitalId: hospital._id,
      patientId: createdPatients[5]._id,
      visitId: visit6._id,
      doctorId: drVikram._id,
      tokenNumber: "W_04",
      tokenType: "W",
      tokenSequence: 4,
      tokenDate: today,
      visitType: "Walk-in",
      arrivalStatus: "Arrived",
      assignmentStatus: "Assigned",
      queueStatus: "Waiting",
    });

    // Save token counters so future registrations continue smoothly
    await TokenCounter.create([
      { hospitalId: hospital._id, tokenDate: today, tokenType: "W", seq: 4 },
      { hospitalId: hospital._id, tokenDate: today, tokenType: "A", seq: 2 },
    ]);

    console.log("\n=================================================");
    console.log(" TEST QUEUE DATA SEEDED SUCCESSFULLY!");
    console.log("=================================================");
    console.log("📥 Pool Box: 2 unassigned patients (W_01, W_02)");
    console.log("🩺 Dr. Chaitanya Mehta (Cabin 01): 3 patients (A_01, W_03, A_02)");
    console.log("🩺 Dr. Vikram Mehta (Cabin 02): 1 patient (W_04)");
    console.log("=================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Test queue seed error:", err);
    process.exit(1);
  }
};

seedTestQueue();

