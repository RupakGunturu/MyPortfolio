import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import RegisteredUser from '../models/registeredUser.js';

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

export default router; 