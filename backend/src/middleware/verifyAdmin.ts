import { Response, NextFunction } from "express";
import { AuthRequest } from "./verifyJWT.js";
import { Role } from "../enum.js";

export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (req.user.role !== Role.Admin) {
      return res.status(403).json({
        error: "Access denied. Admin only.",
      });
    }

    next();
  } catch (error) {
    console.error("Verify Admin Error:", error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};