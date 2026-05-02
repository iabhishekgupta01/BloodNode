const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, phone, password, bloodGroup, pincode, city, state } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'name, phone and password are required' });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(409).json({ error: 'Phone already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      phone,
      password: hash,
      bloodGroup,
      pincode: pincode ? String(pincode).trim() : undefined,
      city: city ? String(city).trim() : undefined,
      state: state ? String(state).trim() : undefined,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        pincode: user.pincode,
        city: user.city,
        state: user.state,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'phone and password required' });
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, bloodGroup: user.bloodGroup } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login };
