import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Sidebar from '../sidebar/sidebar';
import LoadingSpinner from '../loadingSpinner/loadingSpinner';
import { useLoading } from '../../context/LoadingContext';
import 'react-toastify/dist/ReactToastify.css';
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
            <ToastContainer
                position="top-right"
                autoClose={3000}
                limit={3}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
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
