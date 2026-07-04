import { Request, Response, NextFunction } from "express";
import pool from "../db/db.js";
import { verifyAccessToken } from "../utils/jwt/jwt.js";

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

console.log("Received Token:", token);

const decoded = verifyAccessToken(token);

console.log("Decoded:", decoded);

    const result = await pool.query(
      `
      SELECT
      id,
      first_name,
      last_name,
      email,
      role,
      status,
      email_verified
      FROM users
      WHERE id=$1
      `,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    req.user = result.rows[0];

    next();
  } catch (error) {
     console.log(error)
    return res.status(401).json({
      error: "Invalid or Expired Token",
     
    });
  }
};