import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/sidebar';
import './layout.scss'; 

const Layout = () => {
    return (
        <div className="layout">
                <Sidebar />
                <Outlet />
        </div>
    );
};

export default Layout;