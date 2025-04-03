import React, { useState, useRef, useEffect } from "react";
import "./customer.scss";
import { useNavigate } from "react-router-dom";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import { customers } from "../../mock/mock"; 

const Customer = () => {
    const navigate = useNavigate();
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

    const handleDelete = () => {
        alert("Xóa khách hàng");
        setIsDropdownOpen(false);
    };

    const handleExport = () => {
        alert("Xuất danh sách khách hàng!");
        setIsDropdownOpen(false);
    };

    const filteredCustomers = customers
    .filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.id.toString().includes(searchQuery)
    )
    .filter((customer) => 
        filterType === "all" ? true : customer.id === parseInt(filterType)
    )
    .filter((customer) => customer.name.toLowerCase().includes(filterName.toLowerCase()));

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedCustomers(newSelectAll ? filteredCustomers.map(c => c.id) : []);  
    };

    const handleSelectCustomer = (id) => {
        let updatedSelection = selectedCustomers.includes(id)
            ? selectedCustomers.filter((customerId) => customerId !== id)
            : [...selectedCustomers, id];

        setSelectedCustomers(updatedSelection);
        setSelectAll(updatedSelection.length === filteredCustomers.length);  
    };

    const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex); 

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
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
                        {[...new Set(customers.map(c => c.id))].map(type => (  
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
                <button className="reset-filter" onClick={() => { setFilterType("all"); setFilterName(""); }}>Xóa lọc</button>
            </div>

            <table className="order-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>Mã</th>
                        <th>Tên khách hàng</th>  
                        <th>Điện thoại</th>
                        <th>Email</th>
                        <th>Đơn mua</th> {/* This column now shows the number of orders */}
                        <th>Địa chỉ</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedCustomers.map((customer) => (  
                        <tr key={customer.id}>
                            <td><input type="checkbox" checked={selectedCustomers.includes(customer.id)} onChange={() => handleSelectCustomer(customer.id)} /></td>
                            <td>{customer.id}</td>
                            <td>{customer.name}</td>  
                            <td>{customer.phone}</td>  
                            <td>{customer.mail}</td>  
                            <td>{customer.invoices.length}</td> 
                            <td>{customer.address}</td>  
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/customer/${customer.id}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                <button className="btn-icon"><img src={editIcon} alt="Sửa" /> Sửa</button>
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
