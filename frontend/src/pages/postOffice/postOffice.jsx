import React, { useState, useRef, useEffect, useMemo } from "react";
import apiAuth from "../../api/apiAuth";
import "./postOffice.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import { exportPostOfficesToPDF } from "../../utils/pdfUtils";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import postOfficeRepository from "../../api/apiPostOffice";

const PostOffice = () => {
    const navigate = useNavigate();
    const currentUser = useMemo(() => {
        const user = apiAuth.getCurrentUser();
        console.log('Current user:', user);
        return user;
    }, []);
    const isStaff = currentUser?.userType === 'staff';
    console.log('Is staff:', isStaff);
    const { language } = useLanguage();
    const t = translations[language];
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
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

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

    const handleDelete = () => {
        if (selectedPostOffices.length === 0) {
            toast.warning(t.selectPostOfficeToDelete);
            return;
        }
        setShowConfirmPopup(true);
        setIsDropdownOpen(false);
    };

    const handleConfirmDelete = async () => {
        try {
            await Promise.all(
                selectedPostOffices.map(id => 
                    postOfficeRepository.api.delete(`/post-offices/${id}`)
                )
            );
            await fetchPostOffices();
            setSelectedPostOffices([]);
            toast.success(t.deletePostOfficeSuccess);
        } catch (error) {
            console.error("Failed to delete post offices:", error);
            toast.error(t.deletePostOfficeFailed);
        } finally {
            setShowConfirmPopup(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmPopup(false);
    };

    const handleExport = () => {
        if (selectedPostOffices.length === 0) {
            toast.warning(t.selectPostOfficeToExport);
            return;
        }

        const selectedOffices = postOffices.filter(office => selectedPostOffices.includes(office.ID));
        const result = exportPostOfficesToPDF(selectedOffices);
        if (result) {
            toast.success(t.exportPostOfficeSuccess);
        }
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
        .filter((office) => office.name.toLowerCase().includes(filterName.toLowerCase()))
        .sort((a, b) => a.ID - b.ID);

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
        <div className="page-container postOffice-container">
            <h2 className="title">{t.postOfficeList}</h2>

            <div className="top-actions">
                <div className="search-container">
                    <img src={searchIcon} alt={t.search} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t.search}
                        className="search-bar"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {!isStaff && (
                    <div className="button">
                        <button className="btn add" onClick={() => navigate("/create-postOffice")}>{t.add}</button>
                        <div className="dropdown" ref={dropdownRef}>
                            <button className="btn action" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                {t.actions}
                                <img src={downIcon} alt="▼" className="icon-down" />
                            </button>
                            {isDropdownOpen && (
                                <ul className="dropdown-menu">
                                    <li className="dropdown-item" onClick={handleDelete}>
                                        <img src={deleteIcon} alt={t.delete} /> {t.delete}
                                    </li>
                                    <li className="dropdown-item" onClick={handleExport}>
                                        <img src={exportIcon} alt={t.export} /> {t.export}
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="filter">
                <div className="select-wrapper">
                    <select
                        className="filter-type"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">{t.postOfficeCode}</option>
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
                        <option value="">{t.postOfficeName}</option>
                        {[...new Set(postOffices.map(c => c.name))].map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <button className="reset-filter" onClick={() => { setFilterType("all"); setFilterName(""); }}>{t.resetFilter}</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>{t.loading}</div>
            ) : (
                <table className="order-table">
                    <thead>
                        <tr>
                            {!isStaff && <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>}
                            <th>{t.postOfficeCode}</th>
                            <th>{t.postOfficeName}</th>
                            <th>{t.phone}</th>
                            <th>{t.address}</th>
                            <th>{t.action}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPostOffices.map((office) => (
                            <tr key={office.ID}>
                                {!isStaff && <td><input type="checkbox" checked={selectedPostOffices.includes(office.ID)} onChange={() => handleSelectPostOffice(office.ID)} /></td>}
                                <td>{office.ID}</td>
                                <td>{office.name}</td>
                                <td>{office.phoneNumber}</td>
                                <td>{office.address}</td>
                                <td className="action-buttons">
                                    <button className="btn-icon" onClick={() => navigate(`/postOffice/${office.ID}`)}><img src={viewIcon} alt={t.view} /> {t.view}</button>
                                    {!isStaff && (
                                        <button className="btn-icon" onClick={() => navigate(`/postOffice/${office.ID}?edit=true`)}><img src={editIcon} alt={t.edit} /> {t.edit}</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="pagination-container">
                <div className="pagination-left">
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value={5}>5 {t.rows}</option>
                        <option value={10}>10 {t.rows}</option>
                        <option value={15}>15 {t.rows}</option>
                    </select>
                    <span>
                        {t.showing} {startIndex + 1}-{Math.min(endIndex, filteredPostOffices.length)} {t.of} {filteredPostOffices.length} {t.postOffices}
                    </span>
                </div>
                <div className="pagination">
                    <button className="btn-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button key={index + 1} className={`btn-page ${currentPage === index + 1 ? "active" : ""}`} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                    ))}
                    <button className="btn-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>{">"}</button>
                </div>
            </div>

            <ConfirmPopup
                isOpen={showConfirmPopup}
                message={t.deletePostOfficeConfirm}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
};

export default PostOffice;
