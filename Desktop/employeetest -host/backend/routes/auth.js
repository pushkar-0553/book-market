import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// In-memory admin credentials (can be changed at runtime)
let adminCredentials = {
  email: 'admin@testing.com',
  password: 'admin123',
};

// ---------- POST /api/login ----------
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (email !== adminCredentials.email || password !== adminCredentials.password) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: { email, role: 'admin', name: 'Admin' },
  });
});

// ---------- PUT /api/change-password ----------
router.put('/change-password', verifyToken, (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (currentPassword !== adminCredentials.password) {
    return res.status(401).json({ message: 'Current password is incorrect.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New password and confirmation do not match.' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from current password.' });
  }

  adminCredentials.password = newPassword;
  res.json({ message: 'Password changed successfully.' });
});

export default router;
