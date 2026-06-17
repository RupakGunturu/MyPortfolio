import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import RegisteredUser from '../models/registeredUser.js';
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
      // Check for existing username (case-insensitive)
      let user = await RegisteredUser.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
      if (user) {
        return res.status(400).json({ msg: 'Username already exists. Please use a different username. 💡 You can try adding numbers or symbols to make it unique!' });
      }
      // Check for existing email (case-insensitive)
      let emailUser = await RegisteredUser.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
      if (emailUser) {
        return res.status(400).json({ msg: 'Email already exists. Please use a different email.' });
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

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await transporter.sendMail({
      from: `Portfolio App <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP code for password reset is: ${otp}\n\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset</h2>
          <p>Your OTP code for password reset is:</p>
          <h1 style="color: #059669; font-size: 32px; letter-spacing: 4px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">${otp}</h1>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });

    console.log(`Password reset OTP sent to ${email}: ${otp}`);
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    // Don't save OTP if email fails
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// --- OTP for Password Reset (alias for forgot password) ---
router.post('/auth/send-forgot-otp', async (req, res) => {
  const { email } = req.body;
  const user = await RegisteredUser.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await transporter.sendMail({
      from: `Portfolio App <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP code for password reset is: ${otp}\n\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset</h2>
          <p>Your OTP code for password reset is:</p>
          <h1 style="color: #059669; font-size: 32px; letter-spacing: 4px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">${otp}</h1>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });

    console.log(`Forgot password OTP sent to ${email}: ${otp}`);
    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error sending forgot password OTP:', error);
    // Don't save OTP if email fails
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
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

  // Check if new password is the same as the old password
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    return res.status(400).json({ message: 'You entered the same password as before.' });
  }

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
  try {
    console.log('=== REGISTER SEND OTP REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Environment check:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.FROM_EMAIL
    });
    
    const { email } = req.body;
    
    // Check if email is provided
    if (!email) {
      console.log('Error: Email not provided');
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log('Processing OTP request for email:', email);

    // Check if user already exists
    try {
      const existing = await RegisteredUser.findOne({ email });
      if (existing) {
        console.log('Email already registered:', email);
        return res.status(400).json({ message: 'Email already registered' });
      }
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError);
      return res.status(500).json({ message: 'Database error. Please try again.' });
    }

    // Check if Resend API key is set up
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY missing. Please set RESEND_API_KEY environment variable.');
      return res.status(500).json({ message: 'Email service not configured. Please contact administrator.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    global.registrationOtps = global.registrationOtps || new Map();
    global.registrationOtps.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

    console.log('Attempting to send email via Resend...');
    console.log('Sender email (FROM_EMAIL):', process.env.FROM_EMAIL);
    console.log('Recipient email:', email);
    console.log('Generated OTP:', otp);
    
    // Send email
    const emailResult = await transporter.sendMail({
      from: `Portfolio App <${process.env.FROM_EMAIL}>`,
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

    console.log(`✅ OTP email successfully sent to ${email}`);
    console.log(`📧 OTP Code: ${otp} (for testing purposes - check your email inbox)`);
    
    res.json({ 
      message: 'OTP sent to email',
      note: 'Please check your inbox and spam folder. Email delivery may take a few seconds.'
    });
  } catch (error) {
    console.error('=== ERROR IN REGISTER SEND OTP ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Failed to send OTP. Please try again.';
    if (error.message) {
      errorMessage = `${error.message}`;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    // Send welcome email
    try {
      await transporter.sendMail({
        from: `Portfolio App <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: 'Welcome to Portfolio App!',
        text: `Welcome ${fullname}! Thank you for registering with Portfolio App. We're excited to have you on board.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to Portfolio App, ${fullname}!</h2>
            <p>Thank you for registering with us. We're excited to have you on board!</p>
            <p>You can now log in and start building your portfolio.</p>
            <p>If you have any questions, feel free to reach out.</p>
            <p>Best regards,<br>The Portfolio App Team</p>
          </div>
        `
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail registration if email fails
    }

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

// Debug route to confirm backend logging
router.all('/test-log', (req, res) => {
  console.log('Test route HIT', req.method, req.body);
  res.json({ message: 'Test route hit' });
});

// Debug route to check environment variables (remove in production)
router.get('/test-env', (req, res) => {
  const config = {
    hasResendKey: !!process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'NOT SET',
    recommendation: 'Configuration looks correct!'
  };
  res.json(config);
});

// Test email sending endpoint
router.post('/test-email', async (req, res) => {
  try {
    console.log('=== TEST EMAIL REQUEST ===');
    console.log('Request body:', req.body);
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required',
        example: 'Send POST request with body: { "email": "your-email@gmail.com" }'
      });
    }

    console.log('Testing email to:', email);
    console.log('Environment check:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.FROM_EMAIL
    });
    
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ 
        message: 'Resend API key not configured',
        hasResendKey: false,
        fix: 'Add RESEND_API_KEY to your .env file'
      });
    }

    console.log('Attempting to send test email via Resend...');
    console.log('From:', process.env.FROM_EMAIL);
    console.log('To:', email);

    await transporter.sendMail({
      from: `Portfolio App <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: '✅ Test Email from Portfolio App - Resend Working!',
      text: `This is a test email from your Portfolio App.\n\nIf you receive this email, Resend is configured correctly and working!\n\nTest Details:\n- Sent from: ${process.env.FROM_EMAIL}\n- Sent to: ${email}\n- Time: ${new Date().toLocaleString()}\n\nYour OTP emails should now work properly.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669;">✅ Test Email Successful!</h1>
          <p>This is a test email from your Portfolio App.</p>
          <p><strong>If you receive this email, Resend is configured correctly and working!</strong></p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Test Details:</h3>
            <p><strong>Sent from:</strong> ${process.env.FROM_EMAIL}</p>
            <p><strong>Sent to:</strong> ${email}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="color: #059669; font-weight: bold;">🎉 Resend is now powering your emails!</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully via Resend!');
    
    res.json({ 
      success: true,
      message: 'Test email sent successfully!',
      email: email
    });
  } catch (error) {
    console.error('❌ Test email error occurred:', error.message);

    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to send test email'
    });
  }
});

export default router;