import { Router } from "express";
import { login, logout, register, verifyEmail } from "../../controllers/auth/auth.controller.js";
import { verifyJWT } from "../../middleware/verifyJWT.js";
const Userrouter = Router();



Userrouter.post("/logout", verifyJWT, logout);

// Userrouter.route("/login").post();
Userrouter.post("/register", register);

Userrouter.post("/login", login);

Userrouter.get("/verify-email", verifyEmail);
// Userrouter.get(
//     "/me",
//     verifyJWT,
//     (req,res)=>{
//         return res.json(req.user);
//     }
// )
// Userrouter.route("/logout").post();
// Userrouter.route("/userdetails").post();
// Userrouter.route("/edituserdetails").post();
// Userrouter.route("/verifyemail").post();
// Userrouter.route("/placeorder").post();
// Userrouter.route("/placeorder").post();
// Userrouter.route("/vieworders").get();
// Userrouter.route("/viewblog").get();
// Userrouter.route("/viewproducts").get();

export default Userrouter