const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect('mongodb+srv://sridharpandiarajan12:bhUDOX3a0k7Y2qPD@cluster0.bap30ja.mongodb.net/docscode')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ✅ Doctor Schema & Model


// ✅ Patient Schema with Visit-based Model


// ✅ Doctor Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const doctor = await Doctor.findOne({ username, password });
    if (!doctor) return res.status(401).send({ message: "Invalid credentials" });
    res.send({ doctorName: doctor.doctorName, username: doctor.username });
  } catch (err) {
    res.status(500).send({ message: "Server error", error: err });
  }
});

// ✅ Add New Patient (No visit initially)
app.post('/patients', async (req, res) => {
  try {
    const count = await Patient.countDocuments();
    const year = new Date().getFullYear();
    const customId = `DOC-${year}-${String(count + 1).padStart(3, '0')}`;

    const { doctorUsername, name, age, gender } = req.body;

    const newPatient = new Patient({
      patientId: customId,
      name,
      age,
      gender,
      doctorUsername,
      visits: []
    });

    await newPatient.save();
    res.send(newPatient);
  } catch (error) {
    res.status(500).send({ message: 'Error saving patient', error });
  }
});

// ✅ Add a Visit to a Patient
app.post('/patients/:id/visit', async (req, res) => {
  const { symptoms, prescriptions } = req.body;

  if (!symptoms || prescriptions.length === 0) {
    return res.status(400).send({ message: "Symptoms and at least one prescription required." });
  }

  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) return res.status(404).send({ message: "Patient not found" });

    patient.visits.push({
      symptoms,
      prescriptions,
      createdAt: new Date()
    });

    await patient.save();
    res.send(patient);
  } catch (error) {
    res.status(500).send({ message: "Error saving visit", error });
  }
});

// ✅ Get All Patients by Doctor
app.get('/patients/doctor/:doctorUsername', async (req, res) => {
  try {
    const patients = await Patient.find({ doctorUsername: req.params.doctorUsername });
    res.send(patients);
  } catch (error) {
    res.status(500).send({ message: "Error fetching patients", error });
  }
});

// ✅ Get Stats for Dashboard: total patients and patients visited today for a doctor
// ✅ Get Stats for Dashboard: total patients and patients visited today for a doctor
app.get('/patients/stats/:username', async (req, res) => {
  try {
    const doctorUsername = req.params.username;

    // ✅ Total number of patients under this doctor
    const totalPatients = await Patient.countDocuments({ doctorUsername });

    // ✅ Today's UTC range (00:00:00 to 23:59:59 UTC)
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // ✅ Count how many patients have at least one visit today
    const patientsToday = await Patient.countDocuments({
      doctorUsername,
      visits: {
        $elemMatch: {
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      }
    });

    res.json({ totalPatients, patientsToday });
  } catch (error) {
    console.error("❌ Error fetching patient stats:", error);
    res.status(500).json({ message: "Failed to fetch stats", error });
  }
});



// ✅ Server Listener
app.listen(5000, () => console.log("🚀 Server running at http://localhost:5000"));
