import React, { useState, useRef, useEffect } from "react";
import "./invoices.scss";
import { useNavigate } from "react-router-dom";
import checkIcon from "../../assets/img/tick-icon.svg";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import InvoiceRepository from "../../api/apiInvoice";

const Invoices = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await InvoiceRepository.getAll();
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDelete = async () => {
        try {
            await Promise.all(selectedInvoices.map(id => InvoiceRepository.delete(id)));
            setSelectedInvoices([]);
            await fetchInvoices();
            alert("Xóa đơn hàng thành công!");
        } catch (error) {
            console.error('Error deleting invoices:', error);
            alert("Có lỗi xảy ra khi xóa đơn hàng!");
        }
        setIsDropdownOpen(false);
    };

    const handleExport = () => {
        // TODO: Implement export functionality
        alert("Tính năng xuất đơn hàng đang được phát triển!");
        setIsDropdownOpen(false);
    };

    const filteredInvoices = invoices.filter((invoice) =>
        invoice.customerID?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.ID?.toString().includes(searchQuery)
    );

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedInvoices(newSelectAll ? filteredInvoices.map(inv => inv.ID) : []);
    };

    const handleSelectInvoice = (ID) => {
        let updatedSelection = selectedInvoices.includes(ID)
            ? selectedInvoices.filter((invoiceId) => invoiceId !== ID)
            : [...selectedInvoices, ID];

        setSelectedInvoices(updatedSelection);
        setSelectAll(updatedSelection.length === filteredInvoices.length);
    };

    const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

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
                    <img src={searchIcon} alt="Tìm kiếm" className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm ..."
                        className="search-bar"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="button">
                <button className="btn add" onClick={() => navigate("/create-invoice")}>Thêm mới</button>

                    <div className="dropdown" ref={dropdownRef}>
                        <button className="btn action" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            Hành động
                            <img src={downIcon} alt="▼" className="icon-down" />
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

            <table className="order-table">
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                        </th>
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
                    {loading ? (
                        <tr>
                            <td colSpan="8" style={{textAlign: "center"}}>Đang tải dữ liệu...</td>
                        </tr>
                    ) : paginatedInvoices.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{textAlign: "center"}}>Không có dữ liệu</td>
                        </tr>
                    ) : paginatedInvoices.map((invoice) => (
                        <tr key={invoice.ID}>
                            <td>
                                <input type="checkbox" checked={selectedInvoices.includes(invoice.ID)} onChange={() => handleSelectInvoice(invoice.ID)} />
                            </td>
                            <td>{invoice.ID}</td>
                            <td>{invoice.exportTime}</td>
                            <td>{invoice.customerID}</td>
                            <td>{invoice.total || 0} VND</td>
                            <td>{invoice.paymentMethod ? <img src={checkIcon} alt="✔" className="icon-check" /> : ""}</td>
                            <td>{invoice.shipped ? <img src={checkIcon} alt="✔" className="icon-check" /> : ""}</td>
                            <td className="action-buttons">
                            <button className="btn-icon" onClick={() => navigate(`/invoice/${invoice.ID}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                <button className="btn-icon" onClick={() => navigate(`/edit-invoice/${invoice.ID}`)}><img src={editIcon} alt="Sửa" /> Sửa</button>
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
                    <span>Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredInvoices.length)} trong tổng số {filteredInvoices.length} đơn hàng</span>
                </div>
                <div className="pagination">
                    <button className="btn-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button key={index + 1} className={`btn-page ${currentPage === index + 1 ? "active" : ""}`} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                    ))}
                    <button className="btn-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>{">"}</button>
                </div>

            </div>
        </div>
    );
};

export default Invoices;
