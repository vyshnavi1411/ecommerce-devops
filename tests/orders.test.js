import request from "supertest";
import { randomUUID } from "crypto";
import app from "../src/app.js";
import pool from "../src/config/db.js";

describe("Order API Tests", () => {
    let testProductId;
    let lowStockProductId;
    let orderKey;
    let lowStockKey;

    beforeAll(async () => {
        orderKey = `test-order-${randomUUID()}`;
        lowStockKey = `test-lowstock-${randomUUID()}`;

        // Create temporary products for testing
        const product = await pool.query(
            `INSERT INTO products
             (sku, name, description, price, stock)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [`TEST-${randomUUID()}`, "Test Product", "Order test", 100, 10]
        );

        testProductId = product.rows[0].id;

        const lowStockProduct = await pool.query(
            `INSERT INTO products
             (sku, name, description, price, stock)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [`TEST-${randomUUID()}`, "Low Stock Product", "Stock test", 100, 1]
        );

        lowStockProductId = lowStockProduct.rows[0].id;
    });

    test("POST /api/orders should create a new order", async () => {
        const response = await request(app)
            .post("/api/orders")
            .set("Idempotency-Key", orderKey)
            .send({
                productId: testProductId,
                quantity: 2
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Order created successfully");
        expect(response.body.order.quantity).toBe(2);
    });

    test("Repeated request should return existing order", async () => {
        const response = await request(app)
            .post("/api/orders")
            .set("Idempotency-Key", orderKey)
            .send({
                productId: testProductId,
                quantity: 2
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Order already exists");
    });

    test("Same key with different payload should return 409", async () => {
        const response = await request(app)
            .post("/api/orders")
            .set("Idempotency-Key", orderKey)
            .send({
                productId: testProductId,
                quantity: 3
            });

        expect(response.statusCode).toBe(409);
    });

    test("Insufficient stock should return 400", async () => {
        const response = await request(app)
            .post("/api/orders")
            .set("Idempotency-Key", lowStockKey)
            .send({
                productId: lowStockProductId,
                quantity: 5
            });

        expect(response.statusCode).toBe(400);
    });

    test("Zero quantity should return 400", async () => {
        const response = await request(app)
            .post("/api/orders")
            .set("Idempotency-Key", `invalid-${randomUUID()}`)
            .send({
                productId: testProductId,
                quantity: 0
            });

        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        if (testProductId && lowStockProductId) {
            const productIds = [testProductId, lowStockProductId];

            await pool.query(
                `DELETE FROM audit_logs
                 WHERE details->>'productId' = ANY($1::text[])`,
                [productIds.map(String)]
            );

            await pool.query(
                `DELETE FROM order_items WHERE product_id = ANY($1::int[])`,
                [productIds]
            );

            await pool.query(
                `DELETE FROM orders WHERE idempotency_key = ANY($1::text[])`,
                [[orderKey]]
            );

            await pool.query(`DELETE FROM products WHERE id = ANY($1::int[])`, [
                productIds
            ]);
        }

        await pool.end();
    });
});
