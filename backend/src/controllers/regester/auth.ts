import { sendVerificationEmail } from '../../services/emailService.js';
import { generateToken } from '../../../src/utils/jwt/jwt.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import  pool  from '../../db/db.js';          // your PostgreSQL connection

export const register = async (req: Request, res: Response, next:any) => {
  try {
    const { email, password, name } = req.body;

    // 1. Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert user into DB
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, is_verified)
       VALUES ($1, $2, $3, false)
       RETURNING id, email, name`,
      [email, hashedPassword, name]
    );
    const newUser = result.rows[0];

    // 5. Generate JWT
    const token = generateToken(newUser.id, newUser.email);

    // 6. Send verification email (don't block response)
    //    We use .catch to log errors but not fail the registration
    sendVerificationEmail(email, token).catch(err =>
      console.error('Email sending failed:', err)
    );

    // 7. Return success (with token)
    return res.status(201).json({
      message: 'User registered. Please verify your email.',
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token, // optional: include token for auto-login
    });

  } catch (error) {
    console.error('Registration error:', error);
    // Avoid double‑send: if headers already sent, delegate to Express error handler
    if (res.headersSent) {
      return next(error); // assuming `next` is in scope (passed as param)
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};