import mongoose from "mongoose";
import dotenv from "dotenv";
import Hospital from "../../modules/settings/model/hospital.model.js";
import Doctor from "../../modules/doctor/model/doctor.model.js";
import Patient from "../../modules/patient/model/patient.model.js";

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        // 1. Create Hospital (Imperial Healthcare Hospital from your SaaS payload)
        const hospital = await Hospital.findOneAndUpdate(
            { name: "Imperial Healthcare Hospital" },
            {
                name: "Imperial Healthcare Hospital",
                email: "sid.zafar77@yopmail.com",
                phone_code: "+91",
                mobile: "9077790777",
                address: "Dwarka Circle, Dwarka, Nashik, Maharashtra",
                timezone: "Asia/Kolkata",
            },
            { upsert: true, new: true }
        );
        console.log(`Hospital ready: ${hospital.name} (ID: ${hospital._id})`);

        // 2. Create Doctors
        const doctorsData = [
            {
                hospitalId: hospital._id,
                fname: "Chaitanya",
                lname: "Mehta",
                email: "cm.mehta85@yopmail.com",
                mobileNumber: "+919077790777",
                degree: "General Practitioner",
                cabinNumber: "Cabin 01",
                specialities: ["General Practitioner"],
            },
            {
                hospitalId: hospital._id,
                fname: "Vikram",
                lname: "Mehta",
                email: "dr.vikram.mehta@yopmail.com",
                mobileNumber: "919820123456",
                degree: "MBBS, MD (Internal Medicine), FICP",
                cabinNumber: "Cabin 02",
                specialities: ["Internal Medicine"],
            },
            {
                hospitalId: hospital._id,
                fname: "Priyanka",
                lname: "Kulkarni",
                email: "priyanka.kulkarni@yopmail.com",
                mobileNumber: "919000012346",
                degree: "MBBS, MD (Pathology)",
                cabinNumber: "Cabin 03",
                specialities: ["Pathology"],
            },
            {
                hospitalId: hospital._id,
                fname: "Kashi",
                lname: "Dev",
                email: "kashi123@yopmail.com",
                mobileNumber: "+917547654757",
                degree: "BUMS, ENT",
                cabinNumber: "Cabin 04",
                specialities: ["ENT"],
            },
        ];

        for (const doc of doctorsData) {
            await Doctor.findOneAndUpdate(
                { hospitalId: hospital._id, email: doc.email },
                doc,
                { upsert: true }
            );
        }
        console.log("Doctors seeded successfully.");

        // 3. Create Sample Patient
        await Patient.findOneAndUpdate(
            { hospitalId: hospital._id, contact: "919876543210" },
            {
                hospitalId: hospital._id,
                fname: "Aarav Sharma",
                email: "aarav.sharma@yopmail.com",
                contact: "919876543210",
                age: "32",
                gender: "male",
                address: "Flat 402, Green Park Avenue, Mumbai",
                state: "Maharashtra",
                uniqueId: "404706",
            },
            { upsert: true }
        );
        console.log("Sample patient seeded.");

        console.log("\nSeeding complete! You can now start the server.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seed();