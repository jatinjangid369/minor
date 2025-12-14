const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_jwt_secret"; // In production, use process.env.JWT_SECRET

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) return res.status(401).json({ status: "error", message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ status: "error", message: "Invalid token" });
        req.user = user; // attach decoded user info
        next();
    });
}

module.exports = authenticateToken;
