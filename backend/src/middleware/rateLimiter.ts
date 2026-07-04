import rateLimit from "express-rate-limit";

export const resendVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes

  max: 3,

  message: {
    error:
      "Too many verification email requests. Please try again after 10 minutes.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});