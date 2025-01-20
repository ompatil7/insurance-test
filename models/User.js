// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Hashed password
  purchasedInsurances: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Insurance' }],
});

module.exports = mongoose.model('User', UserSchema);