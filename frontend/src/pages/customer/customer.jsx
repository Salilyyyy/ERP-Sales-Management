import React, { useState, useRef, useEffect } from "react";
import "./customer.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import CustomerRepository from "../../api/apiCustomer";

const Customer = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterType, setFilterType] = useState("all");
    const [filterName, setFilterName] = useState("");

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setIsLoading(true);
                const data = await CustomerRepository.getAll();
                console.log('API Response:', data);
                console.log('Is Array?', Array.isArray(data));
                console.log('Data length:', data ? data.length : 0);
                setCustomers(data || []);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomers();
    }, []);

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

    if (isLoading) {
        return <div className="customer-container">Loading...</div>;
    }

    if (error) {
        return <div className="customer-container">Error: {error}</div>;
    }

    if (!Array.isArray(customers)) {
        console.error('Customers is not an array:', customers);
        return <div className="customer-container">Lỗi: Dữ liệu không hợp lệ</div>;
    }

    if (customers.length === 0) {
        return <div className="customer-container">Không có dữ liệu khách hàng để hiển thị.</div>;
    }

    
    const filteredCustomers = customers
        .filter((customer) => {
            const nameMatch = (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const idMatch = customer.ID ? customer.ID.toString().includes(searchQuery) : false;
            console.log(`Search filter for ${customer.name}: nameMatch=${nameMatch}, idMatch=${idMatch}`);
            return nameMatch || idMatch;
        })
        .filter((customer) => {
            const typeMatch = filterType === "all" ? true : customer.ID === parseInt(filterType);
            console.log(`Type filter for ${customer.name}: typeMatch=${typeMatch}`);
            return typeMatch;
        })
        .filter((customer) => {
            const nameFilterMatch = filterName === "" ? true : (customer.name || '').toLowerCase().includes(filterName.toLowerCase());
            console.log(`Name filter for ${customer.name}: nameFilterMatch=${nameFilterMatch}`);
            return nameFilterMatch;
        });

    console.log('After filtering - filteredCustomers:', filteredCustomers);
    
    const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    const handleDelete = async () => {
        if (selectedCustomers.length === 0) {
            toast.warning("Vui lòng chọn khách hàng cần xóa");
            return;
        }
        try {
            await CustomerRepository.deleteMultiple(selectedCustomers);
            const updatedCustomers = await CustomerRepository.getAll();
            setCustomers(Array.isArray(updatedCustomers) ? updatedCustomers : []);
            setSelectedCustomers([]);
            setSelectAll(false);
            toast.success("Xóa khách hàng thành công");
        } catch (error) {
            toast.error("Xóa khách hàng thất bại: " + error.message);
        }
        setIsDropdownOpen(false);
    };

    const handleExport = async () => {
        try {
            const data = await CustomerRepository.export();
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'customers.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error("Xuất danh sách thất bại: " + error.message);
        }
        setIsDropdownOpen(false);
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedCustomers(newSelectAll ? filteredCustomers.map(c => c.ID) : []);
    };

    const handleSelectCustomer = (id) => {
        const updatedSelection = selectedCustomers.includes(id)
            ? selectedCustomers.filter((customerId) => customerId !== id)
            : [...selectedCustomers, id];
        setSelectedCustomers(updatedSelection);
        setSelectAll(updatedSelection.length === filteredCustomers.length);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleViewInvoices = (customerId) => {
        navigate(`/customer/${customerId}`);
    };

    return (
        <div className="customer-container">
            <h2 className="title">Danh sách khách hàng</h2>

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
                    <button className="btn add" onClick={() => navigate("/create-customer")}>Thêm mới</button>
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
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Mã khách hàng</option>
                        {[...new Set(customers.map(c => c.ID))].map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <div className="select-wrapper">
                    <select
                        className="filter-name"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    >
                        <option value="">Tên khách hàng</option>
                        {[...new Set(customers.map(c => c.name))].map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <button className="reset-filter" onClick={() => {
                    setFilterType("all");
                    setFilterName("");
                }}>Xóa lọc</button>
            </div>

            <table className="order-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>Mã</th>
                        <th>Tên khách hàng</th>
                        <th>Điện thoại</th>
                        <th>Email</th>
                        <th>Đơn mua</th>
                        <th>Địa chỉ</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedCustomers.map((customer) => (
                        <tr key={customer.ID}>
                            <td><input type="checkbox" checked={selectedCustomers.includes(customer.ID)} onChange={() => handleSelectCustomer(customer.ID)} /></td>
                            <td>{customer.ID}</td>
                            <td>{customer.name}</td>
                            <td>{customer.phoneNumber}</td>
                            <td>{customer.email}</td>
                            <td>{customer.Invoices?.length || 0}</td>
                            <td>
                                {customer.address && customer.address.split(',').map((part, index) => (
                                    <React.Fragment key={index}>
                                        {part.trim()}
                                        {index < customer.address.split(',').length - 1 ? ', ' : ''}
                                    </React.Fragment>
                                ))}
                            </td>
                            <td className="action-buttons">
                <button className="btn-icon" onClick={() => handleViewInvoices(customer.ID)}><img src={viewIcon} alt="Xem" /> Xem</button>
                <button className="btn-icon" onClick={() => navigate(`/customer/${customer.ID}?edit=true`)}><img src={editIcon} alt="Sửa" /> Sửa</button>
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
                    <span>Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} trong tổng số {filteredCustomers.length} khách hàng</span>
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

export default Customer;
