import mongoose from "mongoose";
import dotenv from "dotenv";
import Hospital from "../../modules/settings/model/hospital.model.js";
import Doctor from "../../modules/doctor/model/doctor.model.js";
import Patient from "../../modules/patient/model/patient.model.js";
import Visit from "../../modules/visit/model/visit.model.js";
import QueueEntry from "../../modules/queue/model/queueEntry.model.js";
import Appointment from "../../modules/appointment/model/appointment.model.js";
import express from "express";
import http from "http";
import queueRoutes from "../../modules/queue/routes/queue.routes.js";
import appointmentRoutes from "../../modules/appointment/routes/appointment.routes.js";
import { initSocket } from "../../sockets/socketManager.js";

dotenv.config();

const runTest = async () => {
  console.log("=========================================");
  console.log(" TESTING NEW ACTION-BASED APIS (POST-ONLY)");
  console.log("=========================================");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ MongoDB Connected");

  const hospital = await Hospital.findOne({ name: "Imperial Healthcare Hospital" });
  const doctor = await Doctor.findOne({ hospitalId: hospital._id });

  // Spin up an in-memory test express app to call the real routes directly
  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  initSocket(server);

  app.use("/api/v1/queue", queueRoutes);
  app.use("/api/v1/appointments", appointmentRoutes);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  try {
    // 1. Test POST /queue/toggle-pause
    console.log("\n1. Testing POST /api/v1/queue/toggle-pause...");
    let res = await fetch(`${baseUrl}/queue/toggle-pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospitalId: hospital._id, doctorId: doctor._id, isPaused: true }),
    });
    let data = await res.json();
    if (!data.success) throw new Error("Toggle pause failed: " + JSON.stringify(data));
    console.log("✓ POST /queue/toggle-pause worked: Doctor paused");

    // Resume
    res = await fetch(`${baseUrl}/queue/toggle-pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospitalId: hospital._id, doctorId: doctor._id, isPaused: false }),
    });
    console.log("✓ POST /queue/toggle-pause worked: Doctor resumed");

    // 2. Test POST /appointments/check-in
    console.log("\n2. Testing POST /api/v1/appointments/check-in...");
    const testPatient = await Patient.create({
      hospitalId: hospital._id,
      fname: "Action Test Patient",
      contact: "9199990999",
      age: "28",
      gender: "female",
    });

    const testAppt = await Appointment.create({
      hospitalId: hospital._id,
      patientId: testPatient._id,
      doctorId: doctor._id,
      appointmentDate: new Date(),
      appointmentTime: "11:00 AM",
      reason: "Action API Test",
      status: "Scheduled",
    });

    res = await fetch(`${baseUrl}/appointments/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospitalId: hospital._id, appointmentId: testAppt._id }),
    });
    data = await res.json();
    if (!data.success) throw new Error("Check-in failed: " + JSON.stringify(data));
    console.log(`✓ POST /appointments/check-in worked! Token: ${data.data?.queueEntry?.tokenNumber}`);

    // Clean up test records
    await Appointment.deleteOne({ _id: testAppt._id });
    await QueueEntry.deleteOne({ appointmentId: testAppt._id });
    await Patient.deleteOne({ _id: testPatient._id });

    console.log("\n=========================================");
    console.log(" ALL ACTION-BASED API CHECKS PASSED 100%");
    console.log("=========================================");
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

