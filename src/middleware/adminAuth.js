const adminAuth = (req, res, next) => {
    const adminToken = process.env.ADMIN_API_TOKEN;
    const providedToken = req.headers["x-admin-token"];

    if (!adminToken || providedToken !== adminToken) {
        return res.status(401).json({
            message: "Unauthorized: Admin access required"
        });
    }

    next();
};

export default adminAuth;
