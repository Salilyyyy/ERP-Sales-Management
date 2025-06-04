import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "./shipping.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import ShippingTemplate from "../../components/shippingTemplate/shippingTemplate";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import apiShipping from "../../api/apiShipping";
import apiInvoice from "../../api/apiInvoice";
import apiPostOffice from "../../api/apiPostOffice";

const Shipping = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedShippings, setSelectedShippings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterType, setFilterType] = useState("");
    const [filterName, setFilterName] = useState("");
    const [filterPostOffice, setFilterPostOffice] = useState("");
    const [shippingData, setShippingData] = useState([]);
    const [invoiceData, setInvoiceData] = useState({});
    const [postOffices, setPostOffices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
        fetchPostOffices();
    }, []);

    const fetchPostOffices = async () => {
        try {
            const response = await makeRequest(signal => apiPostOffice.getAll(signal));
            const offices = processResponse(response);
            setPostOffices(offices);
        } catch (error) {
            console.error("Failed to fetch post offices:", error);
            toast.error(t.loadError);
        }
    };

    // Utility function for handling API requests with timeout and retry
    const makeRequest = async (request, timeout = 30000, maxRetries = 3) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await request(controller.signal);
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log(`Request attempt ${attempt} timed out`);
                } else {
                    console.error(`Request attempt ${attempt} failed:`, error);
                }

                if (attempt === maxRetries) {
                    throw new Error(error.message);
                }

                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    };

    const processResponse = (response) => {
        if (!response) return [];
        return Array.isArray(response) ? response : response?.data || [];
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [shippingResponse, invoicesResponse] = await Promise.all([
                makeRequest(signal => apiShipping.getAll(signal)),
                makeRequest(signal => apiInvoice.getAll(signal))
            ]);

            const shippings = processResponse(shippingResponse);
            setShippingData(shippings);

            const invoices = processResponse(invoicesResponse);
            const invoiceMap = invoices.reduce((acc, invoice) => {
                if (invoice?.id) {
                    acc[invoice.id] = invoice;
                }
                return acc;
            }, {});
            setInvoiceData(invoiceMap);

        } catch (error) {
            const errorMessage = error.name === 'AbortError'
                ? t.loadError
                : error.message;
            setError(errorMessage);
            console.error("Failed to fetch data:", error);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchShippingData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await makeRequest(signal => apiShipping.getAll(signal));
            const shippings = processResponse(response);
            setShippingData(shippings);
        } catch (error) {
            const errorMessage = error.name === 'AbortError'
                ? t.loadError
                : error.message;
            setError(errorMessage);
            console.error("Failed to fetch shipping data:", error);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        return () => {
            controller.abort();
        };
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

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedShippingData, setSelectedShippingData] = useState(null);
    const shippingTemplateRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const handleDelete = () => {
        if (selectedShippings.length === 0) {
            toast.warning(t.selectToDelete);
            return;
        }
        setShowDeleteConfirm(true);
    };

    const getDetailedShippingData = async (id) => {
        try {
            const detailedData = await apiShipping.getById(id);
            console.log(`Fetched detailed data for shipping ${id}:`, detailedData);

            if (!detailedData) {
                throw new Error("No data returned from API");
            }

            const invoiceDetails = await apiInvoice.getById(detailedData.invoiceID);

            const processedData = {
                ...detailedData,
                PostOffices: detailedData.PostOffices || {},
                sendTime: detailedData.sendTime || null,
                receiveTime: detailedData.receiveTime || null,
                status: detailedData.status || 'Pending',
                shippingCost: detailedData.shippingCost || 0,
                receiverName: detailedData.receiverName || 'N/A',
                receiverPhone: detailedData.receiverPhone || 'N/A',
                receiverAddress: detailedData.receiverAddress || 'N/A',
                receiverCity: detailedData.receiverCity || 'N/A',
                invoice: invoiceDetails
            };

            console.log(`Processed shipping data ${id}:`, processedData);
            return processedData;
        } catch (error) {
            console.error(`Error fetching detailed data for shipping ${id}:`, error);
            toast.error(t.loadError);
            return null;
        }
    };

    const handleExport = async () => {
        if (selectedShippings.length === 0) {
            toast.warning(t.selectToExport);
            return;
        }

        try {
            setIsPrinting(true);

            const detailedDataPromises = selectedShippings.map(id => getDetailedShippingData(id));
            const detailedResults = await Promise.all(detailedDataPromises);
            const selectedData = detailedResults.filter(data => data !== null);

            if (!selectedData.length) {
                toast.error(t.loadError);
                return;
            }

            const doc = new jsPDF('p', 'pt', 'a4');

            for (let i = 0; i < selectedData.length; i++) {
                const currentShipping = selectedData[i];
                console.log("Processing shipping data:", currentShipping);
                setSelectedShippingData(currentShipping);

                await new Promise(resolve => setTimeout(resolve, 500));

                if (i > 0) {
                    doc.addPage();
                }

                const canvas = await html2canvas(shippingTemplateRef.current, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    onclone: (document) => {
                        const element = document.querySelector('.shipping-template');
                        if (element) {
                            element.style.display = 'block';
                            element.style.width = '100%';
                            element.style.height = 'auto';
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pageWidth = doc.internal.pageSize.getWidth();
                const imgWidth = 515;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                const xOffset = (pageWidth - imgWidth) / 2;

                doc.addImage(imgData, 'JPEG', xOffset, 20, imgWidth, imgHeight, '', 'FAST');
            }

            doc.save(`shipping_export_${moment().format('YYYYMMDD_HHmmss')}.pdf`);
            setIsPrinting(false);
            setIsDropdownOpen(false);
            setSelectedShippingData(null);
            toast.success(t.exportSuccess);

        } catch (error) {
            console.error("Error exporting PDF:", error);
            toast.error(t.exportError);
            setIsPrinting(false);
        }
    };

    if (isLoading) {
        return <div className="loading">{t.loading}</div>;
    }

    if (error) {
        return <div className="error">{t.error}{error}</div>;
    }

    console.log('Starting filtering with shippingData:', shippingData);
    const filteredShippings = (shippingData || [])
        .filter(ship => {
            console.log("Checking ship:", ship);
            return ship?.receiverName;
        })
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
        })
        .filter((ship) => {
            const postOfficeMatch = filterPostOffice === "" ? true : ship?.postOfficeID === parseInt(filterPostOffice);
            return postOfficeMatch;
        });

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
        <div className="page-container shipping-container">
            <h2 className="title">{t.shippingList}</h2>

            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={shippingTemplateRef} style={{ width: '595px', background: '#fff', margin: '0 auto' }}>
                    {isPrinting && selectedShippingData && (
                        <ShippingTemplate
                            shipping={{
                                ...selectedShippingData,
                                id: selectedShippingData.ID,
                                date: selectedShippingData.sendTime,
                                sender: {
                                    name: 'ERP System',
                                    phone: '0123456789',
                                    address: '02 Quang Trung',
                                    city: 'Hải Châu, Đà Nẵng'
                                },
                                receiver: {
                                    name: selectedShippingData.receiverName || 'N/A',
                                    phone: selectedShippingData.receiverPhone || 'N/A',
                                    address: selectedShippingData.receiverAddress || 'N/A',
                                    city: selectedShippingData.receiverCity || 'N/A'
                                },
                                method: selectedShippingData.shippingMethod || "Standard Delivery",
                                status: selectedShippingData.status || 'Pending',
                                trackingNumber: selectedShippingData.trackingNumber || selectedShippingData.ID,
                                estimatedDelivery: selectedShippingData.receiveTime,
                                sendTime: selectedShippingData.sendTime,
                                receiveTime: selectedShippingData.receiveTime,
                                shippingCost: parseFloat(selectedShippingData.shippingCost) || 0,
                                insurance: parseFloat(selectedShippingData.insurance) || 0,
                                additionalFees: parseFloat(selectedShippingData.additionalFees) || 0,
                                totalCost: (
                                    parseFloat(selectedShippingData.shippingCost || 0) +
                                    parseFloat(selectedShippingData.insurance || 0) +
                                    parseFloat(selectedShippingData.additionalFees || 0)
                                ).toFixed(2)
                            }}
                            items={selectedShippingData.invoice?.InvoiceDetails?.map(detail => ({
                                description: detail.Products?.name || 'N/A',
                                quantity: detail.quantity || 0,
                                weight: detail.Products?.weight || 'N/A',
                                length: detail.Products?.length || 'N/A',
                                width: detail.Products?.width || 'N/A',
                                height: detail.Products?.height || 'N/A',
                                value: parseFloat(detail.price || 0)
                            })) || []}
                        />
                    )}
                </div>
            </div>

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

                <div className="button">
                    <button className="btn add" onClick={() => navigate("/create-shipping")}>{t.add}</button>
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
            </div>

            <ConfirmPopup
                isOpen={showDeleteConfirm}
                message={t.deleteConfirm(selectedShippings.length)}
                onConfirm={async () => {
                    try {
                        setIsLoading(true);
                        const results = await Promise.allSettled(
                            selectedShippings.map(async id => {
                                try {
                                    await apiShipping.delete(id);
                                    return { id, success: true };
                                } catch (err) {
                                    return {
                                        id,
                                        success: false,
                                        error: err.response?.data?.message || err.message
                                    };
                                }
                            })
                        );

                        const successes = results.filter(r => r.value?.success).length;
                        const failures = results.filter(r => !r.value?.success);

                        await fetchShippingData();
                        setSelectedShippings([]);
                        setSelectAll(false);
                        setIsDropdownOpen(false);

                        if (failures.length === 0) {
                            toast.success(t.deleteSuccess(successes));
                        } else if (successes === 0) {
                            toast.error(t.deleteFailed);
                            console.error("Delete errors:", failures.map(f => f.value?.error).join(", "));
                        } else {
                            toast.warning(t.deletePartial(successes, failures.length));
                            console.error("Partial delete errors:", failures.map(f => f.value?.error).join(", "));
                        }
                    } catch (error) {
                        console.error("Error in delete operation:", error);
                        toast.error(t.error + (error.response?.data?.message || error.message));
                    } finally {
                        setIsLoading(false);
                        setShowDeleteConfirm(false);
                    }
                }}
                onCancel={() => setShowDeleteConfirm(false)}
            />

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
                        <option value="">{t.selectShippingCode}</option>
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
                        <option value="">{t.receiver}</option>
                        {[...new Set(shippingData.map(ship => ship.receiverName))].map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <div className="select-wrapper">
                    <select
                        className="filter-postoffice"
                        value={filterPostOffice}
                        onChange={(e) => setFilterPostOffice(e.target.value)}
                    >
                        <option value="">{t.selectPostOffice}</option>
                        {postOffices
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(office => (
                                <option key={office.ID} value={office.ID}>{office.name}</option>
                            ))
                        }
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <button className="reset-filter" onClick={() => {
                    setFilterType("");
                    setFilterName("");
                    setFilterPostOffice("");
                }}>{t.resetFilter}</button>
            </div>

            <table className="order-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>{t.shippingCode}</th>
                        <th>{t.shippingUnit}</th>
                        <th>{t.receiver}</th>
                        <th>{t.trackingNumber}</th>
                        <th>{t.sendTime}</th>
                        <th>{t.expectedDelivery}</th>
                        <th>{t.status}</th>
                        <th>{t.action}</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedShippings.map((ship) => (
                        <tr key={ship.ID}>
                            <td><input type="checkbox" checked={selectedShippings.includes(ship.ID)} onChange={() => handleSelectShipping(ship.ID)} /></td>
                            <td>{ship.ID}</td>
                            <td>{ship.PostOffices?.name || t.unspecified}</td>
                            <td>{ship.receiverName}</td>
                            <td>{ship.invoiceID}</td>
                            <td>{ship.sendTime ? moment(ship.sendTime).format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                            <td>{ship.receiveTime ? moment(ship.receiveTime).format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                            <td>{ship.payer}</td>
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/shipping/${ship.ID}`)}><img src={viewIcon} alt={t.view} /> {t.view}</button>
                                <button className="btn-icon" onClick={() => navigate(`/shipping/${ship.ID}?edit=true`)}><img src={editIcon} alt={t.edit} /> {t.edit}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination-container">
                <div className="pagination-left">
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value={5}>5 {t.rows}</option>
                        <option value={10}>10 {t.rows}</option>
                        <option value={15}>15 {t.rows}</option>
                    </select>
                    <span>
                        {t.showing} {startIndex + 1}-{Math.min(endIndex, filteredShippings.length)} {t.of} {filteredShippings.length} {t.shipping}
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
        </div>
    );
};

export default Shipping;
