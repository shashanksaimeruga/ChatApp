const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Otp = require('../models/otp');
const { sendOtpEmail } = require('../scripts/email');
const rateLimit = require("express-rate-limit");
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
router.use(globalLimiter);

// Specific route rate limiting
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many accounts created from this IP, please try again after an hour"
});

async function cleanupOldOtps() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Otp.deleteMany({ otpExpiration: { $lt: oneDayAgo } });
}

// Call this function periodically, e.g., once a day
// Helper function to generate and save OTP
async function generateAndSaveOtp(email, purpose) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

    const newOtp = new Otp({
        email,
        otp,
        otpExpiration,
        isVerified: false,
        purpose
    });

    await newOtp.save();

    return otp;
}
// Request OTP for Registration
router.post('/request-registration-otp', createAccountLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const otp = await generateAndSaveOtp(email, 'registration');
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error sending OTP' });
    }
});
// Request OTP for Password Reset
router.post('/request-reset-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: 'No account found with this email' });
        }

        const otp = await generateAndSaveOtp(email, 'reset');
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error sending OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, purpose } = req.body;

        const otpRecord = await Otp.findOne({ 
            email, 
            otp, 
            purpose,
            otpExpiration: { $gt: new Date() } 
        }).sort({ createdAt: -1 }); // Get the most recent OTP

        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        otpRecord.isVerified = true;
        await otpRecord.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error verifying OTP' });
    }
});

// Signup
router.post('/signup', createAccountLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const existingOtp = await Otp.findOne({ email, isVerified: true, purpose: 'registration' });
        if (!existingOtp) {
            return res.status(400).json({ error: 'OTP not verified or expired' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            isVerified: true
        });

        await newUser.save();
        await Otp.deleteOne({ email, purpose: 'registration' });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      const user = await User.findOne({ $or: [{ username }, { email: username }] });
      if (!user || !user.isVerified) {
        return res.status(404).json({ error: 'User not found or not verified' });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Authentication failed' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '24h' });
  
      res.status(200).cookie('token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict' 
      }).json({
        username: user.username,
        _id: user._id, 
        hasSeenProfilePrompt: user.hasSeenProfilePrompt
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed, internal server error' });
    }
  });
  
  const authenticateUser = require('../middleware/auth');
  // In users.js
router.get('/', authenticateUser, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('name');
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/all', authenticateUser, async (req, res) => {
  try {
    console.log('Fetching all users for user:', req.user._id);
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username profilePicture');
    console.log('Found users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/contacts', authenticateUser, async (req, res) => {
  try {
    const contacts = await User.find({ _id: { $ne: req.user._id } })
      .select('username profilePicture');
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(400).json({ error: error.message });
  }
});
  
// Apply the middleware to the route
router.post('/complete-profile', authenticateUser, upload.single('profilePicture'), async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    const profilePicture = req.file ? req.file.filename : null;

    const userId = req.user.id;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      user.fullName = fullName;
      user.bio = bio;
      if (profilePicture) {
        user.profilePicture = profilePicture;
      }
      user.profileCompleted = true;
  
      await user.save();
  
      res.status(200).json({ message: 'Profile completed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error completing profile' });
    }
  });

  // routes/users.js
  router.post('/skip-profile-prompt', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id; // Get this from your authentication middleware
      await User.findByIdAndUpdate(userId, { hasSeenProfilePrompt: true });
      res.status(200).json({ message: 'Profile prompt skipped' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error skipping profile prompt' });
    }
  });
  // In your users router file
router.get('/', authenticateUser, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('name');
    res.json(users);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
router.get('/:username', authenticateUser, async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const otpRecord = await Otp.findOne({ email, otp, isVerified: true, purpose: 'reset' });
        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        await user.save();

        await Otp.deleteOne({ email, purpose: 'reset' });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error resetting password' });
    }
});

module.exports = router;