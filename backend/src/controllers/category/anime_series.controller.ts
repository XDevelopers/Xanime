import { Request, Response, NextFunction } from "express";
import { slugify } from "../../utils/slug/slug.js";

import pool from "../../db/db.js";
import { anime_seriestatus } from "../../enum.js";


/**
 * @desc =Create Anime_series
 * @route POST /api/v1/admin/anime_series
 * @access Admin
 */
export const createAnime_series = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, display_order } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: "Anime_series name is required.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const slug = slugify(normalizedName);
    const isDuplicate = await pool.query(
      `
      SELECT
    id
FROM anime_series
WHERE
    LOWER(name) = LOWER($1)
    OR slug = $2;;
        `,
      [normalizedName, slug],
    );

    if (isDuplicate.rows.length !== 0) {
      return res.status(409).json({
        error: "Anime_series already exists.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO anime_series
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
        anime_seriestatus.Active,
      ],
    );

    return res.status(201).json({
      message: "Anime_series created successfully.",

      Anime_series: result.rows[0],
    });
  } catch (error) {
    console.error("Create Anime_series Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Get All Anime_series
 * @route GET /api/v1/admin/anime_series
 * @access Admin
 */
export const getAllAnime_series = async (
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
FROM anime_series
ORDER BY
display_order ASC,
created_at DESC
`,
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "anime_series fetched successfully.",

        count: 0,

        anime_series: [],
      });
    }

    return res.status(200).json({
      message: "anime_series fetched successfully.",

      count: result.rows.length,

      anime_series: result.rows,
    });
  } catch (error) {
    console.error(" Anime_series Fetch Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Get Anime_series By ID
 * @route GET /api/v1/admin/anime_series/:id
 * @access Admin
 */
export const getAnime_seriesById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Anime_series ID.",
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
    FROM anime_series
    WHERE id=$1
    `,
      [Number(id)],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Anime_series not found.",
      });
    }

    return res.status(200).json({
      message: "Anime_series fetched successfully.",

      Anime_series: result.rows[0],
    });
  } catch (error) {
    console.error("Get Anime_series By ID Error:", error);
    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Update Anime_series
 * @route PATCH /api/v1/admin/anime_series/:id
 * @access Admin
 */
export const UpdateAnime_series = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, description, display_order, status } = req.body;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Anime_series ID.",
      });
    }
    if (!name?.trim()) {
      return res.status(400).json({
        error: "Anime_series name is required",
      });
    }
    const isAnime_seriesExists = await pool.query(
      `
      
      SELECT id
  FROM anime_series
  WHERE id = $1;`,
      [Number(id)],
    );

    if (isAnime_seriesExists.rows.length === 0) {
      return res.status(404).json({
        error: "Anime_series not found.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const slug = slugify(normalizedName);

    const isDuplicate = await pool.query(
      `
          
          SELECT id
  FROM anime_series
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
        error: "Anime_series with this name already exists",
      });
    }
    const result = await pool.query(
      `
      UPDATE anime_series
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
        status ?? anime_seriestatus.Active,
        Number(id),
      ],
    );
    return res.status(200).json({
      message: "Anime_series updated successfully.",
      Anime_series: result.rows[0],
    });
  } catch (error) {
    console.error("Update Anime_series Error:", error);
    if (res.headersSent) {
      return next(error);
    }
    return res.status(500).json({
      error: "Internal Srver Error",
    });
  }
};

/**
 * @desc Delete (Soft Delete) Anime_series
 * @route DELETE /api/v1/admin/anime_series/:id
 * @access Admin
 */
export const deleteAnime_series = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Anime_series ID.",
      });
    }

    // Check Anime_series Exists
    const existingAnime_series = await pool.query(
      `
      SELECT
        id,
        status
      FROM anime_series
      WHERE id = $1
      `,
      [Number(id)]
    );

    if (existingAnime_series.rows.length === 0) {
      return res.status(404).json({
        error: "Anime_series not found.",
      });
    }

    const Anime_series = existingAnime_series.rows[0];

    // Already Inactive
    if (Anime_series.status === anime_seriestatus.Inactive) {
      return res.status(400).json({
        error: "Anime_series is already inactive.",
      });
    }

    // Soft Delete
    const result = await pool.query(
      `
      UPDATE anime_series
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
        anime_seriestatus.Inactive,
        Number(id),
      ]
    );

    return res.status(200).json({
      message: "Anime_series deactivated successfully.",
      Anime_series: result.rows[0],
    });

  } catch (error) {
    console.error("Delete Anime_series Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
