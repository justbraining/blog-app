const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// ✅ Multer: Use memory storage for MongoDB buffer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 POST: Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ msg: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error registering user', error: err.message });
  }
});

// 📌 POST: Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid password' });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secretKey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      msg: 'Login successful',
      token,
      user: { username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error logging in', error: err.message });
  }
});

// 📌 GET: User profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 PUT: Update profile (store image in MongoDB)
router.put('/profile', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    const updateFields = {
      username: req.body.username,
      email: req.body.email
    };

    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      updateFields.password = hashedPassword;
    }

    if (req.file) {
      updateFields.photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateFields,
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

// 📌 GET: Serve profile photo
router.get('/photo/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.photo || !user.photo.data) {
      return res.status(404).send('No image found');
    }

    res.set('Content-Type', user.photo.contentType);
    res.send(user.photo.data);
  } catch (err) {
    res.status(500).send('Error fetching image');
  }
});

module.exports = router;
