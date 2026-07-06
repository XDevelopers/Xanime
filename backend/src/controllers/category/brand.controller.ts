import { Request, Response, NextFunction } from "express";
import { slugify } from "../../utils/slug/slug.js";

import pool from "../../db/db.js";
import { BrandStatus } from "../../enum.js";


/**
 * @desc =Create Brand
 * @route POST /api/v1/admin/brands
 * @access Admin
 */
export const createBrand = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, display_order } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: "Brand name is required.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const slug = slugify(normalizedName);
    const isDuplicate = await pool.query(
      `
      SELECT
    id
FROM brands
WHERE
    LOWER(name) = LOWER($1)
    OR slug = $2;;
        `,
      [normalizedName, slug],
    );

    if (isDuplicate.rows.length !== 0) {
      return res.status(409).json({
        error: "Brand already exists.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO brands
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
        BrandStatus.Active,
      ],
    );

    return res.status(201).json({
      message: "Brand created successfully.",

      Brand: result.rows[0],
    });
  } catch (error) {
    console.error("Create Brand Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Get All Brand
 * @route GET /api/v1/admin/brands
 * @access Admin
 */
export const getAllbrand = async (
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
FROM brands
ORDER BY
display_order ASC,
created_at DESC
`,
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "brands fetched successfully.",

        count: 0,

        brands: [],
      });
    }

    return res.status(200).json({
      message: "brands fetched successfully.",

      count: result.rows.length,

      brands: result.rows,
    });
  } catch (error) {
    console.error(" Brand Fetch Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Get Brand By ID
 * @route GET /api/v1/admin/brands/:id
 * @access Admin
 */
export const getBrandById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Brand ID.",
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
    FROM brands
    WHERE id=$1
    `,
      [Number(id)],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Brand not found.",
      });
    }

    return res.status(200).json({
      message: "Brand fetched successfully.",

      Brand: result.rows[0],
    });
  } catch (error) {
    console.error("Get Brand By ID Error:", error);
    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Update Brand
 * @route PATCH /api/v1/admin/brands/:id
 * @access Admin
 */
export const UpdateBrand = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, description, display_order, status } = req.body;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Brand ID.",
      });
    }
    if (!name?.trim()) {
      return res.status(400).json({
        error: "Brand name is required",
      });
    }
    const isBrandExists = await pool.query(
      `
      
      SELECT id
  FROM brands
  WHERE id = $1;`,
      [Number(id)],
    );

    if (isBrandExists.rows.length === 0) {
      return res.status(404).json({
        error: "Brand not found.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const slug = slugify(normalizedName);

    const isDuplicate = await pool.query(
      `
          
          SELECT id
  FROM brands
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
        error: "Brand with this name already exists",
      });
    }
    const result = await pool.query(
      `
      UPDATE brands
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
        status ?? BrandStatus.Active,
        Number(id),
      ],
    );
    return res.status(200).json({
      message: "Brand updated successfully.",
      Brand: result.rows[0],
    });
  } catch (error) {
    console.error("Update Brand Error:", error);
    if (res.headersSent) {
      return next(error);
    }
    return res.status(500).json({
      error: "Internal Srver Error",
    });
  }
};

/**
 * @desc Delete (Soft Delete) Brand
 * @route DELETE /api/v1/admin/brands/:id
 * @access Admin
 */
export const deleteBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Brand ID.",
      });
    }

    // Check Brand Exists
    const existingBrand = await pool.query(
      `
      SELECT
        id,
        status
      FROM brands
      WHERE id = $1
      `,
      [Number(id)]
    );

    if (existingBrand.rows.length === 0) {
      return res.status(404).json({
        error: "Brand not found.",
      });
    }

    const Brand = existingBrand.rows[0];

    // Already Inactive
    if (Brand.status === BrandStatus.Inactive) {
      return res.status(400).json({
        error: "Brand is already inactive.",
      });
    }

    // Soft Delete
    const result = await pool.query(
      `
      UPDATE brands
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
        BrandStatus.Inactive,
        Number(id),
      ]
    );

    return res.status(200).json({
      message: "Brand deactivated successfully.",
      Brand: result.rows[0],
    });

  } catch (error) {
    console.error("Delete Brand Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
