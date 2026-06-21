import { Router } from "express";
const Userrouter = Router();

Userrouter.route("/login").post();
Userrouter.route("/register").post();
Userrouter.route("/logout").post();
Userrouter.route("/userdetails").post();
Userrouter.route("/edituserdetails").post();
Userrouter.route("/verifyemail").post();
Userrouter.route("/placeorder").post();
Userrouter.route("/placeorder").post();
Userrouter.route("/vieworders").get();
Userrouter.route("/viewblog").get();
Userrouter.route("/viewproducts").get();

export default Userrouter