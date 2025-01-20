// models/Insurance.js
const mongoose = require('mongoose');

const InsuranceSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  rainfallThreshold: Number,
  termsAndConditions: String,
  purchasedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Insurance', InsuranceSchema);