const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const {
  publicVerifiedOrganizations,
  findVerifiedOrganization
} = require('../data/verifiedOrganizations');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, {
    expiresIn: '30d'
  });
};

// @route GET /api/auth/verified-organizations
router.get('/verified-organizations', (req, res) => {
  res.json(publicVerifiedOrganizations);
});

// @route GET /api/auth/me
// @desc Get current authenticated user
router.get('/me', require('../middleware/authMiddleware').protect, async (req, res) => {
  res.json({
    _id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    phone: req.user.phone,
    organization: req.user.organization,
    location: req.user.location
  });
});

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, password, role, phone, organization, organizationId, location } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    let registrationLocation = location;
    let registrationOrganization = organization;

    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (!phonePattern.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    if (role === 'ngo') {
      const verifiedOrganization = findVerifiedOrganization(organizationId);

      if (!verifiedOrganization) {
        return res.status(400).json({ message: 'Please select a verified NGO organization' });
      }

      registrationOrganization = verifiedOrganization.name;
      registrationLocation = verifiedOrganization.location;
    }

    if (!registrationLocation || typeof registrationLocation.lat !== 'number' || typeof registrationLocation.lng !== 'number' || !registrationLocation.address) {
      return res.status(400).json({ message: 'Please provide a valid location' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      organization: role === 'ngo' ? registrationOrganization : undefined,
      organizationId: role === 'ngo' ? organizationId : undefined,
      location: registrationLocation
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route PUT /api/auth/profile
// @desc Update user profile
router.put('/profile', require('../middleware/authMiddleware').protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, currentPassword, newPassword } = req.body;

    if (name) user.name = name;
    
    if (phone) {
      if (!phonePattern.test(phone)) {
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
      }
      user.phone = phone;
    }

    if (currentPassword && newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid current password' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      organization: updatedUser.organization,
      location: updatedUser.location
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating profile' });
  }
});

module.exports = router;
