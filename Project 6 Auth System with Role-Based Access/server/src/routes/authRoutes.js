const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const {
  register, login, refresh, logout, me, googleRedirect, googleCallback
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);

router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

module.exports = router;
