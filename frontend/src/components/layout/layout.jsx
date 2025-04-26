import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../sidebar/sidebar';
import LoadingSpinner from '../loadingSpinner/loadingSpinner';
import { useLoading } from '../../context/LoadingContext';
import './layout.scss';

const Layout = () => {
    const location = useLocation();
    const { isLoading, setIsLoading } = useLoading();

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000); 

        return () => clearTimeout(timer);
    }, [location, setIsLoading]);

    return (
        <div className="layout">
            <Sidebar />
            {isLoading ? (
                <div className="content">
                    <LoadingSpinner />
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    );
};

export default Layout;
