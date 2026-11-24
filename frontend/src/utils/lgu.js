export const LGU_BARANGAY = 1;
export const LGU_MUNICIPALITY = 2;
export const LGU_PROVINCE = 3;

export const getLguType = (lguId) => {
    const parsed = Number(lguId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : LGU_BARANGAY;
};

export const isMunicipalityUser = (lguId) => getLguType(lguId) === LGU_MUNICIPALITY;
export const isProvinceUser = (lguId) => getLguType(lguId) === LGU_PROVINCE;
export const isBarangayUser = (lguId) => getLguType(lguId) === LGU_BARANGAY;
