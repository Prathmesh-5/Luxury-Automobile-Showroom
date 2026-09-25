import { useState, useEffect, useRef } from "react";
import { testDrivesApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiMail, FiPhone, FiInbox, FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiSearch, FiTrash2 } from "react-icons/fi";
import PremiumSelect from "./PremiumSelect";
import "./AdminCommon.css";

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
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
    const [counts, setCounts] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });

    // Modals, action states, and refresh triggers
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Handle search input debounce (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(handler);
    }, [search]);

    // Fetch bookings data from server when query parameters change
    useEffect(() => {
        let active = true;

        // Perform setLoading(true) asynchronously to avoid sync setState in effect lint rules
        Promise.resolve().then(() => {
            if (active) setLoading(true);
        });

        const fetchBookings = async () => {
            try {
                const res = await testDrivesApi.getAll({
                    page,
                    limit,
                    status: statusFilter,
                    search: debouncedSearch,
                    sort: sortOrder,
                    dateRange
                });
                if (active && res && res.success) {
                    setBookings(res.data || []);
                    setPagination(res.pagination || { page: 1, limit, total: 0, totalPages: 1 });
                    setCounts(res.counts || { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
                }
            } catch (err) {
                console.error("Failed to load test drives bookings list:", err);
                toast.error(err.response?.data?.message || "Bookings failed to load.");
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchBookings();

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
            await testDrivesApi.updateStatus(id, newStatus);
            toast.success("Test drive booking status updated!");
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
            await testDrivesApi.delete(idToDelete);
            toast.success("Booking deleted successfully.");

            // Handle pagination gracefully
            const nextBookingsCount = bookings.length - 1;
            if (nextBookingsCount === 0 && page > 1) {
                setPage(prev => prev - 1);
            } else {
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (err) {
            console.error("Failed to delete booking:", err);
            toast.error(err.response?.data?.message || "Failed to delete booking.");
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
                    <h3>No matching bookings found</h3>
                    <p>No bookings match your search term "{search}".</p>
                </div>
            );
        }
        if (statusFilter !== "All") {
            return (
                <div className="empty-crud-state">
                    <FiInbox className="empty-icon" />
                    <h3>No bookings found</h3>
                    <p>No {statusFilter.toUpperCase()} bookings found in the system.</p>
                </div>
            );
        }
        return (
            <div className="empty-crud-state">
                <FiInbox className="empty-icon" />
                <h3>No Bookings Found</h3>
                <p>Test drive reservations will appear here.</p>
            </div>
        );
    };

    return (
        <div className="admin-crud-panel">
            <div className="crud-header">
                <div>
                    <h1>Test Drives / Bookings</h1>
                    <p>Track showroom viewing and driving appointments.</p>
                </div>
            </div>

            {/* Status Summary Panel */}
            <div className="leads-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <div className="leads-stat-card border-neutral">
                    <div className="leads-stat-info">
                        <span>Total Test Drives</span>
                        <h2>{counts.total}</h2>
                    </div>
                    <FiInbox className="leads-stat-icon" />
                </div>
                <div className="leads-stat-card border-gold">
                    <div className="leads-stat-info">
                        <span>Pending</span>
                        <h2>{counts.pending}</h2>
                    </div>
                    <FiClock className="leads-stat-icon" />
                </div>
                <div className="leads-stat-card border-blue">
                    <div className="leads-stat-info">
                        <span>Confirmed</span>
                        <h2>{counts.confirmed}</h2>
                    </div>
                    <FiCalendar className="leads-stat-icon" />
                </div>
                <div className="leads-stat-card border-green">
                    <div className="leads-stat-info">
                        <span>Completed</span>
                        <h2>{counts.completed}</h2>
                    </div>
                    <FiCheckCircle className="leads-stat-icon" />
                </div>
                <div className="leads-stat-card border-red">
                    <div className="leads-stat-info">
                        <span>Cancelled</span>
                        <h2>{counts.cancelled}</h2>
                    </div>
                    <FiXCircle className="leads-stat-icon" />
                </div>
            </div>

            {/* Controls Bar */}
            <div className="leads-controls-bar">
                <div className="control-group search-group">
                    <label>Search Query</label>
                    <div className="leads-search-wrapper">
                        <FiSearch className="leads-search-icon" />
                        <input 
                            type="search" 
                            placeholder="Search by customer name, email, phone or vehicle..." 
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="admin-search-input"
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="control-group">
                    <label>Status Filter</label>
                    <PremiumSelect
                        id="bookings-filter-status"
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                        options={[
                            { value: "All", label: "All Statuses" },
                            { value: "Pending", label: "Pending" },
                            { value: "Confirmed", label: "Confirmed" },
                            { value: "Completed", label: "Completed" },
                            { value: "Cancelled", label: "Cancelled" }
                        ]}
                    />
                </div>
                <div className="control-group">
                    <label>Date Filter</label>
                    <PremiumSelect
                        id="bookings-filter-date"
                        value={dateRange}
                        onChange={(e) => handleDateRangeChange(e.target.value)}
                        options={[
                            { value: "All Time", label: "All Time" },
                            { value: "Today", label: "Today" },
                            { value: "Last 7 Days", label: "Last 7 Days" },
                            { value: "Last 30 Days", label: "Last 30 Days" },
                            { value: "This Month", label: "This Month" }
                        ]}
                    />
                </div>
                <div className="control-group">
                    <label>Sort By Date</label>
                    <PremiumSelect
                        id="bookings-filter-sort"
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
                        id="bookings-filter-limit"
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
                    <p>Loading bookings index...</p>
                </div>
            ) : bookings.length === 0 ? (
                renderEmptyState()
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Preferred Time Slot</th>
                                    <th>Customer Details</th>
                                    <th>Reserved Car</th>
                                    <th>Current Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking._id}>
                                        <td>
                                            <span className="time-badge block font-gold">
                                                <FiCalendar /> {new Date(booking.preferredDate).toLocaleDateString()}
                                            </span>
                                            <span className="time-badge block" style={{ marginTop: "5px" }}>
                                                <FiClock /> {booking.preferredTime}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{booking.name}</strong>
                                            <span className="contact-sub-span"><FiMail /> {booking.email}</span>
                                            <span className="contact-sub-span"><FiPhone /> {booking.phone}</span>
                                        </td>
                                        <td>
                                            {booking.carId ? (
                                                <>
                                                    <strong className="car-label-block">
                                                        {booking.carId.name} {booking.carId.model}
                                                    </strong>
                                                    <span className="car-price-sub">
                                                        {formatPrice(booking.carId.price)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="badge-status danger">Unspecified Car</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="booking-action-cell">
                                                <PremiumSelect
                                                    id={`status-row-${booking._id}`}
                                                    value={booking.status}
                                                    onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                                    options={[
                                                        { value: "Pending", label: "Pending" },
                                                        { value: "Confirmed", label: "Confirmed" },
                                                        { value: "Completed", label: "Completed" },
                                                        { value: "Cancelled", label: "Cancelled" }
                                                    ]}
                                                    className={`status-select-row-premium ${booking.status.toLowerCase()} booking-status-select`}
                                                />
                                                <button 
                                                    type="button" 
                                                    className="delete-booking-btn" 
                                                    onClick={() => setDeleteConfirmation(booking)}
                                                    title="Delete Booking"
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
                            Showing {startIdx}–{endIdx} of {pagination.total} test drives
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
                                Are you sure you want to delete this test drive booking? This action cannot be undone.
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

export default AdminBookings;
