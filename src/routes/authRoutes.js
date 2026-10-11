const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { authRateLimiter } = require('../middleware/rateLimiters');

const {registerSchema,loginSchema, refreshSchema,} = require('../validation/authValidation');
const {register,login,refresh,logout} = require('../controllers/authController');


const router = express.Router();

router.post('/register',authRateLimiter,validate(registerSchema),register);
router.post('/login',authRateLimiter,validate(loginSchema),login)
router.post('/refresh',validate(refreshSchema), refresh);
router.post('/logout',authMiddleware,logout)

router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated successfully',
    user: req.user,
  });
});

router.get(
  '/admin-test',
  authMiddleware,
  requireRole('ADMIN'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome Admin',
      user: req.user,
    });
  }
);


module.exports = router;