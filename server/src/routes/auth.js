import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fintrack_super_secret_jwt_key_2026_dev';

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, currency } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        currency: currency || '₹',
        theme: 'dark',
      },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        theme: true,
        accountType: true,
        monthlyIncomeGoal: true,
        createdAt: true,
      },
    });

    // Create welcoming notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to FinTrack! 🎉',
        message: 'Your personal finance workspace is ready. Start by adding your transactions or setting a monthly budget.',
        type: 'success',
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
      theme: user.theme,
      accountType: user.accountType,
      monthlyIncomeGoal: user.monthlyIncomeGoal,
      createdAt: user.createdAt,
    };

    res.json({ user: safeUser, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

// Get current authenticated user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        theme: true,
        accountType: true,
        monthlyIncomeGoal: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update Profile & Preferences
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, currency, theme, accountType, monthlyIncomeGoal } = req.body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (currency !== undefined) data.currency = currency;
    if (theme !== undefined) data.theme = theme;
    if (accountType !== undefined) data.accountType = accountType;
    if (monthlyIncomeGoal !== undefined) data.monthlyIncomeGoal = parseFloat(monthlyIncomeGoal) || 0;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        theme: true,
        accountType: true,
        monthlyIncomeGoal: true,
        createdAt: true,
      },
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Password Recovery / Reset (public by email)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Please provide both email and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Notify user in-app
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Password Updated 🔒',
        message: 'Your account password was successfully reset.',
        type: 'info',
      },
    });

    res.json({ success: true, message: 'Password reset successfully! You can now sign in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Change Password (authenticated)
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide both current and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword },
    });

    await prisma.notification.create({
      data: {
        userId: req.userId,
        title: 'Password Changed 🔒',
        message: 'Your account password was successfully updated.',
        type: 'info',
      },
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

export default router;
