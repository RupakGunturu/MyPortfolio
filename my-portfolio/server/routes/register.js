import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import RegisteredUser from '../models/registeredUser.js';
import nodemailer from 'nodemailer';
import transporter from '../utils/mailer.js';

const router = express.Router();

// Old User model (users collection) with unique model name
const oldUserSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String },
  email: { type: String },
  password: { type: String }
}, { collection: 'users' });
const OldUser = mongoose.models.OldUser || mongoose.model('OldUser', oldUserSchema);

// @route   POST /api/register
// @desc    Register a new user
router.post(
  '/register',
  [
    check('fullname', 'Full name is required').not().isEmpty(),
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    console.log('REGISTER REQUEST BODY:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { fullname, username, email, password } = req.body;
    try {
      let user = await RegisteredUser.findOne({ $or: [{ username }, { email }] });
      if (user) {
        return res.status(400).json({ msg: 'Username or email already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new RegisteredUser({ fullname, username, email, password: hashedPassword });
      await user.save();
      res.status(201).json({ msg: 'Registration successful' });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ msg: 'Username or email already exists' });
      }
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  }
);

// @route   GET /api/register/count
// @desc    Get the count of registered users
router.get('/register/count', async (req, res) => {
  try {
    const count = await RegisteredUser.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch user count', error: err.message });
  }
});

// Login route (ONLY registered_users)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('LOGIN ATTEMPT:', email, password);
  const user = await RegisteredUser.findOne({ email });
  console.log('USER FOUND:', user);
  if (!user) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('PASSWORD MATCH:', isMatch);
  if (!isMatch) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }
  res.json({
    msg: 'Login successful',
    user: {
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email
    }
  });
});

// --- OTP for Password Reset ---
router.post('/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  const user = await RegisteredUser.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  await transporter.sendMail({
    from: 'Portfolio App <noreply@yourapp.com>',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  });

  res.json({ message: 'OTP sent to email' });
});

// --- OTP for Password Reset (alias for forgot password) ---
router.post('/auth/send-forgot-otp', async (req, res) => {
  const { email } = req.body;
  const user = await RegisteredUser.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  await transporter.sendMail({
    from: 'Portfolio App <noreply@yourapp.com>',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  });

  res.json({ message: 'OTP sent to email' });
});

router.post('/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const user = await RegisteredUser.findOne({ email, otp, otpExpires: { $gt: new Date() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });
  res.json({ message: 'OTP verified' });
});

// --- Password Reset after OTP Verification ---
router.post('/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await RegisteredUser.findOne({ email, otp, otpExpires: { $gt: new Date() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

// --- Registration OTP ---
router.post('/auth/register-send-otp', async (req, res) => {
  const { email } = req.body;
  
  // Check if email is provided
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Check if user already exists
  const existing = await RegisteredUser.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  // Check if email configuration is set up
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('Email configuration missing. Please set SMTP_USER and SMTP_PASS environment variables.');
    return res.status(500).json({ message: 'Email service not configured. Please contact administrator.' });
  }

  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    global.registrationOtps = global.registrationOtps || new Map();
    global.registrationOtps.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

    // Send email
    await transporter.sendMail({
      from: `Portfolio App <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Registration OTP',
      text: `Your OTP code for registration is: ${otp}\n\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Portfolio App Registration</h2>
          <p>Your OTP code for registration is:</p>
          <h1 style="color: #059669; font-size: 32px; letter-spacing: 4px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">${otp}</h1>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });

    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

router.post('/auth/register-verify-otp', async (req, res) => {
  const { fullname, username, email, password, otp } = req.body;
  
  // Validate required fields
  if (!fullname || !username || !email || !password || !otp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  global.registrationOtps = global.registrationOtps || new Map();
  const record = global.registrationOtps.get(email);

  if (!record || record.otp !== otp || record.expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    // Remove OTP after use
    global.registrationOtps.delete(email);

    // Check if user already exists (double-check)
    const existing = await RegisteredUser.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new RegisteredUser({ fullname, username, email, password: hashedPassword });
    await user.save();

    console.log(`User registered successfully: ${email}`);
    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

export default router; 