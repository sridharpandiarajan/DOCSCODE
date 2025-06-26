const express = require('express');
const bcrypt = require('bcrypt');
const Doctor = require('../models/Doctor');
const router = express.Router();

// Register new doctor
router.post('/register', async (req, res) => {
  const { username, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = new Doctor({ username, password: hashedPassword, name });
    await doctor.save();
    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const doctor = await Doctor.findOne({ username });
  if (!doctor) return res.status(401).json({ error: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, doctor.password);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ message: 'Login successful', doctorName: doctor.name });
});

module.exports = router;
