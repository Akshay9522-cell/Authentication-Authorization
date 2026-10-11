const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters'),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),

  password: z
    .string()
    .min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required'),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};