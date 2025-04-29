import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import "./shipping.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import apiShipping from "../../api/apiShipping";
import apiInvoice from "../../api/apiInvoice";

const Shipping = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedShippings, setSelectedShippings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterType, setFilterType] = useState("");
    const [filterName, setFilterName] = useState("");
    const [shippingData, setShippingData] = useState([]);
    const [invoiceData, setInvoiceData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const timeoutPromise = (ms) => new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
            );

            const fetchShipping = Promise.race([
                apiShipping.getAll(),
                timeoutPromise(10000)
            ]);

            const fetchInvoices = Promise.race([
                apiInvoice.getAll(),
                timeoutPromise(10000)
            ]);

            const [shippingResponse, invoicesResponse] = await Promise.all([
                fetchShipping,
                fetchInvoices
            ]);

            console.log('Raw invoices response:', invoicesResponse);
            const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : invoicesResponse?.data || [];
            console.log('Processed invoices:', invoices);
            const invoiceMap = {};
            invoices.forEach(invoice => {
                if (invoice?.id) {
                    invoiceMap[invoice.id] = invoice;
                }
            });
            console.log('Created invoice map:', invoiceMap);
            setInvoiceData(invoiceMap);
            console.log('Raw shipping response:', shippingResponse);
            const shippings = Array.isArray(shippingResponse) ? shippingResponse : shippingResponse?.data || [];
            console.log('Processed shipping data:', shippings);
            setShippingData(shippings);
            console.log('State updated with shipping data:', shippings.length, 'records');
            setError(null);
        } catch (err) {
            const errorMessage = err.message.includes('timed out')
                ? 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
                : err.message;
            setError(errorMessage);
            console.error("Failed to fetch data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchShippingData = async () => {
        try {
            setIsLoading(true);
            const timeoutPromise = (ms) => new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
            );

            const response = await Promise.race([
                apiShipping.getAll(),
                timeoutPromise(10000)
            ]);
            console.log('Raw shipping response:', response);
            const shippings = Array.isArray(response) ? response : response?.data || [];
            console.log('Processed shipping data:', shippings);
            setShippingData(shippings);
            console.log('State updated with shipping data:', shippings.length, 'records');
            setError(null);
        } catch (err) {
            const errorMessage = err.message.includes('timed out')
                ? 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
                : err.message;
            setError(errorMessage);
            console.error("Failed to fetch shipping data:", err);
        } finally {
            setIsLoading(false);
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
        if (selectedShippings.length === 0) {
            toast.warning("Vui lòng chọn vận đơn để xóa");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa các vận đơn đã chọn?")) {
            try {
                for (const id of selectedShippings) {
                    await apiShipping.delete(id);
                }
                await fetchShippingData();
                setSelectedShippings([]);
                setSelectAll(false);
                toast.success("Xóa vận đơn thành công");
            } catch (err) {
                toast.error("Xóa vận đơn thất bại: " + err.message);
            }
        }
        setIsDropdownOpen(false);
    };

    const handleExport = () => {
        toast.success("Đã xuất danh sách vận chuyển!");
        setIsDropdownOpen(false);
    };

    if (isLoading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="error">Lỗi: {error}</div>;
    }

    console.log('Starting filtering with shippingData:', shippingData);
    const filteredShippings = (shippingData || [])
        .filter((ship) => {
            const searchMatch = ship?.receiverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ship?.ID?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                ship?.invoiceID?.toString().toLowerCase().includes(searchQuery.toLowerCase());
            return searchMatch;
        })
        .filter((ship) => {
            const shipId = ship?.ID?.toString();
            const selectedId = filterType?.toString();
            const typeMatch = filterType === "" ? true : shipId === selectedId;
            console.log('Filtering by type:', { shipId, filterType: selectedId, matches: typeMatch });
            return typeMatch;
        })
        .filter((ship) => {
            const nameMatch = filterName === "" ? true : ship?.receiverName?.toLowerCase().includes(filterName.toLowerCase());
            return nameMatch;
        });
    console.log('Final filtered shippings:', filteredShippings);


    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedShippings(newSelectAll ? filteredShippings.map(ship => ship.ID) : []);
    };

    const handleSelectShipping = (id) => {
        let updatedSelection = selectedShippings.includes(id)
            ? selectedShippings.filter((shippingId) => shippingId !== id)
            : [...selectedShippings, id];

        setSelectedShippings(updatedSelection);
        setSelectAll(updatedSelection.length === filteredShippings.length);
    };

    const totalPages = Math.ceil(filteredShippings.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedShippings = filteredShippings.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="shipping-container">
            <h2 className="title">Danh sách vận đơn</h2>

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
                    <button className="btn add" onClick={() => navigate("/create-shipping")}>Thêm mới</button>
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

            <div className="filter">
                <div className="select-wrapper">
                    <select
                        className="filter-type"
                        value={filterType}
                        onChange={(e) => {
                            console.log('Selected filter type:', e.target.value);
                            setFilterType(e.target.value);
                        }}
                    >
                        <option value="">Chọn mã đơn hàng</option>
                        {[...new Set(shippingData.map(ship => ship.ID))].sort().map(type => {
                            console.log('Adding option:', { type, value: type?.toString() });
                            return <option key={type} value={type?.toString()}>{type?.toString()}</option>;
                        })}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <div className="select-wrapper">
                    <select
                        className="filter-name"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    >
                        <option value="">Người nhận</option>
                        {[...new Set(shippingData.map(ship => ship.receiverName))].map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <button className="reset-filter" onClick={() => { setFilterType(""); setFilterName(""); }}>Xóa lọc</button>
            </div>

            <table className="order-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>Mã đơn hàng</th>
                        <th>Đơn vị vận chuyển</th>
                        <th>Người nhận</th>
                        <th>Mã vận đơn</th>
                        <th>Thời gian gửi</th>
                        <th>Dự kiến giao</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedShippings.map((ship) => (
                        <tr key={ship.ID}>
                            <td><input type="checkbox" checked={selectedShippings.includes(ship.ID)} onChange={() => handleSelectShipping(ship.ID)} /></td>
                            <td>{ship.ID}</td>
                            <td>{ship.PostOffices?.name || "Không xác định"}</td>
                            <td>{ship.receiverName}</td>
                            <td>{ship.invoiceID}</td>
                            <td>{ship.sendTime ? moment(ship.sendTime).format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                            <td>{ship.receiveTime ? moment(ship.receiveTime).format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                            <td>{ship.payer}</td>
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/shipping/${ship.ID}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                <button className="btn-icon" onClick={() => navigate(`/shipping/${ship.ID}?edit=true`)}><img src={editIcon} alt="Sửa" /> Sửa</button>
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
                    <span>Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredShippings.length)} trong tổng số {filteredShippings.length} vận chuyển</span>
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

export default Shipping;
