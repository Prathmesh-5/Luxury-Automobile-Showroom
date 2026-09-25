import { useState, useEffect, useRef } from "react";
import { leadsApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiMail, FiPhone, FiInbox, FiClock, FiCheckCircle, FiSearch, FiTrash2 } from "react-icons/fi";
import PremiumSelect from "./PremiumSelect";
import "./AdminCommon.css";

function MessageCell({ lead, onShowMore }) {
    const [isTruncated, setIsTruncated] = useState(false);
    const textRef = useRef(null);

    useEffect(() => {
        const element = textRef.current;
        if (!element) return;

        const checkTruncation = () => {
            setIsTruncated(element.scrollHeight > element.clientHeight);
        };

        // Check immediately
        checkTruncation();

        // Check after fonts load
        if (document.fonts) {
            document.fonts.ready.then(checkTruncation);
        }

        // Check on element resize
        const resizeObserver = new ResizeObserver(() => {
            checkTruncation();
        });
        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [lead.message]);

    return (
        <div className="message-content-box">
            <div ref={textRef} className="message-preview">
                {lead.message || "No comments provided."}
            </div>
            {isTruncated && (
                <button 
                    type="button" 
                    onClick={() => onShowMore(lead)} 
                    className="show-more-btn"
                >
                    Show More
                </button>
            )}
        </div>
    );
}

function AdminLeads() {
    const [leads, setLeads] = useState([]);
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

    // State for modals and delete actions
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeInquiry, setActiveInquiry] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Handle search input debounce (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(handler);
    }, [search]);

    // Fetch leads data from server when query parameters change
    useEffect(() => {
        let active = true;

        // Perform setLoading(true) asynchronously to avoid sync setState in effect lint rules
        Promise.resolve().then(() => {
            if (active) setLoading(true);
        });

        const fetchLeads = async () => {
            try {
                const res = await leadsApi.getAll({
                    page,
                    limit,
                    status: statusFilter,
                    search: debouncedSearch,
                    sort: sortOrder,
                    dateRange
                });
                if (active && res && res.success) {
                    setLeads(res.data || []);
                    setPagination(res.pagination || { page: 1, limit, total: 0, totalPages: 1 });
                    setCounts(res.counts || { total: 0, new: 0, contacted: 0, closed: 0 });
                }
            } catch (err) {
                console.error("Failed to load leads list:", err);
                toast.error(err.response?.data?.message || "Enquiries failed to load.");
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchLeads();

        return () => {
            active = false;
        };
    }, [page, limit, statusFilter, sortOrder, dateRange, debouncedSearch, refreshTrigger]);

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
            await leadsApi.updateStatus(id, newStatus);
            toast.success("Enquiry status updated!");
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Status update failed.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;
        const idToDelete = deleteConfirmation._id;
        setDeleting(true);
        try {
            await leadsApi.delete(idToDelete);
            toast.success("Enquiry deleted successfully.");
            
            // Handle pagination gracefully
            const nextLeadsCount = leads.length - 1;
            if (nextLeadsCount === 0 && page > 1) {
                setPage(prev => prev - 1);
            } else {
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (err) {
            console.error("Failed to delete lead:", err);
            toast.error(err.response?.data?.message || "Failed to delete enquiry.");
        } finally {
            setDeleting(false);
            setDeleteConfirmation(null);
        }
    };

    const formatPrice = (p) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(p);
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
                    <h3>No matching enquiries found</h3>
                    <p>No enquiries match your search term "{search}".</p>
                </div>
            );
        }
        if (statusFilter !== "All") {
            return (
                <div className="empty-crud-state">
                    <FiInbox className="empty-icon" />
                    <h3>No enquiries found</h3>
                    <p>No {statusFilter.toUpperCase()} enquiries found in the system.</p>
                </div>
            );
        }
        return (
            <div className="empty-crud-state">
                <FiInbox className="empty-icon" />
                <h3>No Enquiries Found</h3>
                <p>Customer interest submissions will appear here.</p>
            </div>
        );
    };

    return (
        <div className="admin-crud-panel">
            <div className="crud-header">
                <div>
                    <h1>Leads & Enquiries</h1>
                    <p>Track, manage, and close incoming customer queries.</p>
                </div>
            </div>

            {/* Status Summary Panel */}
            <div className="leads-stats-grid">
                <div className="leads-stat-card border-neutral">
                    <div className="leads-stat-info">
                        <span>Total Leads</span>
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
                            placeholder="Search by customer name, email, phone, message or vehicle..." 
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="admin-search-input"
                        />
                    </div>
                </div>
                <div className="control-group">
                    <label>Status Filter</label>
                    <PremiumSelect
                        id="leads-filter-status"
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
                        id="leads-filter-date"
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
                        id="leads-filter-sort"
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
                        id="leads-filter-limit"
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
                    <p>Loading enquiries index...</p>
                </div>
            ) : leads.length === 0 ? (
                renderEmptyState()
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Received Time</th>
                                    <th>Contact Information</th>
                                    <th>Associated Vehicle</th>
                                    <th>Message / Inquiry Details</th>
                                    <th>Status Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead._id}>
                                        <td>
                                            <span className="time-badge">
                                                <FiClock /> {new Date(lead.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{lead.name}</strong>
                                            <span className="contact-sub-span"><FiMail /> {lead.email}</span>
                                            <span className="contact-sub-span"><FiPhone /> {lead.phone}</span>
                                        </td>
                                        <td>
                                            {lead.carId && (lead.carId.name || lead.carId.model) ? (
                                                <>
                                                    <strong className="car-label-block">
                                                        {lead.carId.name} {lead.carId.model}
                                                    </strong>
                                                    <span className="car-price-sub">
                                                        {formatPrice(lead.carId.price)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="badge-status danger">General Inquiry</span>
                                            )}
                                        </td>
                                        <td>
                                            <MessageCell lead={lead} onShowMore={setActiveInquiry} />
                                        </td>
                                        <td>
                                            <div className="status-action-cell">
                                                <PremiumSelect
                                                    id={`status-row-${lead._id}`}
                                                    value={lead.status}
                                                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                                    options={[
                                                        { value: "New", label: "New" },
                                                        { value: "Contacted", label: "Contacted" },
                                                        { value: "Closed", label: "Closed" }
                                                    ]}
                                                    className={`status-select-row-premium ${lead.status.toLowerCase()}`}
                                                />
                                                <button 
                                                    type="button" 
                                                    className="delete-lead-btn" 
                                                    onClick={() => setDeleteConfirmation(lead)}
                                                    title="Delete Enquiry"
                                                >
                                                    <FiTrash2 />
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
                            Showing {startIdx}–{endIdx} of {pagination.total} leads
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

            {/* Inquiry Details Modal */}
            {activeInquiry && (
                <div className="admin-modal-backdrop" onClick={() => setActiveInquiry(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Inquiry Details</h3>
                            <button className="modal-close" onClick={() => setActiveInquiry(null)}>&times;</button>
                        </div>
                        <div className="modal-form" style={{ padding: "30px", color: "#fff", lineHeight: "1.6" }}>
                            <div style={{ marginBottom: "15px" }}>
                                <strong style={{ color: "#d4af37", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>
                                    Client Details
                                </strong>
                                <div style={{ fontSize: "15px", fontWeight: "600" }}>{activeInquiry.name}</div>
                                <div style={{ fontSize: "13px", color: "#8a8a93", marginTop: "3px" }}>
                                    <FiMail style={{ marginRight: "5px", verticalAlign: "middle" }} /> {activeInquiry.email} 
                                    <span style={{ margin: "0 10px", color: "rgba(255,255,255,0.1)" }}>|</span> 
                                    <FiPhone style={{ marginRight: "5px", verticalAlign: "middle" }} /> {activeInquiry.phone}
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: "15px" }}>
                                <strong style={{ color: "#d4af37", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>
                                    Associated Vehicle
                                </strong>
                                {activeInquiry.carId ? (
                                    <>
                                        <div style={{ fontSize: "15px", fontWeight: "600" }}>{activeInquiry.carId.name} {activeInquiry.carId.model}</div>
                                        <div style={{ fontSize: "13px", color: "#d4af37", fontWeight: "600", marginTop: "3px" }}>
                                            {formatPrice(activeInquiry.carId.price)}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: "13px", color: "#ef4444", fontWeight: "600" }}>General Inquiry</div>
                                )}
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <strong style={{ color: "#d4af37", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>
                                    Received Time
                                </strong>
                                <div style={{ fontSize: "13px", color: "#8a8a93" }}>
                                    {new Date(activeInquiry.createdAt).toLocaleString()}
                                </div>
                            </div>
                            
                            <div>
                                <strong style={{ color: "#d4af37", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", display: "block", marginBottom: "5px" }}>
                                    Complete Message
                                </strong>
                                <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#e2e2e9", fontSize: "14px" }}>
                                    {activeInquiry.message || "No comments provided."}
                                </p>
                            </div>
                        </div>
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
                                Are you sure you want to delete this enquiry? This action cannot be undone.
                            </p>
                            <div className="modal-actions-buttons" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "20px", display: "flex", gap: "15px" }}>
                                <button 
                                    type="button" 
                                    className="cancel-btn" 
                                    onClick={() => setDeleteConfirmation(null)}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="submit-btn" 
                                    style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff" }} 
                                    onClick={handleConfirmDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminLeads;
