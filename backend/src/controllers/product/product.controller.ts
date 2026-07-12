import { Request, Response, NextFunction } from "express";
import pool from "../../db/db.js";
import { MasterStatus, ProductStatus } from "../../enum.js";
import { slugify } from "../../utils/slug/slug.js";
import { generateBaseSku } from "../../utils/sku/generateSku.js";
import fs from "fs/promises";
export const CreateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    name,
    description,
    short_description,
    price,
    discount_price,
    stock,
    size_value,
    unit_id,
    category_id,
    brand_id,
    anime_series_id,
    weight,
    is_featured,
    status,
  } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
  return res.status(400).json({
    error: "At least one product image is required.",
  });
  }
  //master tab validation 
if (
    !unit_id ||
    !anime_series_id ||
    !brand_id ||
    !category_id
) {
    return res.status(400).json({
        error:" Pls fill All Rquire Fields"
    })
  }


   //other value

  if (
    !name?.trim() ||
    !price ||
    stock === undefined ||
    !size_value?.trim()
) {
    return res.status(400).json({
        error: "Please fill all required fields."
    });
}


  const isActive= await pool.query(`
    SELECT
(
    SELECT COUNT(*)
    FROM categories
    WHERE id=$1
    AND status=$5
) AS category,

(
    SELECT COUNT(*)
    FROM brands
    WHERE id=$2
    AND status=$5
) AS brand,

(
    SELECT COUNT(*)
    FROM anime_series
    WHERE id=$3
    AND status=$5
) AS anime_series,

(
    SELECT COUNT(*)
    FROM units
    WHERE id=$4
    AND status=$5
) AS unit;`,[
    category_id,
    brand_id,
    anime_series_id,
    unit_id,
    MasterStatus.Active
])

const master = isActive.rows[0];

if (
    Number(master.category) === 0 ||
    Number(master.brand) === 0 ||
    Number(master.anime_series) === 0 ||
    Number(master.unit) === 0
) {
    return res.status(400).json({
        error: "Invalid or inactive master data."
    });
}

// duplicate Product Check
const normalizedName = name.trim().replace(/\s+/g, " ");
const normalizedSize = size_value.trim().toUpperCase();
const isDuplicate=await pool.query(`
    SELECT id
FROM products
WHERE
LOWER(name)=LOWER($1)
AND category_id=$2
AND brand_id=$3
AND anime_series_id=$4
AND size_value=$5
AND unit_id=$6;`,
[
normalizedName,
category_id,
brand_id,
anime_series_id,
normalizedSize,
unit_id
])

 if(isDuplicate.rows.length!==0){
    return res.status(409).json({
        error:"Product Already exists"
    })
 }


 const slug = slugify(normalizedName);

 const findValueById=await pool.query(`
  

SELECT
(
    SELECT name
    FROM categories
    WHERE id=$1
) AS category_name,

(
    SELECT name
    FROM brands
    WHERE id=$2
) AS brand_name,

(
    SELECT name
    FROM anime_series
    WHERE id=$3
) AS anime_name,

(
    SELECT symbol
    FROM units
    WHERE id=$4
) AS unit_symbol;
`,
[
    category_id,
    brand_id,
    anime_series_id,
    unit_id
]
);

const baseSku = generateBaseSku({
    brand: findValueById.rows[0].brand_name,
    category: findValueById.rows[0].category_name,
    animeSeries: findValueById.rows[0].anime_name,
    sizeValue: normalizedSize,
    unitSymbol: findValueById.rows[0].unit_symbol,
});

const skuResult = await pool.query(
`
SELECT COUNT(*) AS total
FROM products
WHERE sku LIKE $1;
`,
[
    `${baseSku}%`
]
);

const skuCount = Number(skuResult.rows[0].total);

const finalSku =
`${baseSku}-${String(skuCount + 1).padStart(4, "0")}`;
console.log(baseSku)

const client = await pool.connect();

try {
    await client.query("BEGIN");

  const result=  await client.query(`
        INSERT INTO products
(
    name,
    slug,
    sku,
    description,
    short_description,
    price,
    discount_price,
    stock,
    size_value,
    unit_id,
    category_id,
    brand_id,
    anime_series_id,
    weight,
    is_featured,
    status
)
VALUES
(
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16
)
RETURNING *;`,[
    normalizedName,
    slug,
    finalSku,
    description?.trim() || null,
    short_description?.trim() || null,
    price,
    discount_price ?? null,
    stock,
    normalizedSize,
    unit_id,
    category_id,
    brand_id,
    anime_series_id,
    weight ?? null,
    is_featured ?? false,
    status ?? ProductStatus.Draft
])

const product = result.rows[0];

const productId = product.id;


for (let i = 0; i < files.length; i++) {

    await client.query(
        `
        INSERT INTO product_images
        (
            product_id,
            image_url,
            display_order,
            is_primary
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )
        `,
        [
            productId,
            files[i].filename,
            i + 1,
            i === 0
        ]
    );

}

await client.query("COMMIT");

// await client.query("COMMIT");

return res.status(201).json({

    message: "Product created successfully.",

    product: result.rows[0]

});
}

catch (error) {

    await client.query("ROLLBACK");

    // Delete uploaded files
    if (files?.length) {

        for (const file of files) {

            try {

                await fs.unlink(file.path);

            } catch (err) {

                console.error("Image Delete Error:", err);

            }

        }

    }

    console.error("Create Product Error:", error);

    return res.status(500).json({
        error: "Internal Server Error"
    });

} finally {
    client.release();
}

}

