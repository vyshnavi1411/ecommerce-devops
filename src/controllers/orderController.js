
import pool from "../config/db.js";

export const createOrder = async (req, res) => {
    const { productId, quantity } = req.body;
    const idempotencyKey = req.headers["idempotency-key"];

    // 1. Validate request before acquiring database connection
    if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        return res.status(400).json({
            message: "Valid productId and positive quantity are required"
        });
    }

    if (!idempotencyKey || idempotencyKey.length > 100) {
        return res.status(400).json({
            message: "Valid Idempotency-Key header is required"
        });
    }

    let client;
    let transactionStarted = false;

    try {
        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // 2. Check for an existing idempotency key
        const existingOrder = await client.query(
            `SELECT * FROM orders WHERE idempotency_key = $1`,
            [idempotencyKey]
        );

        if (existingOrder.rows.length > 0) {
            const existing = existingOrder.rows[0];

            await client.query("COMMIT");
            transactionStarted = false;

            // Reject reuse of the key with a different payload
            if (
                existing.product_id !== productId ||
                existing.quantity !== quantity
            ) {
                return res.status(409).json({
                    message: "Idempotency key already used with a different request"
                });
            }

            return res.status(200).json({
                message: "Order already exists",
                order: existing
            });
        }

        // 3. Atomically reduce stock
        const productResult = await client.query(
            `UPDATE products
             SET stock = stock - $1
             WHERE id = $2
             AND stock >= $1
             AND is_active = TRUE
             RETURNING id, price`,
            [quantity, productId]
        );

        if (productResult.rowCount === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(400).json({
                message: "Product unavailable or insufficient stock"
            });
        }

        const product = productResult.rows[0];
        const totalAmount = Number(product.price) * quantity;

        // 4. Create order with product and quantity
        const orderResult = await client.query(
            `INSERT INTO orders
             (idempotency_key, product_id, quantity, total_amount)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [idempotencyKey, productId, quantity, totalAmount]
        );

        const order = orderResult.rows[0];

        // 5. Create order item
        await client.query(
            `INSERT INTO order_items
             (order_id, product_id, quantity, unit_price)
             VALUES ($1, $2, $3, $4)`,
            [order.id, productId, quantity, product.price]
        );

        // 6. Record audit log
        await client.query(
            `INSERT INTO audit_logs
             (action, entity_type, details)
             VALUES ($1, $2, $3)`,
            [
                "ORDER_CREATED",
                "ORDER",
                JSON.stringify({
                    orderId: order.id,
                    productId,
                    quantity
                })
            ]
        );

        // 7. Commit transaction
        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        // Roll back if transaction is still active
        if (client && transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }

        // Handle concurrent duplicate requests
        if (error.code === "23505" && client) {
            try {
                const existing = await client.query(
                    `SELECT * FROM orders WHERE idempotency_key = $1`,
                    [idempotencyKey]
                );

                if (existing.rows.length > 0) {
                    const order = existing.rows[0];

                    if (
                        order.product_id !== productId ||
                        order.quantity !== quantity
                    ) {
                        return res.status(409).json({
                            message: "Idempotency key already used with a different request"
                        });
                    }

                    return res.status(200).json({
                        message: "Order already exists",
                        order
                    });
                }
            } catch (lookupError) {
                console.error("Duplicate order lookup failed:", lookupError);
            }
        }

        console.error("Order creation failed:", error);

        return res.status(500).json({
            message: "Failed to create order"
        });

    } finally {
        if (client) {
            client.release();
        }
    }
};
