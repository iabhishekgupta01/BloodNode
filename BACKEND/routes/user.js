const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMe, updateProfile, updateLocation } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateProfile);
router.put('/location', auth, updateLocation);

module.exports = router;
