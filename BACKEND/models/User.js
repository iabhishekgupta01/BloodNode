const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  pincode: { type: String },
  city: { type: String },
  state: { type: String },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  role: { type: String, enum: ['donor', 'hospital', 'admin'], default: 'donor' },
  status: { type: String, enum: ['available', 'cooldown', 'busy'], default: 'available' },
  lastDonated: { type: Date },
  donationsCount: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
