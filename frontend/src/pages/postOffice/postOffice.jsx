import React, { useState, useRef, useEffect } from "react";
import "./postOffice.scss";
import { useNavigate } from "react-router-dom";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import postOfficeRepository from "../../api/apiPostOffice";

const PostOffice = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedPostOffices, setSelectedPostOffices] = useState([]);  
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterType, setFilterType] = useState("all");
    const [filterName, setFilterName] = useState("");
    const [postOffices, setPostOffices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPostOffices();
    }, []);

    const fetchPostOffices = async () => {
        try {
            const response = await postOfficeRepository.getAll();
            setPostOffices(response);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch post offices:", error);
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
        if (selectedPostOffices.length === 0) {
            alert("Vui lòng chọn bưu cục cần xóa!");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa các bưu cục đã chọn?")) {
            try {
                await Promise.all(selectedPostOffices.map(id => postOfficeRepository.delete(id)));
                await fetchPostOffices();
                setSelectedPostOffices([]);
                alert("Xóa bưu cục thành công!");
            } catch (error) {
                console.error("Failed to delete post offices:", error);
                alert("Xóa bưu cục thất bại!");
            }
        }
        setIsDropdownOpen(false);
    };

    const handleExport = () => {
        alert("Xuất danh sách bưu cục!");
        setIsDropdownOpen(false);
    };

    const filteredPostOffices = postOffices
    .filter((office) =>
        office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        office.ID.toString().includes(searchQuery)
    )
    .filter((office) => 
        filterType === "all" ? true : office.ID === parseInt(filterType)
    )
    .filter((office) => office.name.toLowerCase().includes(filterName.toLowerCase()));

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedPostOffices(newSelectAll ? filteredPostOffices.map(c => c.ID) : []);  
    };

    const handleSelectPostOffice = (ID) => {
        let updatedSelection = selectedPostOffices.includes(ID)
            ? selectedPostOffices.filter((officeId) => officeId !== ID)
            : [...selectedPostOffices, ID];

        setSelectedPostOffices(updatedSelection);
        setSelectAll(updatedSelection.length === filteredPostOffices.length);  
    };

    const totalPages = Math.ceil(filteredPostOffices.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPostOffices = filteredPostOffices.slice(startIndex, endIndex); 

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="postOffice-container">  
            <h2 className="title">Danh sách bưu cục</h2>  

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
                    <button className="btn add" onClick={() => navigate("/create-postOffice")}>Thêm mới</button>  
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
                        <option value="all">Mã bưu cục</option>
                        {[...new Set(postOffices.map(c => c.ID))].sort((a, b) => a - b).map(id => (
                            <option key={id} value={id}>{id}</option>
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
                        <option value="">Tên bưu cục</option>  
                        {[...new Set(postOffices.map(c => c.name))].map(name => (  
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <button className="reset-filter" onClick={() => { setFilterType("all"); setFilterName(""); }}>Xóa lọc</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</div>
            ) : (
                <table className="order-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>Mã</th>
                        <th>Tên bưu cục</th>  
                        <th>Điện thoại</th>
                        <th>Địa chỉ</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedPostOffices.map((office) => (  
                        <tr key={office.ID}>
                            <td><input type="checkbox" checked={selectedPostOffices.includes(office.ID)} onChange={() => handleSelectPostOffice(office.ID)} /></td>
                            <td>{office.ID}</td>
                            <td>{office.name}</td>  
                            <td>{office.phoneNumber}</td>  
                            <td>{office.address}</td>  
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/postOffice/${office.ID}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                <button className="btn-icon" onClick={() => navigate(`/edit-postOffice/${office.ID}`)}><img src={editIcon} alt="Sửa" /> Sửa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            )}

            <div className="pagination-container">
                <div className="pagination-left">
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value={5}>5 hàng</option>
                        <option value={10}>10 hàng</option>
                        <option value={15}>15 hàng</option>
                    </select>
                    <span>Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredPostOffices.length)} trong tổng số {filteredPostOffices.length} bưu cục</span>  
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

export default PostOffice;
