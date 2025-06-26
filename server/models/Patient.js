const mongoose = require('mongoose');
const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  name: String,
  age: Number,
  gender: String,
  doctorUsername: String,
  visits: [
    {
      symptoms: String,
      prescriptions: [
        {
          tablet: String,
          morning: Boolean,
          evening: Boolean,
          night: Boolean,
          duration: String,
          dosage: String
        }
      ],
      createdAt: { type: Date, default: Date.now }
    }
  ]
});
module.exports = mongoose.model('Patient', patientSchema);