import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

export const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ Error: "Not authorized" });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ Error: "Token is not okay" });
        }

        const user = decoded.user_data || decoded;
        req.user_data = {
            user: user.user,
            user_id: user.user_id ?? user.id,
            role: user.role,
            role_id: user.role_id,
            profile_image: user.profile_image,
            barangay_id: user.barangay_id,
            brgy_name: user.brgy_name,
            brgy_logo: user.brgy_logo,
            city_id: user.city_id,
            city_name: user.city_name,
            city_logo: user.city_logo,
            province_id: user.province_id,
            province_name: user.province_name,
            province_logo: user.province_logo,
            lgu_type_id: user.lgu_type_id,
            region_id: user.region_id,
        };
        next();
    });
};
