const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true }, // Remove unique: true
    otp: { type: String, required: true },
    otpExpiration: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    purpose: { type: String, required: true, enum: ['registration', 'reset'] }
}, { timestamps: true });
const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;