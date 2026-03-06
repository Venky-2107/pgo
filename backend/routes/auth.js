import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import pool from '../config/db.js';

const router = express.Router();

// ========================
// ADMIN AUTH
// ========================

// Admin Register (should be used once to seed the admin account)
router.post(
  '/admin/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('contact').optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, contact } = req.body;
    // ... rest of the logic

    try {
      const exists = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);
      if (exists.rows.length > 0) {
        return res.status(400).json({ message: 'Admin already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await pool.query(
        'INSERT INTO admins (name, email, password, contact) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hashedPassword, contact || null]
      );

      const admin = result.rows[0];
      const token = jwt.sign(
        { id: admin.id, email: admin.email, name: admin.name, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ message: 'Admin registered successfully', token, user: admin });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Admin Login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================
// OWNER AUTH
// ========================

// Owner Register
router.post(
  '/owner/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('contact').trim().notEmpty().withMessage('Contact is required').escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, contact } = req.body;

    try {
      const exists = await pool.query('SELECT id FROM owners WHERE email = $1', [email]);
      if (exists.rows.length > 0) {
        return res.status(400).json({ message: 'Owner already exists with this email.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await pool.query(
        'INSERT INTO owners (name, email, password, contact) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, is_approved',
        [name, email, hashedPassword, contact]
      );

      const owner = result.rows[0];
      const token = jwt.sign(
        { id: owner.id, email: owner.email, name: owner.name, role: 'owner' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Registration successful. Awaiting admin approval.',
        token,
        user: owner,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Owner Login
router.post('/owner/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM owners WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const owner = result.rows[0];
    const validPassword = await bcrypt.compare(password, owner.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: owner.id, email: owner.email, name: owner.name, role: 'owner' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: 'owner',
        is_approved: owner.is_approved,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================
// VERIFY TOKEN (any role)
// ========================
router.get('/verify', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data from DB based on role and ID
    let userResult;
    if (decoded.role === 'admin') {
      userResult = await pool.query('SELECT id, name, email, role FROM admins WHERE id = $1', [decoded.id]);
    } else if (decoded.role === 'owner') {
      userResult = await pool.query('SELECT id, name, email, role, is_approved FROM owners WHERE id = $1', [decoded.id]);
    } else if (decoded.role === 'tenant') {
      userResult = await pool.query('SELECT id, name, email, role, is_active FROM tenants WHERE id = $1', [decoded.id]);
    }

    if (!userResult || userResult.rows.length === 0) {
      return res.status(401).json({ valid: false, message: 'User not found' });
    }

    res.json({ valid: true, user: userResult.rows[0] });
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ valid: false });
  }
});


export default router;
