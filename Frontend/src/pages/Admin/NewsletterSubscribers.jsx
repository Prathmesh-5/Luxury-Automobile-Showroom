import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { newsletterApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    FiMail, FiUsers, FiUserCheck, FiUserX, FiTrendingUp, FiTrendingDown, 
    FiCalendar, FiClock, FiSearch, FiTrash2, FiDownload, FiCheckCircle, 
    FiXCircle, FiCheckSquare, FiSquare, FiList 
} from "react-icons/fi";
import PremiumSelect from "./PremiumSelect";
import "./AdminCommon.css";
import "./NewsletterSubscribers.css";

// SVG Line Chart Component
function GrowthChart({ timeSeries = [], range = "30d" }) {
    if (!timeSeries || timeSeries.length === 0) {
        return (
            <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a8a93", fontSize: "13px" }}>
                No subscription data available for this range.
            </div>
        );
    }

    const width = 600;
    const height = 180;
    const padding = 25;

    const maxCount = Math.max(...timeSeries.map((d) => d.count), 5);
    const minCount = 0;

    const points = timeSeries.map((d, index) => {
        const x = padding + (index / (timeSeries.length - 1 || 1)) * (width - 2 * padding);
        const y = height - padding - ((d.count - minCount) / (maxCount - minCount || 1)) * (height - 2 * padding);
        return { x, y, label: d.label, count: d.count };
    });

    const pathD = points.reduce((acc, point, index) => {
        return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, "");

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="svg-chart-container">
            <svg className="svg-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />

                {/* Area fill */}
                <path d={areaD} fill="url(#goldGradient)" />

                {/* Line path */}
                <path d={pathD} fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points */}
                {points.map((point, index) => {
                    // Show dots on non-zero or sampled points
                    if (timeSeries.length > 30 && index % Math.ceil(timeSeries.length / 10) !== 0 && index !== timeSeries.length - 1) {
                        return null;
                    }
                    return (
                        <g key={index}>
                            <circle cx={point.x} cy={point.y} r="4" fill="#121216" stroke="#d4af37" strokeWidth="2" />
                            {point.count > 0 && (
                                <text x={point.x} y={point.y - 8} fill="#d4af37" fontSize="10" fontWeight="bold" textAnchor="middle">
                                    {point.count}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function AdminNewsletterSubscribers() {
    const [subscribers, setSubscribers] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);

    // Filters and pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateRangeFilter, setDateRangeFilter] = useState("All Time");
    const [sortOrder, setSortOrder] = useState("newest");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [stats, setStats] = useState({ totalSubscribers: 0, activeSubscribers: 0, unsubscribedCount: 0 });

    // Analytics state
    const [chartRange, setChartRange] = useState("30d");
    const [analytics, setAnalytics] = useState(null);

    // Selection & Bulk actions state
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Single delete state
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    // Race condition prevention & cancellation refs
    const requestIdRef = useRef(0);
    const abortControllerRef = useRef(null);

    // Debounce search input (450ms pause before setting debouncedSearch)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 450);
        return () => clearTimeout(timer);
    }, [search]);

    // Load subscribers when pagination/filters/debouncedSearch changes
    useEffect(() => {
        loadSubscribers();
    }, [page, limit, statusFilter, dateRangeFilter, sortOrder, debouncedSearch]);

    // Load analytics when chartRange changes
    useEffect(() => {
        loadAnalytics();
    }, [chartRange]);

    const loadSubscribers = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const currentRequestId = ++requestIdRef.current;

        try {
            if (!initialLoading) {
                setTableLoading(true);
            }

            const res = await newsletterApi.getSubscribers(
                {
                    page,
                    limit,
                    status: statusFilter,
                    dateRange: dateRangeFilter,
                    sort: sortOrder,
                    search: debouncedSearch
                },
                { signal: controller.signal }
            );

            // Guard against race conditions: ignore response if a newer request was dispatched
            if (currentRequestId !== requestIdRef.current) return;

            if (res.data) {
                setSubscribers(res.data.subscribers || []);
                if (res.data.pagination) setPagination(res.data.pagination);
                if (res.data.stats) setStats(res.data.stats);
            }
        } catch (err) {
            if (axios.isCancel(err) || err?.name === "CanceledError" || err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
                return;
            }
            if (currentRequestId === requestIdRef.current) {
                console.error("Error loading subscribers:", err);
                toast.error("Failed to load newsletter subscribers.");
            }
        } finally {
            if (currentRequestId === requestIdRef.current) {
                setInitialLoading(false);
                setTableLoading(false);
            }
        }
    };

    const loadAnalytics = async () => {
        try {
            const res = await newsletterApi.getAnalytics(chartRange);
            if (res.data) {
                setAnalytics(res.data);
            }
        } catch (err) {
            console.error("Error loading analytics:", err);
        }
    };

    // Selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = subscribers.map((s) => s._id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleStatusToggle = async (subscriber) => {
        const newStatus = subscriber.status === "active" ? "unsubscribed" : "active";
        try {
            setTogglingId(subscriber._id);
            await newsletterApi.updateSubscriberStatus(subscriber._id, newStatus);
            toast.success(`Subscriber ${subscriber.email} marked as ${newStatus}`);
            loadSubscribers();
            loadAnalytics();
        } catch (err) {
            console.error("Status toggle error:", err);
            toast.error(err.response?.data?.message || "Failed to update subscriber status");
        } finally {
            setTogglingId(null);
        }
    };

    // Bulk actions
    const handleBulkStatusChange = async (targetStatus) => {
        if (selectedIds.length === 0) return;
        try {
            setBulkActionLoading(true);
            const res = await newsletterApi.bulkUpdateStatus(selectedIds, targetStatus);
            toast.success(res.message || `Updated ${selectedIds.length} subscribers.`);
            setSelectedIds([]);
            loadSubscribers();
            loadAnalytics();
        } catch (err) {
            console.error("Bulk status update error:", err);
            toast.error(err.response?.data?.message || "Failed bulk status update.");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedIds.length === 0) return;
        try {
            setBulkActionLoading(true);
            const res = await newsletterApi.bulkDelete(selectedIds);
            toast.success(res.message || `Deleted ${selectedIds.length} subscribers.`);
            setSelectedIds([]);
            setBulkDeleteConfirmation(false);
            loadSubscribers();
            loadAnalytics();
        } catch (err) {
            console.error("Bulk delete error:", err);
            toast.error(err.response?.data?.message || "Failed bulk delete.");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleSingleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await newsletterApi.deleteSubscriber(deleteTarget._id);
            toast.success("Subscriber removed successfully.");
            setDeleteTarget(null);
            loadSubscribers();
            loadAnalytics();
        } catch (err) {
            console.error("Delete subscriber error:", err);
            toast.error(err.response?.data?.message || "Failed to delete subscriber.");
        } finally {
            setDeleting(false);
        }
    };

    const handleExportCsv = async (exportSelectedOnly = false) => {
        try {
            toast.loading(exportSelectedOnly ? "Exporting selected subscribers..." : "Exporting subscribers...", { id: "csv-export" });
            const params = {
                status: statusFilter,
                search: debouncedSearch
            };
            if (exportSelectedOnly && selectedIds.length > 0) {
                params.ids = selectedIds.join(",");
            }

            const blobData = await newsletterApi.exportSubscribersCsv(params);
            const blob = new Blob([blobData], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success("Subscribers CSV exported successfully!", { id: "csv-export" });
        } catch (err) {
            console.error("CSV Export error:", err);
            toast.error("Failed to export CSV file.", { id: "csv-export" });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const metrics = analytics?.metrics || {};
    const growthPct = metrics.growthPercentage !== undefined ? metrics.growthPercentage : 0;
    const isGrowthPositive = growthPct >= 0;

    const allRowsSelected = subscribers.length > 0 && subscribers.every((s) => selectedIds.includes(s._id));

    const startIdx = (page - 1) * limit + 1;
    const endIdx = Math.min(page * limit, pagination.total || 0);

    return (
        <div className="admin-crud-panel">
            <div className="crud-header">
                <div>
                    <h1>Newsletter Subscribers & Analytics</h1>
                    <p>Track subscriber growth, manage subscriptions, run bulk actions, and export real database data.</p>
                </div>
                <button type="button" className="export-csv-btn" onClick={() => handleExportCsv(false)}>
                    <FiDownload /> Export All CSV
                </button>
            </div>

            {/* 6 Summary Stat Cards */}
            <div className="newsletter-stats-grid-6">
                <div className="newsletter-stat-card">
                    <div className="stat-card-icon gold">
                        <FiUsers />
                    </div>
                    <div className="stat-card-content">
                        <h4>Total Subscribers</h4>
                        <p className="stat-number">{stats.totalSubscribers}</p>
                    </div>
                </div>

                <div className="newsletter-stat-card">
                    <div className="stat-card-icon green">
                        <FiUserCheck />
                    </div>
                    <div className="stat-card-content">
                        <h4>Active Subscribers</h4>
                        <p className="stat-number">{stats.activeSubscribers}</p>
                    </div>
                </div>

                <div className="newsletter-stat-card">
                    <div className="stat-card-icon red">
                        <FiUserX />
                    </div>
                    <div className="stat-card-content">
                        <h4>Unsubscribed</h4>
                        <p className="stat-number">{stats.unsubscribedCount}</p>
                    </div>
                </div>

                <div className="newsletter-stat-card">
                    <div className="stat-card-icon blue">
                        <FiClock />
                    </div>
                    <div className="stat-card-content">
                        <h4>New Today</h4>
                        <p className="stat-number">{metrics.newToday || 0}</p>
                    </div>
                </div>

                <div className="newsletter-stat-card">
                    <div className="stat-card-icon gold">
                        <FiCalendar />
                    </div>
                    <div className="stat-card-content">
                        <h4>New This Week</h4>
                        <p className="stat-number">{metrics.newThisWeek || 0}</p>
                    </div>
                </div>

                <div className="newsletter-stat-card">
                    <div className="stat-card-icon green">
                        <FiTrendingUp />
                    </div>
                    <div className="stat-card-content">
                        <h4>New This Month</h4>
                        <p className="stat-number">{metrics.newThisMonth || 0}</p>
                    </div>
                </div>
            </div>

            {/* Analytics Chart & Recent Subscribers Section */}
            <div className="analytics-recent-wrapper">
                {/* Growth Chart */}
                <div className="growth-chart-card">
                    <div className="chart-header-row">
                        <h3>
                            <FiTrendingUp style={{ color: "#d4af37" }} /> Subscriber Growth
                            <span className={`growth-badge ${isGrowthPositive ? "positive" : "negative"}`}>
                                {isGrowthPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                                {isGrowthPositive ? `+${growthPct}%` : `${growthPct}%`} vs prev period
                            </span>
                        </h3>

                        <div className="range-tabs">
                            <button
                                type="button"
                                className={`range-tab-btn ${chartRange === "7d" ? "active" : ""}`}
                                onClick={() => setChartRange("7d")}
                            >
                                7 Days
                            </button>
                            <button
                                type="button"
                                className={`range-tab-btn ${chartRange === "30d" ? "active" : ""}`}
                                onClick={() => setChartRange("30d")}
                            >
                                30 Days
                            </button>
                            <button
                                type="button"
                                className={`range-tab-btn ${chartRange === "90d" ? "active" : ""}`}
                                onClick={() => setChartRange("90d")}
                            >
                                90 Days
                            </button>
                        </div>
                    </div>

                    <GrowthChart timeSeries={analytics?.timeSeries || []} range={chartRange} />
                </div>

                {/* Recent Subscribers List */}
                <div className="recent-subscribers-card">
                    <h3>
                        <FiList style={{ color: "#d4af37" }} /> Recent Subscribers
                    </h3>

                    <div className="recent-subs-list">
                        {!analytics?.recentSubscribers || analytics.recentSubscribers.length === 0 ? (
                            <p style={{ color: "#8a8a93", fontSize: "13px" }}>No recent subscriptions.</p>
                        ) : (
                            analytics.recentSubscribers.map((sub) => (
                                <div className="recent-sub-item" key={sub._id}>
                                    <div>
                                        <div className="recent-sub-email">{sub.email}</div>
                                        <div className="recent-sub-date">{formatDate(sub.subscribedAt || sub.createdAt)}</div>
                                    </div>
                                    <span className={`badge-status ${sub.status === "active" ? "success" : "danger"}`} style={{ fontSize: "10px", padding: "2px 8px" }}>
                                        {sub.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Actions Toolbar (Visible when rows are selected) */}
            {selectedIds.length > 0 && (
                <div className="bulk-actions-toolbar">
                    <div className="bulk-count">
                        <FiCheckSquare /> {selectedIds.length} subscribers selected
                    </div>

                    <div className="bulk-buttons-group">
                        <button
                            type="button"
                            className="bulk-action-btn active"
                            onClick={() => handleBulkStatusChange("active")}
                            disabled={bulkActionLoading}
                        >
                            <FiCheckCircle /> Reactivate Selected
                        </button>

                        <button
                            type="button"
                            className="bulk-action-btn unsub"
                            onClick={() => handleBulkStatusChange("unsubscribed")}
                            disabled={bulkActionLoading}
                        >
                            <FiXCircle /> Unsubscribe Selected
                        </button>

                        <button
                            type="button"
                            className="bulk-action-btn delete"
                            onClick={() => setBulkDeleteConfirmation(true)}
                            disabled={bulkActionLoading}
                        >
                            <FiTrash2 /> Delete Selected
                        </button>

                        <button
                            type="button"
                            className="bulk-action-btn export"
                            onClick={() => handleExportCsv(true)}
                            disabled={bulkActionLoading}
                        >
                            <FiDownload /> Export Selected CSV
                        </button>
                    </div>
                </div>
            )}

            {/* Controls Bar: Search, Status, Date Range, Sort */}
            <div className="newsletter-controls-bar">
                <div className="search-filter-wrapper">
                    <div className="admin-search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search subscriber by email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {(search !== debouncedSearch || tableLoading) && (
                            <div className="search-spinner-inline" title="Searching..." />
                        )}
                    </div>

                    <PremiumSelect
                        id="status-filter-select"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        options={[
                            { value: "All", label: "All Statuses" },
                            { value: "Active", label: "Active Only" },
                            { value: "Unsubscribed", label: "Unsubscribed Only" }
                        ]}
                    />

                    <PremiumSelect
                        id="date-range-select"
                        value={dateRangeFilter}
                        onChange={(e) => {
                            setDateRangeFilter(e.target.value);
                            setPage(1);
                        }}
                        options={[
                            { value: "All Time", label: "All Time" },
                            { value: "today", label: "Subscribed Today" },
                            { value: "7d", label: "Last 7 Days" },
                            { value: "30d", label: "Last 30 Days" }
                        ]}
                    />

                    <PremiumSelect
                        id="sort-order-select"
                        value={sortOrder}
                        onChange={(e) => {
                            setSortOrder(e.target.value);
                            setPage(1);
                        }}
                        options={[
                            { value: "newest", label: "Sort: Newest First" },
                            { value: "oldest", label: "Sort: Oldest First" }
                        ]}
                    />
                </div>
            </div>

            {/* Table / Results Section */}
            {initialLoading ? (
                <div className="empty-crud-state" style={{ padding: "60px 20px" }}>
                    <p>Loading newsletter subscribers from database...</p>
                </div>
            ) : (
                <div className="table-wrapper-relative">
                    {tableLoading && (
                        <div className="table-loading-overlay">
                            <div className="table-loading-bar" />
                        </div>
                    )}

                    {subscribers.length === 0 ? (
                        <div className="empty-crud-state">
                            <FiMail className="empty-icon" />
                            <h3>No Subscribers Found</h3>
                            <p>
                                {debouncedSearch || statusFilter !== "All" || dateRangeFilter !== "All Time"
                                    ? "No subscribers match your search or filter parameters."
                                    : "Subscribers will appear here once visitors subscribe through the website footer."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th className="checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    className="custom-checkbox"
                                                    checked={allRowsSelected}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th>Subscriber Email</th>
                                            <th>Status</th>
                                            <th>Subscribed Date</th>
                                            <th>Unsubscribed Date</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((sub) => {
                                            const isSelected = selectedIds.includes(sub._id);
                                            return (
                                                <tr key={sub._id} style={isSelected ? { background: "rgba(212, 175, 55, 0.05)" } : {}}>
                                                    <td className="checkbox-cell">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleSelectRow(sub._id)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            <FiMail style={{ color: "#d4af37" }} />
                                                            <span className="car-title-strong">{sub.email}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {sub.status === "active" ? (
                                                            <span className="badge-status success">
                                                                <FiCheckCircle /> Active
                                                            </span>
                                                        ) : (
                                                            <span className="badge-status danger">
                                                                <FiXCircle /> Unsubscribed
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="time-badge">
                                                            {formatDate(sub.subscribedAt || sub.createdAt)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="time-badge">
                                                            {sub.unsubscribedAt ? formatDate(sub.unsubscribedAt) : "—"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="actions-cell">
                                                            <button
                                                                type="button"
                                                                className={`status-toggle-btn ${sub.status}`}
                                                                onClick={() => handleStatusToggle(sub)}
                                                                disabled={togglingId === sub._id}
                                                                title={sub.status === "active" ? "Click to Unsubscribe" : "Click to Reactivate"}
                                                            >
                                                                {togglingId === sub._id
                                                                    ? "Updating..."
                                                                    : sub.status === "active"
                                                                    ? "Unsubscribe"
                                                                    : "Reactivate"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="delete-btn"
                                                                onClick={() => setDeleteTarget(sub)}
                                                                title="Delete Subscriber"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="leads-pagination-footer" style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", color: "#8a8a93", fontSize: "13px" }}>
                                <span>
                                    Showing {pagination.total > 0 ? startIdx : 0}–{endIdx} of {pagination.total} subscribers
                                </span>

                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <button
                                        type="button"
                                        className="add-record-btn"
                                        style={{ padding: "8px 16px", fontSize: "12px" }}
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </button>

                                    <span>Page {page} of {pagination.pages}</span>

                                    <button
                                        type="button"
                                        className="add-record-btn"
                                        style={{ padding: "8px 16px", fontSize: "12px" }}
                                        disabled={page >= pagination.pages}
                                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Single Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card">
                        <div className="modal-header">
                            <h3>Confirm Delete Subscriber</h3>
                            <button type="button" className="modal-close" onClick={() => setDeleteTarget(null)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-form">
                            <p style={{ color: "#d1d5db", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                                Are you sure you want to permanently delete <strong>{deleteTarget.email}</strong> from your newsletter subscriber list?
                            </p>
                            <span style={{ fontSize: "12px", color: "#ef4444" }}>
                                This action cannot be undone.
                            </span>
                            <div className="modal-actions-buttons">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="submit-btn"
                                    style={{ background: "#ef4444", color: "#fff" }}
                                    onClick={handleSingleDeleteConfirm}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Delete Subscriber"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {bulkDeleteConfirmation && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card">
                        <div className="modal-header">
                            <h3>Confirm Bulk Delete</h3>
                            <button type="button" className="modal-close" onClick={() => setBulkDeleteConfirmation(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-form">
                            <p style={{ color: "#d1d5db", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                                Are you sure you want to permanently delete <strong>{selectedIds.length}</strong> selected subscribers?
                            </p>
                            <span style={{ fontSize: "12px", color: "#ef4444" }}>
                                This action cannot be undone.
                            </span>
                            <div className="modal-actions-buttons">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setBulkDeleteConfirmation(false)}
                                    disabled={bulkActionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="submit-btn"
                                    style={{ background: "#ef4444", color: "#fff" }}
                                    onClick={handleBulkDeleteConfirm}
                                    disabled={bulkActionLoading}
                                >
                                    {bulkActionLoading ? "Deleting..." : `Delete ${selectedIds.length} Subscribers`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminNewsletterSubscribers;
