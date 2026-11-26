const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { deleteCloudinaryImage } = require('../middleware/upload');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc  Register
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const allowedRole = ['customer','agent'].includes(role) ? role : 'customer';
    const user  = await User.create({ firstName, lastName, email, password, role: allowedRole });
    const token = generateToken(user._id);
    user.password = undefined;
    res.status(201).json({ success: true, message: 'Account created!', token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Login
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    user.password = undefined;
    res.json({ success: true, message: 'Login successful!', token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('savedProperties','title price priceType thumbnail images city country address bedrooms bathrooms area areaUnit status propertyType');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update profile (including avatar via Cloudinary)
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, address, city, country } = req.body;
    const update = { firstName, lastName, phone, bio, address, city, country };

    if (req.file) {
      // Delete old avatar from Cloudinary if it exists
      const existing = await User.findById(req.user.id).select('avatar');
      if (existing?.avatar) await deleteCloudinaryImage(existing.avatar);
      // req.file.path is the Cloudinary secure URL
      update.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Change password
// @route PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
