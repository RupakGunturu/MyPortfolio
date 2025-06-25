import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// @desc    Register a new user
export const registerUser = async (req, res, User) => {
  console.log('REGISTER REQUEST BODY:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, username, email, password } = req.body;
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ msg: 'Username is required and cannot be empty.' });
  }
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ msg: 'Email is required and cannot be empty.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ msg: 'Password is required and must be at least 6 characters.' });
  }

  try {
    // Check if user with that email OR username already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      if (user.email === email) {
        return res.status(400).json({ msg: 'A user with that email already exists' });
      }
      if (user.username === username) {
        return res.status(400).json({ msg: 'That username is already taken' });
      }
    }

    user = new User({
      name,
      username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 }, // 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.username) {
        return res.status(400).json({ msg: 'Username already exists.' });
      }
      if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ msg: 'Email already exists.' });
      }
      return res.status(400).json({ msg: 'Duplicate field error.' });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Login user
export const loginUser = async (req, res, User) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 }, // 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            // add any other fields you want to expose
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}; 