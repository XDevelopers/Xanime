import { Request, Response, NextFunction } from "express";
import { slugify } from "../../utils/slug/slug.js";

import pool from "../../db/db.js";
import { MasterStatus } from "../../enum.js";


/**
 * @desc =Create Category
 * @route POST /api/v1/admin/categories
 * @access Admin
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, display_order } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: "Category name is required.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const slug = slugify(normalizedName);
    const isDuplicate = await pool.query(
      `
      SELECT
    id
FROM categories
WHERE
    LOWER(name) = LOWER($1)
    OR slug = $2;;
        `,
      [normalizedName, slug],
    );

    if (isDuplicate.rows.length !== 0) {
      return res.status(409).json({
        error: "Category already exists.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO categories
    (
    name,
    slug,
    description,
    display_order,
    status
    )
    VALUES
    (
    $1,
    $2,
    $3,
    $4,
    $5
    )
    RETURNING *;
        `,
      [
        normalizedName,
        slug,
        description?.trim() || null,
        display_order ?? 0,
        MasterStatus.Active,
      ],
    );

    return res.status(201).json({
      message: "Category created successfully.",

      category: result.rows[0],
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Get All Category
 * @route GET /api/v1/admin/categories
 * @access Admin
 */
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await pool.query(
      `
SELECT
id,
name,
slug,
description,
display_order,
status,
created_at,
updated_at
FROM categories
ORDER BY
display_order ASC,
created_at DESC
`,
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "Categories fetched successfully.",

        count: 0,

        categories: [],
      });
    }

    return res.status(200).json({
      message: "Categories fetched successfully.",

      count: result.rows.length,

      categories: result.rows,
    });
  } catch (error) {
    console.error(" Category Fetch Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Get Category By ID
 * @route GET /api/v1/admin/categories/:id
 * @access Admin
 */
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Category ID.",
      });
    }

    const result = await pool.query(
      `
    SELECT
    id,
    name,
    slug,
    description,
    display_order,
    status,
    created_at,
    updated_at
    FROM categories
    WHERE id=$1
    `,
      [Number(id)],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found.",
      });
    }

    return res.status(200).json({
      message: "Category fetched successfully.",

      category: result.rows[0],
    });
  } catch (error) {
    console.error("Get Category By ID Error:", error);
    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Update Category
 * @route PATCH /api/v1/admin/categories/:id
 * @access Admin
 */
export const UpdateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, description, display_order, status } = req.body;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Category ID.",
      });
    }
    if (!name?.trim()) {
      return res.status(400).json({
        error: "Category name is required",
      });
    }
    const isCategoryExists = await pool.query(
      `
      
      SELECT id
  FROM categories
  WHERE id = $1;`,
      [Number(id)],
    );

    if (isCategoryExists.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const slug = slugify(normalizedName);

    const isDuplicate = await pool.query(
      `
          
          SELECT id
  FROM categories
  WHERE
  (
  LOWER(name)=LOWER($1)
  OR slug=$2
  )
  AND id <> $3;`,
      [normalizedName, slug, Number(id)],
    );

    if (isDuplicate.rows.length !== 0) {
      return res.status(409).json({
        error: "Category with this name already exists",
      });
    }
    const result = await pool.query(
      `
      UPDATE categories
  SET
  name = $1,
  slug = $2,
  description = $3,
  display_order = $4,
  status = $5,
  updated_at = CURRENT_TIMESTAMP
  WHERE id = $6
  RETURNING *;
      `,
      [
        normalizedName,
        slug,
        description?.trim() || null,
        display_order ?? 0,
        status ?? MasterStatus.Active,
        Number(id),
      ],
    );
    return res.status(200).json({
      message: "Category updated successfully.",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    if (res.headersSent) {
      return next(error);
    }
    return res.status(500).json({
      error: "Internal Srver Error",
    });
  }
};

/**
 * @desc Delete (Soft Delete) Category
 * @route DELETE /api/v1/admin/categories/:id
 * @access Admin
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Category ID.",
      });
    }

    // Check Category Exists
    const existingCategory = await pool.query(
      `
      SELECT
        id,
        status
      FROM categories
      WHERE id = $1
      `,
      [Number(id)]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found.",
      });
    }

    const category = existingCategory.rows[0];

    // Already Inactive
    if (category.status === MasterStatus.Inactive) {
      return res.status(400).json({
        error: "Category is already inactive.",
      });
    }

    // Soft Delete
    const result = await pool.query(
      `
      UPDATE categories
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        name,
        slug,
        description,
        display_order,
        status,
        created_at,
        updated_at
      `,
      [
        MasterStatus.Inactive,
        Number(id),
      ]
    );

    return res.status(200).json({
      message: "Category deactivated successfully.",
      category: result.rows[0],
    });

  } catch (error) {
    console.error("Delete Category Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
