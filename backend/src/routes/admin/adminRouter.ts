import { Router } from "express";
import { verifyJWT } from "../../middleware/verifyJWT.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.js";
import { cat } from "../../controllers/auth/auth.controller.js";

const AdminRouter = Router();

AdminRouter.post(
  "/category",
  verifyJWT,//verify authentiated or not
  verifyAdmin,//verify is admin or a noraml user
  cat
);

export default AdminRouter;