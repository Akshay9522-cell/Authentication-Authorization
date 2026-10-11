const bcrypt = require('bcryptjs');
const User = require('../models/User');
const crypto = require('crypto');

const RefreshToken = require('../models/RefreshToken');
const {generateAccessToken,generateRefreshToken} = require('../utils/token');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 6. Return safe user data
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error)

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}


async function login(req, res,next) {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // 4. Don't reveal whether email exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 5. Compare password with stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  const accessToken = generateAccessToken(user);

const refreshToken = generateRefreshToken();

const tokenHash = await bcrypt.hash(
  refreshToken,
  12
);

const expiresAt = new Date(
  Date.now() +
    Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) *
      24 *
      60 *
      60 *
      1000
);

await RefreshToken.create({
  tokenHash,
  user: user._id,
  expiresAt,
});
    // 6. Login successful
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error)

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const refreshTokens =
      await RefreshToken.find({
        expiresAt: { $gt: new Date() },
      });

    let storedToken = null;

    for (const tokenRecord of refreshTokens) {
      const matches = await bcrypt.compare(
        refreshToken,
        tokenRecord.tokenHash
      );

      if (matches) {
        storedToken = tokenRecord;
        break;
      }
    }

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const user = await User.findById(
      storedToken.user
    );

    if (!user) {
      await RefreshToken.deleteOne({
        _id: storedToken._id,
      });

      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    // Rotate refresh token
    await RefreshToken.deleteOne({
      _id: storedToken._id,
    });

    const newAccessToken =
      generateAccessToken(user);

    const newRefreshToken =
      generateRefreshToken();

    const newTokenHash =
      await bcrypt.hash(newRefreshToken, 12);

    const expiresAt = new Date(
      Date.now() +
        Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) *
          24 *
          60 *
          60 *
          1000
    );

    await RefreshToken.create({
      tokenHash: newTokenHash,
      user: user._id,
      expiresAt,
    });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',

      accessToken: newAccessToken,

      refreshToken: newRefreshToken,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
        next(error)
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

async function logout(req, res,next) {
  try {
    await RefreshToken.deleteMany({
      user: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
       next(error)

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}
module.exports = {
  register,
  login,
  refresh,
  logout
};