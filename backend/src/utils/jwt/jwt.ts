import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;
const VERIFY_EMAIL_SECRET = process.env.JWT_VERIFY_EMAIL_SECRET as string;

export interface JwtPayload {
  id: number;
  email: string;
}

/* ===========================
   ACCESS TOKEN
=========================== */

export const generateAccessToken = (
  id: number,
  email: string
): string => {
  return jwt.sign(
    { id, email },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const verifyAccessToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    ACCESS_TOKEN_SECRET
  ) as JwtPayload;
};

/* ===========================
   REFRESH TOKEN
=========================== */

export const generateRefreshToken = (
  id: number,
  email: string
): string => {
  return jwt.sign(
    { id, email },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyRefreshToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    REFRESH_TOKEN_SECRET
  ) as JwtPayload;
};

/* ===========================
   EMAIL VERIFICATION TOKEN
=========================== */

export const generateVerificationToken = (
  id: number,
  email: string
): string => {
  return jwt.sign(
    { id, email },
    VERIFY_EMAIL_SECRET,
    {
      expiresIn: "30m",
    }
  );
};

export const verifyVerificationToken = (
  token: string
): JwtPayload => {
  return jwt.verify(
    token,
    VERIFY_EMAIL_SECRET
  ) as JwtPayload;
};