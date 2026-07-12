import { Router } from "express";
import { verifyJWT } from "../../middleware/verifyJWT.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.js";
import { cat } from "../../controllers/auth/auth.controller.js";
import { createCategory ,deleteCategory,getAllCategories, getCategoryById, UpdateCategory} from "../../controllers/category/category.controller.js";
import { createBrand, deleteBrand, getAllbrand, getBrandById, UpdateBrand } from "../../controllers/category/brand.controller.js";
import { createAnime_series, deleteAnime_series, getAllAnime_series, getAnime_seriesById, UpdateAnime_series } from "../../controllers/category/anime_series.controller.js";
import { createUnit, deleteUnit, getAllUnits, getUnitById, updateUnit } from "../../controllers/category/unit.controller.js";
import multer from "multer";
import { uploadProductImages } from "../../middleware/multer.js";
import { CreateProduct } from "../../controllers/product/product.controller.js";

const AdminRouter = Router();

AdminRouter.post(
  "/categories",
  verifyJWT,//verify authentiated or not
  verifyAdmin,//verify is admin or a noraml user
  createCategory
);

AdminRouter.get(
  "/categories",
  verifyJWT,//verify authentiated or not
  verifyAdmin,//verify is admin or a noraml user
  getAllCategories
);

AdminRouter.get(
  "/categories/:id",
  verifyJWT,
  verifyAdmin,
  getCategoryById
)

AdminRouter.patch(
  "/categories/:id",
  verifyJWT,
  verifyAdmin,
  UpdateCategory
)

AdminRouter.delete(
  "/categories/:id",
  verifyJWT,
  verifyAdmin,
  deleteCategory
);



//Brand

AdminRouter.post(
  "/brands",
  verifyJWT,//verify authentiated or not
  verifyAdmin,//verify is admin or a noraml user
  createBrand
);

AdminRouter.get(
  "/brands",
  verifyJWT,//verify authentiated or not
  verifyAdmin,//verify is admin or a noraml user
  getAllbrand
);

AdminRouter.get(
  "/brands/:id",
  verifyJWT,
  verifyAdmin,
  getBrandById
)

AdminRouter.patch(
  "/brands/:id",
  verifyJWT,
  verifyAdmin,
  UpdateBrand
)

AdminRouter.delete(
  "/brands/:id",
  verifyJWT,
  verifyAdmin,
  deleteBrand
);



//Anime Series
AdminRouter.post(
  "/anime_series",
  verifyJWT,//verify authentiated or not
  verifyAdmin,//verify is admin or a noraml user
  createAnime_series
);

AdminRouter.get(
  "/anime_series",
  verifyJWT,//verify authentiated or not
  verifyAdmin,//verify is admin or a noraml user
  getAllAnime_series
);

AdminRouter.get(
  "/anime_series/:id",
  verifyJWT,
  verifyAdmin,
  getAnime_seriesById
)

AdminRouter.patch(
  "/anime_series/:id",
  verifyJWT,
  verifyAdmin,
  UpdateAnime_series
)

AdminRouter.delete(
  "/anime_series/:id",
  verifyJWT,
  verifyAdmin,
  deleteAnime_series
);




//units

AdminRouter.post(
  "/units",
  verifyJWT,//verify authentiated or not
  verifyAdmin,//verify is admin or a noraml user
  createUnit
);

AdminRouter.get(
  "/units",
  verifyJWT,//verify authentiated or not
  verifyAdmin,//verify is admin or a noraml user
  getAllUnits
);

AdminRouter.get(
  "/units/:id",
  verifyJWT,
  verifyAdmin,
  getUnitById
)

AdminRouter.patch(
  "/units/:id",
  verifyJWT,
  verifyAdmin,
  updateUnit
)

AdminRouter.delete(
  "/units/:id",
  verifyJWT,
  verifyAdmin,
  deleteUnit
);


//Products

AdminRouter.post(
  "/products",
  verifyJWT,
  verifyAdmin,
  uploadProductImages.array("images", 10),
  CreateProduct
);

export default AdminRouter;