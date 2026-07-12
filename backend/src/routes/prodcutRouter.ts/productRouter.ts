// import { Router } from "express";
// import { verifyJWT } from "../../middleware/verifyJWT.js";
// import { verifyAdmin } from "../../middleware/verifyAdmin.js";
// import { uploadProductImages } from "../../middleware/multer.js";
// import { CreateProduct } from "../../controllers/product/product.controller.js";
// // import { CreateProduct } from "../../controllers/product/product.controller.js";

// const router = Router();

// router.post(
//   "/products",
//   verifyJWT,
//   verifyAdmin,
//   uploadProductImages.array("images", 10),
//   CreateProduct
// );

// export default router;