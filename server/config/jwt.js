import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';

export const buildUserClaims = (row = {}) => {
    const {
        password,
        ...rest
    } = row;

    return {
        user: rest.user,
        user_id: rest.user_id ?? rest.id,
        role: rest.role,
        role_id: rest.role_id,
        profile_image: rest.profile_image,
        barangay_id: rest.barangay_id,
        brgy_name: rest.brgy_name,
        brgy_logo: rest.brgy_logo,
        city_id: rest.city_id,
        city_name: rest.city_name,
        city_logo: rest.city_logo,
        province_id: rest.province_id,
        province_name: rest.province_name,
        province_logo: rest.province_logo,
        lgu_type_id: rest.lgu_type_id,
        region_id: rest.region_id,
    };
};
