import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./invoices.scss";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import BaseRepository from "../../api/baseRepository";

import checkIcon from "../../assets/img/tick-icon.svg";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";

import InvoiceRepository from "../../api/apiInvoice";
import AuthRepository from "../../api/apiAuth";

const Invoices = () => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [invoices, setInvoices] = useState([]);
    const [error, setError] = useState(null);

    // Get loading state from BaseRepository
    const requestKey = '/invoices';
    const isLoading = BaseRepository.getLoadingState(requestKey);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

    const [selectAll, setSelectAll] = useState(false);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (!AuthRepository.isAuthenticated()) {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInvoices();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, currentPage, rowsPerPage]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await InvoiceRepository.getAll({
                page: currentPage,
                limit: rowsPerPage,
                customerID: searchQuery || undefined,
                sortBy: 'exportTime',
                sortOrder: 'desc',
            });

            if (response.success && Array.isArray(response.data)) {
                console.log("Invoices:", response.data);
                setInvoices(response.data);
                setTotalItems(response.pagination.total || 0);
                setError(null);
            } else {
                setInvoices([]);
                setError("Dữ liệu không hợp lệ");
            }
        } catch (error) {
            console.error("Lỗi khi lấy hóa đơn:", error);
            setInvoices([]);
            setError("Không thể kết nối đến máy chủ");
        }
    };

    const handleSelectAll = () => {
        const checked = !selectAll;
        setSelectAll(checked);
        setSelectedInvoices(checked ? invoices.map((inv) => inv.id) : []);
    };

    const handleSelectInvoice = (id) => {
        const updated = selectedInvoices.includes(id)
            ? selectedInvoices.filter((invID) => invID !== id)
            : [...selectedInvoices, id];
        setSelectedInvoices(updated);
        setSelectAll(updated.length === invoices.length);
    };

    const handleDelete = async () => {
        try {
            await Promise.all(selectedInvoices.map((id) => InvoiceRepository.delete(id)));
            alert("Xóa đơn hàng thành công!");
            setSelectedInvoices([]);
            fetchInvoices();
        } catch (error) {
            console.error("Xóa lỗi:", error);
            alert("Không thể xóa đơn hàng!");
        }
        setIsDropdownOpen(false);
    };

    const handleExport = () => {
        alert("Tính năng xuất đơn hàng đang phát triển.");
        setIsDropdownOpen(false);
    };

    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="invoices">
            <h2 className="title">Danh sách đơn hàng</h2>

            <div className="top-actions">
                <div className="search-container">
                    <img src={searchIcon} alt="Search" className="search-icon" />
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Tìm kiếm ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="button">
                    <button className="btn add" onClick={() => navigate("/create-invoice")}>
                        Thêm mới
                    </button>

                    <div className="dropdown" ref={dropdownRef}>
                        <button className="btn action" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            Hành động <img src={downIcon} alt="▼" />
                        </button>
                        {isDropdownOpen && (
                            <ul className="dropdown-menu">
                                <li className="dropdown-item" onClick={handleDelete}>
                                    <img src={deleteIcon} alt="Xóa" /> Xóa
                                </li>
                                <li className="dropdown-item" onClick={handleExport}>
                                    <img src={exportIcon} alt="Xuất" /> Xuất
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <>
                    <table className="order-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                                    <th>Mã</th>
                                    <th>Thời gian</th>
                                    <th>Khách hàng</th>
                                    <th>Tổng thanh toán</th>
                                    <th>Thanh toán</th>
                                    <th>Giao hàng</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 && (
                                    <tr key="empty-row">
                                        <td colSpan="8" className="text-center">Không có dữ liệu</td>
                                    </tr>
                                )}
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td><input type="checkbox" checked={selectedInvoices.includes(inv.id)} onChange={() => handleSelectInvoice(inv.id)} /></td>
                                        <td>{inv.id}</td>
                                        <td>{inv.createdAt ? new Date(inv.createdAt).toLocaleString("vi-VN") : "N/A"}</td>
                                        <td>{inv.customerName}</td>
                                        <td>{Number(inv.totalAmount).toLocaleString("vi-VN")} VND</td>
                                        <td>{inv.isPaid && <img src={checkIcon} alt="✓" className="icon-check" />}</td>
                                        <td>{inv.isDelivery && <img src={checkIcon} alt="✓" className="icon-check" />}</td>
                                        <td className="action-buttons">
                                            <button className="btn-icon" onClick={() => navigate(`/invoice/${inv.id}`)}>
                                                <img src={viewIcon} alt="Xem" /> Xem
                                            </button>
                                            <button className="btn-icon" onClick={() => navigate(`/edit-invoice/${inv.id}`)}>
                                                <img src={editIcon} alt="Sửa" /> Sửa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                    </table>
                    <div className="pagination-container">
                        <div className="pagination-left">
                            <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                                <option value={5}>5 hàng</option>
                                <option value={10}>10 hàng</option>
                                <option value={15}>15 hàng</option>
                            </select>
                            <span>
                                Hiển thị {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, totalItems)} trên {totalItems}
                            </span>
                        </div>

                        <div className="pagination">
                            <button className="btn-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={`page-${i + 1}`}
                                    className={`btn-page ${currentPage === i + 1 ? "active" : ""}`}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button className="btn-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>{">"}</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Invoices;
