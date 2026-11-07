
import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";

describe("Product API Tests", () => {

    test("GET /api/products should return all products", async () => {
        const response = await request(app)
            .get("/api/products");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("products");
        expect(response.body.count).toBeGreaterThan(0);
    });

    test("GET /api/products?q=Laptop should search products", async () => {
        const response = await request(app)
            .get("/api/products?q=Laptop");

        expect(response.statusCode).toBe(200);
        expect(response.body.count).toBeGreaterThan(0);
        expect(response.body.products[0].name).toBe("Laptop");
    });

    test("GET /api/products/1 should return product details", async () => {
        const response = await request(app)
            .get("/api/products/1");

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(1);
        expect(response.body.name).toBe("Laptop");
    });

    test("GET /api/products/9999 should return 404", async () => {
        const response = await request(app)
            .get("/api/products/9999");

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Product not found");
    });
afterAll(async () => {
    await pool.end();
});
});
