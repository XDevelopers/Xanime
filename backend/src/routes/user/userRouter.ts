import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from "../../controllers/auth/auth.controller.js";
import { verifyJWT } from "../../middleware/verifyJWT.js";
import { resendVerificationLimiter } from "../../middleware/rateLimiter.js";
const Userrouter = Router();

Userrouter.post("/logout", verifyJWT, logout);
Userrouter.post("/refresh-token", refreshAccessToken); //refresh token given if user access token expire

Userrouter.post("/register", register); //user register with eamil

Userrouter.post("/login", login); //login user

Userrouter.get("/verify-email", verifyEmail); //verify email
Userrouter.post(
  "/resend-verification",
  resendVerificationLimiter,
  resendVerificationEmail,
); //adding a rate limit rsend email 10min for 3 email

Userrouter.get("/me", verifyJWT, getCurrentUser);

Userrouter.post("/forgot-password", forgotPassword); //forget password
Userrouter.post("/reset-password", resetPassword); //reset

Userrouter.post("/change-password", verifyJWT, changePassword);
// Userrouter.route("/logout").post();
// Userrouter.route("/userdetails").post();
// Userrouter.route("/edituserdetails").post();
// Userrouter.route("/verifyemail").post();
// Userrouter.route("/placeorder").post();
// Userrouter.route("/placeorder").post();
// Userrouter.route("/vieworders").get();
// Userrouter.route("/viewblog").get();
// Userrouter.route("/viewproducts").get();

export default Userrouter;
