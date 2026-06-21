import { Router } from "express";
const Adminrouter = Router();

Adminrouter.route("/login").post();
Adminrouter.route("/regester").post();
Adminrouter.route("/logout").post();
Adminrouter.route("/addblog").post();
Adminrouter.route("/editblog").post();
Adminrouter.route("/addproduct").post();
Adminrouter.route("/editproduct").post();
Adminrouter.route("/deletuser").post();


export default Adminrouter 