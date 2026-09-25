import { useState, useEffect } from "react";
import { sellCarsApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiMail, FiPhone, FiInbox, FiClock, FiEye, FiCheckCircle, FiSearch, FiTrash, FiCamera } from "react-icons/fi";
import PremiumSelect from "./PremiumSelect";
import "./AdminCommon.css";

function AdminSellRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter, search, sorting and pagination states
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [dateRange, setDateRange] = useState("All Time");

    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [counts, setCounts] = useState({ total: 0, new: 0, contacted: 0, closed: 0 });

    // Modals & Gallery states
    const [activeNotes, setActiveNotes] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    // Handle search input debounce (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(handler);
    }, [search]);

    // Fetch sell requests data from server when query parameters change
    useEffect(() => {
        let active = true;

        Promise.resolve().then(() => {
            if (active) setLoading(true);
        });

        const fetchRequests = async () => {
            try {
                const res = await sellCarsApi.getAll({
                    page,
                    limit,
                    status: statusFilter,
                    search: debouncedSearch,
                    sort: sortOrder,
                    dateRange
                });
                if (active && res && res.success) {
                    setRequests(res.data || []);
                    setPagination(res.pagination || { page: 1, limit, total: 0, totalPages: 1 });
                    setCounts(res.counts || { total: 0, new: 0, contacted: 0, closed: 0 });
                }
            } catch (err) {
                console.error("Failed to load sell requests:", err);
                toast.error(err.response?.data?.message || "Valuation offers failed to load.");
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchRequests();

        return () => {
            active = false;
        };
    }, [page, limit, statusFilter, sortOrder, dateRange, debouncedSearch]);

    // Explicit state modification handlers that automatically reset pagination page to 1
    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
    };

    const handleStatusFilterChange = (val) => {
        setStatusFilter(val);
        setPage(1);
    };

    const handleDateRangeChange = (val) => {
        setDateRange(val);
        setPage(1);
    };

    const handleSortOrderChange = (val) => {
        setSortOrder(val);
        setPage(1);
    };

    const handleLimitChange = (val) => {
        setLimit(val);
        setPage(1);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await sellCarsApi.updateStatus(id, newStatus);
            toast.success("Submission status updated!");
            // Re-fetch current dataset to reflect status and summary count changes immediately
            const res = await sellCarsApi.getAll({
                page,
                limit,
                status: statusFilter,
                search: debouncedSearch,
                sort: sortOrder,
                dateRange
            });
            if (res && res.success) {
                setRequests(res.data || []);
                setPagination(res.pagination || { page: 1, limit, total: 0, totalPages: 1 });
                setCounts(res.counts || { total: 0, new: 0, contacted: 0, closed: 0 });
            }
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Status update failed.");
        }
    };

    const handleDeleteClick = (request) => {
        setDeleteConfirmation(request);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;
        const idToDelete = deleteConfirmation._id;
        try {
            await sellCarsApi.delete(idToDelete);
            toast.success("Sell request deleted successfully.");
            
            // Determine previous page if the current page has become empty
            const nextRequestsCount = requests.length - 1;
            let targetPage = page;
            if (nextRequestsCount === 0 && page > 1) {
                targetPage = page - 1;
                setPage(targetPage);
            }

            // Re-fetch current dataset to reflect deletion and summary count changes immediately
            const res = await sellCarsApi.getAll({
                page: targetPage,
                limit,
                status: statusFilter,
                search: debouncedSearch,
                sort: sortOrder,
                dateRange
            });
            if (res && res.success) {
                setRequests(res.data || []);
                setPagination(res.pagination || { page: targetPage, limit, total: 0, totalPages: 1 });
                setCounts(res.counts || { total: 0, new: 0, contacted: 0, closed: 0 });
            }
        } catch (err) {
            console.error("Failed to delete request:", err);
            toast.error(err.response?.data?.message || "Failed to delete request.");
        } finally {
            setDeleteConfirmation(null);
        }
    };

    const getImageUrl = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100";
        if (img.startsWith("http")) return img;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${img}`;
    };

    const formatPrice = (p) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(p);
    };

    const openGallery = (images, startIndex = 0) => {
        setGalleryImages(images.map(img => getImageUrl(img)));
        setGalleryIndex(startIndex);
        setGalleryOpen(true);
    };

    // Calculate indices
    const startIdx = pagination.total === 0 ? 0 : (page - 1) * limit + 1;
    const endIdx = Math.min(page * limit, pagination.total);

    // Get visible pagination range
    const getPageRange = () => {
        const total = pagination.totalPages || 1;
        const current = page;
        const range = [];
        const maxVisible = 5;
        let start = Math.max(1, current - Math.floor(maxVisible / 2));
        let end = Math.min(total, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    };
    const pageNumbers = getPageRange();

    const renderEmptyState = () => {
        if (search) {
            return (
                <div className="empty-crud-state">
                    <FiInbox className="empty-icon" />
                    <h3>No matching requests found</h3>
                    <p>No requests match your search term "{search}".</p>
                </div>
            );
        }
        if (statusFilter !== "All") {
            return (
                <div className="empty-crud-state">
                    <FiInbox className="empty-icon" />
                    <h3>No requests found</h3>
                    <p>No {statusFilter.toUpperCase()} requests found in the system.</p>
                </div>
            );
        }
        return (
            <div className="empty-crud-state">
                <FiInbox className="empty-icon" />
                <h3>No Valuation Requests</h3>
                <p>Client sell offers will appear here once submitted.</p>
            </div>
        );
    };

    return (
        <div className="admin-crud-panel">
            <style>{`
                .sell-gallery-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #fff;
                    font-size: 36px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    z-index: 1210;
                }
                .sell-gallery-nav-btn:hover {
                    background: rgba(212, 175, 55, 0.8);
                    border-color: #d4af37;
                    color: #000;
                }
                .sell-gallery-nav-btn.prev {
                    left: -60px;
                }
                .sell-gallery-nav-btn.next {
                    right: -60px;
                }
                @media (max-width: 768px) {
                    .sell-gallery-nav-btn.prev {
                        left: 10px;
                    }
                    .sell-gallery-nav-btn.next {
                        right: 10px;
                    }
                }
                .view-photos-card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .view-photos-card-hover:hover {
                    border-color: #d4af37 !important;
                    background: rgba(212, 175, 55, 0.08) !important;
                    transform: scale(1.03) translateY(-1px);
                    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.15);
                }
                .status-select-row-premium {
                    width: 145px !important;
                    flex-shrink: 0 !important;
                }
                .status-select-row-premium .ps-trigger {
                    width: 145px !important;
                    min-width: 145px !important;
                    max-width: 145px !important;
                    height: 36px !important;
                    box-sizing: border-box !important;
                }
                .admin-search-input:-webkit-autofill,
                .admin-search-input:-webkit-autofill:hover,
                .admin-search-input:-webkit-autofill:focus,
                .admin-search-input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 1000px rgb(11, 11, 16) inset !important;
                    -webkit-text-fill-color: #ffffff !important;
                    caret-color: #ffffff !important;
                    transition: background-color 5000s ease-in-out 0s !important;
                }
            `}</style>

            <div className="crud-header">
                <div>
                    <h1>Valuation / Sell Requests</h1>
                    <p>Track, manage, and close incoming client valuation requests.</p>
                </div>
            </div>

            {/* Status Summary Panel */}
            <div className="leads-stats-grid">
                <div className="leads-stat-card border-neutral">
                    <div className="leads-stat-info">
                        <span>Total Requests</span>
                        <h2>{counts.total}</h2>
                    </div>
                    <FiInbox className="leads-stat-icon" />
                </div>
                <div className="leads-stat-card border-gold">
                    <div className="leads-stat-info">
                        <span>New</span>
                        <h2>{counts.new}</h2>
                    </div>
                    <FiClock className="leads-stat-icon" />
                </div>
                <div className="leads-stat-card border-blue">
                    <div className="leads-stat-info">
                        <span>Contacted</span>
                        <h2>{counts.contacted}</h2>
                    </div>
                    <FiPhone className="leads-stat-icon" />
                </div>
                <div className="leads-stat-card border-green">
                    <div className="leads-stat-info">
                        <span>Closed</span>
                        <h2>{counts.closed}</h2>
                    </div>
                    <FiCheckCircle className="leads-stat-icon" />
                </div>
            </div>

            {/* Controls Bar */}
            <div className="leads-controls-bar">
                <div className="control-group search-group">
                    <label>Search Query</label>
                    <div className="leads-search-wrapper">
                        <FiSearch className="leads-search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by customer name, email, phone, vehicle, notes..." 
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="admin-search-input"
                        />
                    </div>
                </div>
                <div className="control-group">
                    <label>Status Filter</label>
                    <PremiumSelect
                        id="sell-filter-status"
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                        options={[
                            { value: "All", label: "All Statuses" },
                            { value: "New", label: "New" },
                            { value: "Contacted", label: "Contacted" },
                            { value: "Closed", label: "Closed" }
                        ]}
                    />
                </div>
                <div className="control-group">
                    <label>Date Filter</label>
                    <PremiumSelect
                        id="sell-filter-date"
                        value={dateRange}
                        onChange={(e) => handleDateRangeChange(e.target.value)}
                        options={[
                            { value: "All Time", label: "All Time" },
                            { value: "Today", label: "Today" },
                            { value: "Last 7 Days", label: "Last 7 Days" },
                            { value: "Last 30 Days", label: "Last 30 Days" }
                        ]}
                    />
                </div>
                <div className="control-group">
                    <label>Sort By Date</label>
                    <PremiumSelect
                        id="sell-filter-sort"
                        value={sortOrder}
                        onChange={(e) => handleSortOrderChange(e.target.value)}
                        options={[
                            { value: "desc", label: "Newest First" },
                            { value: "asc", label: "Oldest First" }
                        ]}
                    />
                </div>
                <div className="control-group">
                    <label>Page Size</label>
                    <PremiumSelect
                        id="sell-filter-limit"
                        value={limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        options={[
                            { value: 10, label: "10 / Page" },
                            { value: 25, label: "25 / Page" },
                            { value: 50, label: "50 / Page" },
                            { value: 100, label: "100 / Page" }
                        ]}
                    />
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Loading valuation offers index...</p>
                </div>
            ) : requests.length === 0 ? (
                renderEmptyState()
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Submitted Time</th>
                                    <th>Client Details</th>
                                    <th>Vehicle Details</th>
                                    <th>Customer Notes</th>
                                    <th>Photos</th>
                                    <th style={{ width: "210px", minWidth: "210px" }}>Status Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req._id}>
                                        <td>
                                            <span className="time-badge">
                                                <FiClock /> {new Date(req.createdAt).toLocaleDateString()}
                                                <span style={{ display: "block", fontSize: "11px", color: "#8a8a93", marginLeft: "18px", marginTop: "2px" }}>
                                                    {new Date(req.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}
                                                </span>
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{req.name}</strong>
                                            <span className="contact-sub-span" style={{ wordBreak: "break-all" }}>
                                                <FiMail style={{ flexShrink: 0 }} /> {req.email}
                                            </span>
                                            <span className="contact-sub-span">
                                                <FiPhone style={{ flexShrink: 0 }} /> {req.phone}
                                            </span>
                                        </td>
                                        <td>
                                            <strong className="car-label-block">{req.carBrand} {req.carModel}</strong>
                                            <span className="spec-tag-sub" style={{ display: "block", marginTop: "3px" }}>
                                                {req.carYear} | {req.condition} | {req.mileage.toLocaleString()} km
                                            </span>
                                            <span className="car-price-sub" style={{ marginTop: "5px" }}>
                                                Expected: {formatPrice(req.price)}
                                            </span>
                                        </td>
                                        <td>
                                            {(() => {
                                                const text = req.message || "No notes.";
                                                const hasMore = text.length > 60 || text.includes("\n");
                                                return (
                                                    <div style={{ maxWidth: "240px" }}>
                                                        <div 
                                                            style={{
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 3,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                fontSize: "13px",
                                                                color: "#a1a1aa",
                                                                lineHeight: "1.5",
                                                                marginBottom: "5px"
                                                            }}
                                                        >
                                                            {text}
                                                        </div>
                                                        {hasMore && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveNotes(req)}
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    color: "#d4af37",
                                                                    fontSize: "12px",
                                                                    fontWeight: "600",
                                                                    padding: 0,
                                                                    cursor: "pointer",
                                                                    textDecoration: "underline"
                                                                }}
                                                            >
                                                                View More
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            {(() => {
                                                const images = req.images || [];
                                                if (images.length === 0) {
                                                    return (
                                                        <div 
                                                            style={{
                                                                width: "64px",
                                                                height: "64px",
                                                                borderRadius: "10px",
                                                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                                                background: "rgba(18, 18, 22, 0.5)",
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                color: "#4a4a4f",
                                                                cursor: "not-allowed",
                                                                userSelect: "none"
                                                            }}
                                                        >
                                                            <FiCamera size={20} style={{ opacity: 0.3 }} />
                                                            <span style={{ fontSize: "9px", marginTop: "4px", opacity: 0.3 }}>No Photos</span>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div 
                                                        onClick={() => openGallery(images, 0)}
                                                        style={{
                                                            width: "64px",
                                                            height: "64px",
                                                            borderRadius: "10px",
                                                            border: "1px solid rgba(212, 175, 55, 0.3)",
                                                            background: "rgba(18, 18, 22, 0.7)",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#d4af37",
                                                            cursor: "pointer",
                                                            position: "relative"
                                                        }}
                                                        className="view-photos-card-hover"
                                                    >
                                                        {/* Count Badge on Top Right */}
                                                        <div 
                                                            style={{
                                                                position: "absolute",
                                                                top: "-6px",
                                                                right: "-6px",
                                                                background: "#d4af37",
                                                                color: "#000",
                                                                fontSize: "9px",
                                                                fontWeight: "800",
                                                                width: "16px",
                                                                height: "16px",
                                                                borderRadius: "50%",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                border: "1.5px solid #121216",
                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.5)"
                                                            }}
                                                        >
                                                            {images.length}
                                                        </div>
                                                        
                                                        <FiCamera size={20} style={{ color: "#d4af37", marginBottom: "4px" }} />
                                                        <span style={{ fontSize: "9px", color: "#a1a1aa", fontWeight: "600", letterSpacing: "0.2px" }}>View Photos</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ width: "210px", minWidth: "210px", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "16px", width: "100%", flexWrap: "nowrap" }}>
                                                <PremiumSelect
                                                    id={`status-row-${req._id}`}
                                                    value={req.status}
                                                    onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                                    options={[
                                                        { value: "New", label: "New" },
                                                        { value: "Contacted", label: "Contacted" },
                                                        { value: "Closed", label: "Closed" }
                                                    ]}
                                                    className={`status-select-row-premium ${req.status.toLowerCase()}`}
                                                />
                                                <button 
                                                    className="delete-btn" 
                                                    onClick={() => handleDeleteClick(req)} 
                                                    title="Delete Sell Request"
                                                    style={{
                                                        background: "rgba(239, 68, 68, 0.08)",
                                                        border: "1px solid rgba(239, 68, 68, 0.2)",
                                                        color: "#ef4444",
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "8px",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: "pointer",
                                                        transition: "all 0.3s ease",
                                                        flexShrink: 0
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = "#ef4444";
                                                        e.currentTarget.style.color = "#fff";
                                                        e.currentTarget.style.borderColor = "#ef4444";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                                                        e.currentTarget.style.color = "#ef4444";
                                                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                                                    }}
                                                >
                                                    <FiTrash size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="leads-pagination-footer">
                        <span className="pagination-info">
                            Showing {startIdx}–{endIdx} of {pagination.total} requests
                        </span>
                        <div className="pagination-buttons">
                            <button 
                                className="pagination-btn" 
                                disabled={page === 1}
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            >
                                Previous
                            </button>
                            
                            {pageNumbers.map(num => (
                                <button 
                                    key={num}
                                    className={`pagination-btn ${page === num ? 'active' : ''}`}
                                    onClick={() => setPage(num)}
                                >
                                    {num}
                                </button>
                            ))}

                            <button 
                                className="pagination-btn" 
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Customer Notes Details Modal */}
            {activeNotes && (
                <div className="admin-modal-backdrop" onClick={() => setActiveNotes(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Customer Notes</h3>
                            <button className="modal-close" onClick={() => setActiveNotes(null)}>&times;</button>
                        </div>
                        <div className="modal-form" style={{ padding: "30px", color: "#fff", lineHeight: "1.6" }}>
                            <div style={{ marginBottom: "15px" }}>
                                <strong style={{ color: "#d4af37", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>
                                    Client Details
                                </strong>
                                <div style={{ fontSize: "15px", fontWeight: "600" }}>{activeNotes.name}</div>
                                <div style={{ fontSize: "13px", color: "#8a8a93", marginTop: "3px" }}>{activeNotes.email} | {activeNotes.phone}</div>
                            </div>
                            <div style={{ marginBottom: "15px" }}>
                                <strong style={{ color: "#d4af37", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>
                                    Vehicle Details
                                </strong>
                                <div style={{ fontSize: "15px" }}>{activeNotes.carBrand} {activeNotes.carModel} ({activeNotes.carYear})</div>
                                <div style={{ fontSize: "13px", color: "#8a8a93", marginTop: "3px" }}>
                                    {activeNotes.condition} | {activeNotes.mileage.toLocaleString()} km | Expected: {formatPrice(activeNotes.price)}
                                </div>
                            </div>
                            <div>
                                <strong style={{ color: "#d4af37", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>
                                    Full Message / Notes
                                </strong>
                                <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#e2e2e9", fontSize: "14px" }}>
                                    {activeNotes.message || "No notes provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Gallery/Lightbox Modal */}
            {galleryOpen && galleryImages.length > 0 && (
                <div className="lightbox-backdrop" onClick={() => setGalleryOpen(false)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <img src={galleryImages[galleryIndex]} alt={`Preview ${galleryIndex + 1}`} />
                        
                        {galleryImages.length > 1 && (
                            <>
                                <button 
                                    className="sell-gallery-nav-btn prev"
                                    onClick={(e) => { e.stopPropagation(); setGalleryIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1)); }}
                                >
                                    &lsaquo;
                                </button>
                                <button 
                                    className="sell-gallery-nav-btn next"
                                    onClick={(e) => { e.stopPropagation(); setGalleryIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1)); }}
                                >
                                    &rsaquo;
                                </button>
                                <div 
                                    className="gallery-counter"
                                    style={{
                                        marginTop: "15px",
                                        color: "#8a8a93",
                                        fontSize: "14px",
                                        letterSpacing: "1px"
                                    }}
                                >
                                    {galleryIndex + 1} / {galleryImages.length}
                                </div>
                            </>
                        )}
                        
                        <button className="lightbox-close" onClick={() => setGalleryOpen(false)} style={{ top: "-50px" }}>&times;</button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="admin-modal-backdrop" onClick={() => setDeleteConfirmation(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
                        <div className="modal-header">
                            <h3>Confirm Deletion</h3>
                            <button className="modal-close" onClick={() => setDeleteConfirmation(null)}>&times;</button>
                        </div>
                        <div style={{ padding: "30px", color: "#fff" }}>
                            <p style={{ margin: "0 0 25px 0", fontSize: "14px", lineHeight: "1.6", color: "#e2e2e9" }}>
                                Are you sure you want to delete this sell request? This action cannot be undone.
                            </p>
                            <div className="modal-actions-buttons" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "20px", display: "flex", gap: "15px" }}>
                                <button 
                                    type="button" 
                                    className="cancel-btn" 
                                    onClick={() => setDeleteConfirmation(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="submit-btn" 
                                    style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff" }} 
                                    onClick={handleConfirmDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSellRequests;
