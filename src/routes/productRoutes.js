import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/products - List and search products
router.get("/", async (req, res) => {
    try {
        const { q } = req.query;

        let result;

        if (q && q.trim()) {
            const searchTerm = `%${q.trim()}%`;

            result = await pool.query(
                `SELECT * FROM products
                 WHERE is_active = TRUE
                 AND (
                     name ILIKE $1
                     OR sku ILIKE $1
                     OR description ILIKE $1
                 )
                 ORDER BY id`,
                [searchTerm]
            );
        } else {
            result = await pool.query(
                `SELECT * FROM products
                 WHERE is_active = TRUE
                 ORDER BY id`
            );
        }

        res.status(200).json({
            count: result.rowCount,
            products: result.rows
        });
    } catch (error) {
        console.error("Product search failed:", error);

        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
});

// GET /api/products/:id - Get product details
router.get("/:id", async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const result = await pool.query(
            `SELECT * FROM products
             WHERE id = $1 AND is_active = TRUE`,
            [productId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Product details failed:", error);

        res.status(500).json({
            message: "Failed to fetch product details"
        });
    }
});

export default router;
