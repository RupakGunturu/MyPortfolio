import mongoose from 'mongoose';

const registeredUserSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  otp: { type: String },
  otpExpires: { type: Date }
}, { collection: 'registered_users' });

const RegisteredUser = mongoose.models.RegisteredUser || mongoose.model('RegisteredUser', registeredUserSchema);

export default RegisteredUser; 