import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import pool from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp());
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "ecommerce-api"
    });
});

app.get("/ready", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "ready",
            database: "connected"
        });
    } catch {
        res.status(503).json({
            status: "not ready",
            database: "disconnected"
        });
    }
});

export default app;
