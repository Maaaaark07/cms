import React, { createContext, useState, useContext, useEffect } from 'react';
import { encryptId, decryptId } from '../utils/encryption';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [barangayId, setBarangayId] = useState(null);
    const [cityId, setCityId] = useState(null);
    const [provinceId, setProvinceId] = useState(null);

    // Load encrypted data from localStorage on component mount
    useEffect(() => {
        const loadEncryptedData = () => {
            const storedBarangayId = localStorage.getItem('barangayId');
            const storedCityId = localStorage.getItem('cityId');
            const storedProvinceId = localStorage.getItem('provinceId');

            if (storedBarangayId) {
                try {
                    const decryptedBarangayId = decryptId(storedBarangayId);
                    if (decryptedBarangayId) {
                        setBarangayId(decryptedBarangayId);
                    }
                } catch (error) {
                    console.error('Error loading barangay ID:', error);
                    alert('Failed to load your session data. Please log in again.');
                }
            }

            if (storedCityId) {
                try {
                    const decryptedCityId = decryptId(storedCityId);
                    if (decryptedCityId) {
                        setCityId(decryptedCityId);
                    }
                } catch (error) {
                    console.error('Error loading city ID:', error);
                    alert('Failed to load your session data. Please log in again.');
                }
            }

            if (storedProvinceId) {
                try {
                    const decryptedProvinceId = decryptId(storedProvinceId);
                    if (decryptedProvinceId) {
                        setProvinceId(decryptedProvinceId);
                    }
                } catch (error) {
                    console.error('Error loading province ID:', error);
                    alert('Failed to load your session data. Please log in again.');
                }
            }
        };

        loadEncryptedData();
    }, []);

    useEffect(() => {
        const storeEncryptedData = () => {
            if (barangayId) {
                try {
                    const encryptedBarangayId = encryptId(barangayId);
                    localStorage.setItem('barangayId', encryptedBarangayId);
                } catch (error) {
                    console.error('Error storing barangay ID:', error);
                }
            } else {
                localStorage.removeItem('barangayId');
            }

            if (cityId) {
                try {
                    const encryptedCityId = encryptId(cityId);
                    localStorage.setItem('cityId', encryptedCityId);
                } catch (error) {
                    console.error('Error storing city ID:', error);
                }
            } else {
                localStorage.removeItem('cityId');
            }

            if (provinceId) {
                try {
                    const encryptedProvinceId = encryptId(provinceId);
                    localStorage.setItem('provinceId', encryptedProvinceId);
                } catch (error) {
                    console.error('Error storing province ID:', error);
                }
            } else {
                localStorage.removeItem('provinceId');
            }
        };

        storeEncryptedData();
    }, [barangayId, cityId, provinceId]);

    return (
        <AuthContext.Provider value={{ barangayId, cityId, provinceId, setBarangayId, setCityId, setProvinceId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
