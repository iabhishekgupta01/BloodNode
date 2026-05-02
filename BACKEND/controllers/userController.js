const User = require('../models/User');

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowed = ['name', 'bloodGroup', 'status', 'donationsCount', 'lastDonated'];
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return res.status(400).json({ error: 'longitude and latitude numbers required' });
    }
    const user = await User.findByIdAndUpdate(req.user.id, { location: { type: 'Point', coordinates: [longitude, latitude] } }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getMe, updateProfile, updateLocation };
