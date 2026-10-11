const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};