import React, { createContext, useState, useContext, useEffect } from 'react';


const encryptData = async (data) => {
    try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoder.encode(data)
        );


        const exportedKey = await crypto.subtle.exportKey('raw', key);
        return {
            encrypted: btoa(String.fromCharCode.apply(null, new Uint8Array(encrypted))),
            iv: btoa(String.fromCharCode.apply(null, iv)),
            key: btoa(String.fromCharCode.apply(null, new Uint8Array(exportedKey)))
        };
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

const decryptData = async (encryptedObj) => {
    if (!encryptedObj) return null;

    try {
        const { encrypted, iv, key } = encryptedObj;

        const encryptedBuffer = new Uint8Array(atob(encrypted).split('').map(char => char.charCodeAt(0)));
        const ivBuffer = new Uint8Array(atob(iv).split('').map(char => char.charCodeAt(0)));
        const keyBuffer = new Uint8Array(atob(key).split('').map(char => char.charCodeAt(0)));

        // Import the key
        const importedKey = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-GCM', length: 256 },
            true,
            ['decrypt']
        );

        // Decrypt the data
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivBuffer },
            importedKey,
            encryptedBuffer
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [barangayId, setBarangayId] = useState(null);

    useEffect(() => {
        const loadEncryptedData = async () => {
            const storedData = localStorage.getItem('barangayId');
            if (storedData) {
                try {
                    const decryptedId = await decryptData(JSON.parse(storedData));
                    if (decryptedId) {
                        setBarangayId(decryptedId);
                    }
                } catch (error) {
                    console.error('Error loading barangay ID:', error);
                }
            }
        };

        loadEncryptedData();
    }, []);

    // Encrypt and store data when barangayId changes
    useEffect(() => {
        const storeEncryptedData = async () => {
            if (barangayId) {
                try {
                    const encryptedData = await encryptData(barangayId);
                    if (encryptedData) {
                        localStorage.setItem('barangayId', JSON.stringify(encryptedData));
                    }
                } catch (error) {
                    console.error('Error storing barangay ID:', error);
                }
            } else {
                localStorage.removeItem('barangayId');
            }
        };

        storeEncryptedData();
    }, [barangayId]);

    return (
        <AuthContext.Provider value={{ barangayId, setBarangayId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);