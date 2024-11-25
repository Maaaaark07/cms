import jwt from 'jsonwebtoken';

export const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Error: "Not authorized" });
    }
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.json({ Error: "Token is not okay" });
        } else {
            req.user = { users: decoded.users, role: decoded.role };
            next();
        }
    });
};