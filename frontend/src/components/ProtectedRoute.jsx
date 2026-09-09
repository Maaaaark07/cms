import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import cfg from '../../../server/config/domain.js';
import { useAuth } from './AuthContext';
import { pageKeyFromPath } from '../utils/pageAccess';

import Loader from "../components/Loader";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { canAccessPage, pagesLoaded, refreshAccessPages } = useAuth();

    useEffect(() => {
        axios.get(`http://${cfg.domainname}:${cfg.serverport}/home`, { withCredentials: true })
            .then(async (res) => {
                if (res.data.Status === 'Success') {
                    setIsAuthenticated(true);
                    await refreshAccessPages();
                } else {
                    setIsAuthenticated(false);
                }
            })
            .catch(() => {
                setIsAuthenticated(false);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [refreshAccessPages]);

    if (loading || (isAuthenticated && !pagesLoaded)) {
        return <div className='h-screen'>
            <Loader />
        </div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const pageKey = pageKeyFromPath(location.pathname);
    if (pageKey && !canAccessPage(pageKey)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
