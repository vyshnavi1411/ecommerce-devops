
import request from "supertest";
import { randomUUID } from "crypto";
import app from "../src/app.js";
import pool from "../src/config/db.js";

describe("Admin API Tests", () => {
    const adminToken = process.env.ADMIN_API_TOKEN;
    const sku = `ADMIN-TEST-${randomUUID()}`;

    let productId;

    test("Admin should not create product without authentication", async () => {
        const response = await request(app)
            .post("/api/admin/products")
            .send({
                sku,
                name: "Test Mouse",
                price: 1200,
                stock: 10
            });

        expect(response.statusCode).toBe(401);
    });

    test("Admin should create a product with valid token", async () => {
        const response = await request(app)
            .post("/api/admin/products")
            .set("x-admin-token", adminToken)
            .send({
                sku,
                name: "Test Mouse",
                description: "Admin API test product",
                price: 1200,
                stock: 10
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.product.sku).toBe(sku);

        productId = response.body.product.id;
    });

    test("Admin should update product stock", async () => {
        const response = await request(app)
            .patch(`/api/admin/products/${productId}/stock`)
            .set("x-admin-token", adminToken)
            .send({ stock: 25 });

        expect(response.statusCode).toBe(200);
        expect(response.body.product.stock).toBe(25);
    });

    test("Admin should not update stock without authentication", async () => {
        const response = await request(app)
            .patch(`/api/admin/products/${productId}/stock`)
            .send({ stock: 50 });

        expect(response.statusCode).toBe(401);
    });

    test("Admin should reject negative stock", async () => {
        const response = await request(app)
            .patch(`/api/admin/products/${productId}/stock`)
            .set("x-admin-token", adminToken)
            .send({ stock: -5 });

        expect(response.statusCode).toBe(400);
    });

    afterAll(async () => {
        if (productId) {
            await pool.query(
                `DELETE FROM audit_logs
                 WHERE entity_type = 'PRODUCT' AND entity_id = $1`,
                [productId]
            );

            await pool.query(
                "DELETE FROM products WHERE id = $1",
                [productId]
            );
        }

        await pool.end();
    });
});
