const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  username: String,
  password: String,
  doctorName: String
});
module.exports = mongoose.model('Doctor', doctorSchema);
