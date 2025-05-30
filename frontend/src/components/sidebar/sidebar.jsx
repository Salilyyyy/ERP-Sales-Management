import React, { useState, useEffect } from "react";
import authApi from "../../api/apiAuth";
import "./sidebar.scss";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import DashboardIcon from "../../assets/img/Dashboard-icon.svg";
import InvoiceIcon from "../../assets/img/Invoice-icon.svg";
import ProductIcon from "../../assets/img/product-icon.svg";
import CustomerIcon from "../../assets/img/customer-icon.svg";
import StockIn from "../../assets/img/stockin-icon.svg";
import Shipping from "../../assets/img/shipping-icon.svg";
import Promotion from "../../assets/img/promotion-icon.svg";
import Setting from "../../assets/img/setting-icon.svg";
import Profile from "../../assets/img/profile-icon.svg";
import Logout from "../../assets/img/logout-icon.svg";
import Logo from "../../assets/img/logo.png";
import DownIcon from "../../assets/img/down-icon.svg";
import EmployeeIcon from "../../assets/img/employee.svg";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [activeItem, setActiveItem] = useState("");
    const [userRole, setUserRole] = useState("");
    const { language } = useLanguage();
    const t = translations[language];

    useEffect(() => {
        const currentUser = authApi.getCurrentUser();
        if (currentUser) {
            setUserRole(currentUser.userType || "");
        }
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const currentUser = authApi.getCurrentUser();
            setUserRole(currentUser?.userType || "");
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const path = location.pathname;
        if (path.includes("/dashboard")) setActiveItem("dashboard");
        else if (path.includes("/invoices")) setActiveItem("invoice");
        else if (path.includes("/product")) setActiveItem("product-list");
        else if (path.includes("/categories")) setActiveItem("product-category");
        else if (path.includes("/customer")) setActiveItem("customer");
        else if (path.includes("/supplier-list")) setActiveItem("supplier-list");
        else if (path.includes("/stock-history")) setActiveItem("stock-history");
        else if (path.includes("/post-office")) setActiveItem("post-office");
        else if (path.includes("/shipping-list")) setActiveItem("shipping-list");
        else if (path.includes("/promotion")) setActiveItem("promotion");
        else if (path.includes("/setting")) setActiveItem("setting");
        else if (path.includes("/profile")) setActiveItem("profile");

        if (path.includes("/product") || path.includes("/categories")) {
            setOpenSubmenu("product");
        } else if (path.includes("/supplier-list") || path.includes("/stock-history")) {
            setOpenSubmenu("stockIn");
        } else if (path.includes("/post-office") || path.includes("/shipping-list")) {
            setOpenSubmenu("shipping");
        }
    }, [location]);

    const toggleSubmenu = (key) => {
        setOpenSubmenu((prev) => (prev === key ? null : key));
    };

    const handleItemClick = (item, path) => {
        setActiveItem(item);
        navigate(path);
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
            navigate("/login");
        } catch (error) {
            console.error(language === 'en' ? "Logout error:" : "Lỗi đăng xuất:", error);
        }
    };

    return (
        <div className="sidebar">
            <div className="logo">
                <img className="logoIcon" src={Logo} alt="Logo" />
                <span>ERP {language === 'en' ? 'SYSTEM' : 'HỆ THỐNG'}</span>
            </div>
            <ul className="menu">
                <li
                    className={`menu-item ${activeItem === "dashboard" ? "active" : ""}`}
                    onClick={() => handleItemClick("dashboard", "/dashboard")}
                >
                    <div className="menu-no">
                        <img className="icon" src={DashboardIcon} alt="Dashboard" />
                        <span>{t.dashboard}</span>
                    </div>
                </li>

                {(userRole === "manager" || userRole === "admin") && (
                    <li
                        className={`menu-item ${activeItem === "employee" ? "active" : ""}`}
                        onClick={() => handleItemClick("employee", "/employee")}
                    >
                        <div className="menu-no">
                            <img className="icon" src={EmployeeIcon} alt="Employee" />
                            <span>{t.employees}</span>
                        </div>
                    </li>
                )}

                <li
                    className={`menu-item ${activeItem === "invoice" ? "active" : ""}`}
                    onClick={() => handleItemClick("invoice", "/invoices")}
                >
                    <div className="menu-no">
                        <img className="icon" src={InvoiceIcon} alt="Invoice" />
                        <span>{t.invoices}</span>
                    </div>
                </li>

                <li className="menu-item">
                    <div className="menu-main" onClick={() => toggleSubmenu("product")}>
                        <div className="name">
                            <img className="icon" src={ProductIcon} alt="Product" />
                            <span>{t.products}</span>
                        </div>
                        <img
                            className={`downIcon ${openSubmenu === "product" ? "rotate" : ""}`}
                            src={DownIcon}
                            alt="DownIcon"
                        />
                    </div>
                    {openSubmenu === "product" && (
                        <ul className="submenu">
                            <li
                                className={activeItem === "product-list" ? "active" : ""}
                                onClick={() => handleItemClick("product-list", "/product")}
                            >
                                {language === 'en' ? 'Product List' : 'Danh sách sản phẩm'}
                            </li>
                            <li
                                className={activeItem === "product-category" ? "active" : ""}
                                onClick={() => handleItemClick("product-category", "/categories")}
                            >
                                {language === 'en' ? 'Category List' : 'Danh sách loại sản phẩm'}
                            </li>
                        </ul>
                    )}
                </li>

                <li
                    className={`menu-item ${activeItem === "customer" ? "active" : ""}`}
                    onClick={() => handleItemClick("customer", "/customer")}
                >
                    <div className="menu-no">
                        <img className="icon" src={CustomerIcon} alt="Customer" />
                        <span>{t.customers}</span>
                    </div>
                </li>

                <li className="menu-item">
                    <div className="menu-main" onClick={() => toggleSubmenu("stockIn")}>
                        <div className="name">
                            <img className="icon" src={StockIn} alt="StockIn" />
                            <span>{t.stockIn}</span>
                        </div>
                        <img
                            className={`downIcon ${openSubmenu === "stockIn" ? "rotate" : ""}`}
                            src={DownIcon}
                            alt="DownIcon"
                        />
                    </div>
                    {openSubmenu === "stockIn" && (
                        <ul className="submenu">
                            <li
                                className={activeItem === "supplier-list" ? "active" : ""}
                                onClick={() => handleItemClick("supplier-list", "/supplier-list")}
                            >
                                {language === 'en' ? 'Supplier List' : 'Danh sách nhà cung cấp'}
                            </li>
                            <li
                                className={activeItem === "stock-history" ? "active" : ""}
                                onClick={() => handleItemClick("stock-history", "/stock-history")}
                            >
                                {language === 'en' ? 'Stock History' : 'Lịch sử nhập hàng'}
                            </li>
                        </ul>
                    )}
                </li>

                <li className="menu-item">
                    <div className="menu-main" onClick={() => toggleSubmenu("shipping")}>
                        <div className="name">
                            <img className="icon" src={Shipping} alt="Shipping" />
                            <span>{t.shipping}</span>
                        </div>
                        <img
                            className={`downIcon ${openSubmenu === "shipping" ? "rotate" : ""}`}
                            src={DownIcon}
                            alt="DownIcon"
                        />
                    </div>
                    {openSubmenu === "shipping" && (
                        <ul className="submenu">
                            <li
                                className={activeItem === "post-office" ? "active" : ""}
                                onClick={() => handleItemClick("post-office", "/post-office")}
                            >
                                {language === 'en' ? 'Post Office List' : 'Danh sách bưu cục'}
                            </li>
                            <li
                                className={activeItem === "shipping-list" ? "active" : ""}
                                onClick={() => handleItemClick("shipping-list", "/shipping-list")}
                            >
                                {language === 'en' ? 'Shipping List' : 'Danh sách vận đơn'}
                            </li>
                        </ul>
                    )}
                </li>

                <li
                    className={`menu-item ${activeItem === "promotion" ? "active" : ""}`}
                    onClick={() => handleItemClick("promotion", "/promotion")}
                >
                    <div className="menu-no">
                        <img className="icon" src={Promotion} alt="Promotion" />
                        <span>{t.promotions}</span>
                    </div>
                </li>
            </ul>

            <div className="down-sidebar">
                <li
                    className={`menu-item ${activeItem === "setting" ? "active" : ""}`}
                    onClick={() => handleItemClick("setting", "/setting")}
                >
                    <div className="menu-no">
                        <img className="icon" src={Setting} alt="Setting" />
                        <span>{t.settings}</span>
                    </div>
                </li>
                <li
                    className={`menu-item ${activeItem === "profile" ? "active" : ""}`}
                    onClick={() => handleItemClick("profile", "/profile")}
                >
                    <div className="menu-no">
                        <img className="icon" src={Profile} alt="Profile" />
                        <span>{t.profile}</span>
                    </div>
                </li>
                <li
                    className={`menu-item logout ${activeItem === "logout" ? "active" : ""}`}
                    onClick={handleLogout}
                >
                    <div className="menu-no">
                        <img className="icon" src={Logout} alt="Logout" />
                        <span>{t.logout}</span>
                    </div>
                </li>
            </div>
        </div>
    );
};

export default Sidebar;
