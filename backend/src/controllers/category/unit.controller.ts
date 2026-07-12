import { Request, Response, NextFunction } from "express";


import pool from "../../db/db.js";
import { MasterStatus } from "../../enum.js";

/**
 * @desc =Create unit
 * @route POST /api/v1/admin/units
 * @access Admin
 */
export const createUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, symbol, display_order } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        error: "Unit name is required.",
      });
    }

    if (!symbol?.trim()) {
      return res.status(400).json({
        error: "Unit symbol is required.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const normalizedSymbol = symbol.trim().toUpperCase();

    const isDuplicate = await pool.query(
      `
      SELECT id
      FROM units
      WHERE
      LOWER(name)=LOWER($1)
      OR UPPER(symbol)=UPPER($2);
      `,
      [normalizedName, normalizedSymbol]
    );

    if (isDuplicate.rows.length !== 0) {
      return res.status(409).json({
        error: "Unit already exists.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO units
      (
        name,
        symbol,
        display_order,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING *;
      `,
      [
        normalizedName,
        normalizedSymbol,
        display_order ?? 0,
        MasterStatus.Active,
      ]
    );

    return res.status(201).json({
      message: "Unit created successfully.",
      unit: result.rows[0],
    });

  } catch (error) {
    console.error("Create Unit Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Get All unit
 * @route GET /api/v1/admin/units
 * @access Admin
 */
export const getAllUnits = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
   const result = await pool.query(`
SELECT
id,
name,
symbol,
display_order,
status,
created_at,
updated_at
FROM units
ORDER BY
display_order ASC,
created_at DESC
`);

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "units fetched successfully.",

        count: 0,

        units: [],
      });
    }

    return res.status(200).json({
      message: "units fetched successfully.",

      count: result.rows.length,

      units: result.rows,
    });
  } catch (error) {
    console.error(" unit Fetch Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Get unit By ID
 * @route GET /api/v1/admin/units/:id
 * @access Admin
 */
export const getUnitById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid unit ID.",
      });
    }

    const result = await pool.query(
`
SELECT
id,
name,
symbol,
display_order,
status,
created_at,
updated_at
FROM units
WHERE id=$1
`,
[Number(id)]
);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "unit not found.",
      });
    }

    return res.status(200).json({
      message: "unit fetched successfully.",

      unit: result.rows[0],
    });
  } catch (error) {
    console.error("Get unit By ID Error:", error);
    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Update unit
 * @route PATCH /api/v1/admin/units/:id
 * @access Admin
 */
export const updateUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const { id } = req.params;
    const {
      name,
      symbol,
      display_order,
      status
    } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid Unit ID.",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        error: "Unit name is required.",
      });
    }

    if (!symbol?.trim()) {
      return res.status(400).json({
        error: "Unit symbol is required.",
      });
    }

    const existing = await pool.query(
      `
      SELECT id
      FROM units
      WHERE id=$1
      `,
      [Number(id)]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: "Unit not found.",
      });
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const normalizedSymbol = symbol.trim().toUpperCase();

    const duplicate = await pool.query(
      `
      SELECT id
      FROM units
      WHERE
      (
        LOWER(name)=LOWER($1)
        OR UPPER(symbol)=UPPER($2)
      )
      AND id <> $3;
      `,
      [
        normalizedName,
        normalizedSymbol,
        Number(id),
      ]
    );

    if (duplicate.rows.length !== 0) {
      return res.status(409).json({
        error: "Unit already exists.",
      });
    }

    const result = await pool.query(
      `
      UPDATE units
      SET
      name=$1,
      symbol=$2,
      display_order=$3,
      status=$4,
      updated_at=CURRENT_TIMESTAMP
      WHERE id=$5
      RETURNING *;
      `,
      [
        normalizedName,
        normalizedSymbol,
        display_order ?? 0,
        status ?? MasterStatus.Active,
        Number(id),
      ]
    );

    return res.status(200).json({
      message: "Unit updated successfully.",
      unit: result.rows[0],
    });

  } catch (error) {

    console.error("Update Unit Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

/**
 * @desc Delete (Soft Delete) unit
 * @route DELETE /api/v1/admin/units/:id
 * @access Admin
 */
export const deleteUnit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: "Invalid unit ID.",
      });
    }

    // Check unit Exists
    const existingunit = await pool.query(
      `
      SELECT
        id,
        status
      FROM units
      WHERE id = $1
      `,
      [Number(id)],
    );

    if (existingunit.rows.length === 0) {
      return res.status(404).json({
        error: "unit not found.",
      });
    }

    const unit = existingunit.rows[0];

    // Already Inactive
    if (unit.status === MasterStatus.Inactive) {
      return res.status(400).json({
        error: "unit is already inactive.",
      });
    }

    // Soft Delete
    const result = await pool.query(
      `
     UPDATE units
SET
status = $1,
updated_at = CURRENT_TIMESTAMP
WHERE id = $2
RETURNING
id,
name,
symbol,
display_order,
status,
created_at,
updated_at;
      `,
      [MasterStatus.Inactive, Number(id)],
    );

    return res.status(200).json({
      message: "unit deactivated successfully.",
      unit: result.rows[0],
    });
  } catch (error) {
    console.error("Delete unit Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
