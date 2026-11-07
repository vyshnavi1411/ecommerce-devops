import express from "express";
import pool from "../config/db.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.use(adminAuth);

// POST /api/admin/products - Create a product
router.post("/products", async (req, res) => {
    const { sku, name, description, price, stock } = req.body;

    if (
        !sku ||
        !name ||
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(stock) ||
        stock < 0
    ) {
        return res.status(400).json({
            message: "Valid SKU, name, price and stock are required"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `INSERT INTO products
             (sku, name, description, price, stock)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [sku, name, description || null, price, stock]
        );

        const product = result.rows[0];

        await client.query(
            `INSERT INTO audit_logs
             (action, entity_type, entity_id, details)
             VALUES ($1, $2, $3, $4)`,
            [
                "PRODUCT_CREATED",
                "PRODUCT",
                product.id,
                JSON.stringify({ sku, name, price, stock })
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);

        res.status(error.code === "23505" ? 409 : 500).json({
            message:
                error.code === "23505"
                    ? "Product SKU already exists"
                    : "Failed to create product"
        });
    } finally {
        client.release();
    }
});

// PATCH /api/admin/products/:id/stock - Update stock
router.patch("/products/:id/stock", async (req, res) => {
    const productId = Number(req.params.id);
    const { stock } = req.body;

    if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(stock) ||
        stock < 0
    ) {
        return res.status(400).json({
            message: "Valid product ID and non-negative stock are required"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE products
             SET stock = $1
             WHERE id = $2
             RETURNING *`,
            [stock, productId]
        );

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = result.rows[0];

        await client.query(
            `INSERT INTO audit_logs
             (action, entity_type, entity_id, details)
             VALUES ($1, $2, $3, $4)`,
            [
                "STOCK_UPDATED",
                "PRODUCT",
                productId,
                JSON.stringify({ newStock: stock })
            ]
        );

        await client.query("COMMIT");

        res.status(200).json({
            message: "Stock updated successfully",
            product
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);

        res.status(500).json({
            message: "Failed to update stock"
        });
    } finally {
        client.release();
    }
});

export default router;
