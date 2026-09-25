import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { newsletterApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    FiSend, FiPlus, FiEye, FiEdit2, FiTrash2, FiClock, 
    FiCheckCircle, FiAlertCircle, FiMail, FiUsers, FiSearch,
    FiFilter, FiDownload, FiBarChart2, FiFileText, FiLink,
    FiChevronDown, FiChevronUp, FiXCircle, FiTrendingUp
} from "react-icons/fi";
import PremiumSelect from "./PremiumSelect";
import "./AdminCommon.css";
import "./NewsletterCampaigns.css";

function NewsletterCampaigns() {
    const navigate = useNavigate();

    const [campaigns, setCampaigns] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);

    // Filters and pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOption, setSortOption] = useState("newest");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // More Filters
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [dateRangeFilter, setDateRangeFilter] = useState("All Time");
    const [deliveryFilter, setDeliveryFilter] = useState("All");
    const [engagementFilter, setEngagementFilter] = useState("Any");

    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [summary, setSummary] = useState({
        totalCampaigns: 0,
        sentCampaigns: 0,
        draftCampaigns: 0,
        failedCampaigns: 0,
        totalEmailsSent: 0
    });

    // Modals & Expanded Recipient State
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [viewModal, setViewModal] = useState(false);
    const [modalActiveTab, setModalActiveTab] = useState("recipients"); // "recipients" | "content" | "analytics" | "links"
    const [modalRecipients, setModalRecipients] = useState([]);
    const [modalRecipientLoading, setModalRecipientLoading] = useState(false);
    const [modalRecipientSearch, setModalRecipientSearch] = useState("");

    const [testEmailModal, setTestEmailModal] = useState(false);
    const [sendConfirmModal, setSendConfirmModal] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);

    const [testEmail, setTestEmail] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Inline Row Recipient Expansion State
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [expandedRecipients, setExpandedRecipients] = useState([]);
    const [expandedLoading, setExpandedLoading] = useState(false);

    // Race protection refs
    const requestIdRef = useRef(0);
    const abortControllerRef = useRef(null);

    // Debounce search (450ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 450);
        return () => clearTimeout(timer);
    }, [search]);

    // Load campaigns on filter or pagination change
    useEffect(() => {
        loadCampaigns();
    }, [page, limit, statusFilter, sortOption, debouncedSearch, dateRangeFilter, deliveryFilter, engagementFilter]);

    const parseSortOrder = (val) => {
        if (val === "oldest") return { sortBy: "createdAt", order: "oldest" };
        if (val === "subject_az") return { sortBy: "subject", order: "asc" };
        if (val === "subject_za") return { sortBy: "subject", order: "desc" };
        if (val === "recipients_high") return { sortBy: "recipientCount", order: "highest" };
        if (val === "recipients_low") return { sortBy: "recipientCount", order: "lowest" };
        if (val === "sent_high") return { sortBy: "sentCount", order: "highest" };
        return { sortBy: "createdAt", order: "newest" };
    };

    const loadCampaigns = async () => {
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

            const { sortBy, order } = parseSortOrder(sortOption);

            const res = await newsletterApi.getCampaigns(
                {
                    page,
                    limit,
                    search: debouncedSearch,
                    status: statusFilter,
                    sortBy,
                    order,
                    dateRange: dateRangeFilter,
                    delivery: deliveryFilter,
                    engagement: engagementFilter
                },
                { signal: controller.signal }
            );

            if (currentRequestId !== requestIdRef.current) return;

            if (res.data) {
                setCampaigns(res.data.campaigns || []);
                if (res.data.pagination) setPagination(res.data.pagination);
                if (res.data.summary) setSummary(res.data.summary);
            }
        } catch (err) {
            if (axios.isCancel(err) || err?.name === "CanceledError" || err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
                return;
            }
            if (currentRequestId === requestIdRef.current) {
                console.error("Error loading campaigns:", err);
                toast.error("Failed to load newsletter campaigns.");
            }
        } finally {
            if (currentRequestId === requestIdRef.current) {
                setInitialLoading(false);
                setTableLoading(false);
            }
        }
    };

    const toggleRowRecipients = async (campaignId) => {
        if (expandedRowId === campaignId) {
            setExpandedRowId(null);
            setExpandedRecipients([]);
            return;
        }

        setExpandedRowId(campaignId);
        setExpandedLoading(true);
        try {
            const res = await newsletterApi.getCampaignRecipients(campaignId, { limit: 100 });
            if (res.data && res.data.recipients) {
                setExpandedRecipients(res.data.recipients);
            } else {
                setExpandedRecipients([]);
            }
        } catch (err) {
            console.error("Error loading recipient details:", err);
            toast.error("Failed to load recipient details.");
            setExpandedRecipients([]);
        } finally {
            setExpandedLoading(false);
        }
    };

    const loadModalRecipients = async (campaignId) => {
        setModalRecipientLoading(true);
        try {
            const res = await newsletterApi.getCampaignRecipients(campaignId, {
                limit: 100,
                search: modalRecipientSearch
            });
            if (res.data && res.data.recipients) {
                setModalRecipients(res.data.recipients);
            } else {
                setModalRecipients([]);
            }
        } catch (err) {
            console.error("Error loading modal recipients:", err);
            setModalRecipients([]);
        } finally {
            setModalRecipientLoading(false);
        }
    };

    const handleOpenViewModal = (camp) => {
        setSelectedCampaign(camp);
        setModalActiveTab("recipients");
        setViewModal(true);
        loadModalRecipients(camp._id);
    };

    const handleExportRecipientCsv = async (campaignId, subject) => {
        try {
            toast.loading("Exporting campaign recipients...", { id: "csv-export-camp" });
            const blobData = await newsletterApi.exportCampaignRecipientsCsv(campaignId);
            const blob = new Blob([blobData], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const sanitized = (subject || "campaign").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 25);
            a.download = `recipients_${sanitized}_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success("Recipient CSV exported successfully!", { id: "csv-export-camp" });
        } catch (err) {
            console.error("Export CSV error:", err);
            toast.error("Failed to export recipient CSV.", { id: "csv-export-camp" });
        }
    };

    const handleSendTestEmail = async () => {
        if (!testEmail || !testEmail.trim()) {
            toast.error("Please enter a valid test email address.");
            return;
        }

        try {
            setActionLoading(true);
            const res = await newsletterApi.sendTestEmail(selectedCampaign._id, {
                testEmail: testEmail.trim()
            });
            toast.success(res.message || "Test email sent successfully.");
            setTestEmailModal(false);
            setTestEmail("");
        } catch (err) {
            console.error("Send test email error:", err);
            toast.error(err.response?.data?.message || "Failed to send test email.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendCampaign = async () => {
        if (!selectedCampaign) return;
        try {
            setActionLoading(true);
            const res = await newsletterApi.sendCampaign(selectedCampaign._id);
            toast.success(res.message || "Campaign dispatch completed.");
            setSendConfirmModal(false);
            setSelectedCampaign(null);
            loadCampaigns();
        } catch (err) {
            console.error("Send campaign error:", err);
            toast.error(err.response?.data?.message || "Failed to send campaign.");
            loadCampaigns();
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCampaign = async () => {
        if (!selectedCampaign) return;
        try {
            setActionLoading(true);
            await newsletterApi.deleteCampaign(selectedCampaign._id);
            toast.success("Campaign deleted successfully.");
            setDeleteConfirmModal(false);
            setSelectedCampaign(null);
            loadCampaigns();
        } catch (err) {
            console.error("Delete campaign error:", err);
            toast.error(err.response?.data?.message || "Failed to delete campaign.");
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = String(hours).padStart(2, "0");

        return `${month} ${day}, ${year}, ${formattedHours}:${minutes} ${ampm}`;
    };

    const startIdx = (page - 1) * limit + 1;
    const endIdx = Math.min(page * limit, pagination.total || 0);

    return (
        <div className="admin-crud-panel">
            {/* Header */}
            <div className="campaign-header-row">
                <div>
                    <h1>Newsletter Campaigns & Analytics</h1>
                    <p>Manage email campaigns, view historical recipient delivery snapshots, test broadcasts, and export data.</p>
                </div>

                <Link to="/admin/newsletter-campaigns/create" className="create-campaign-btn">
                    <FiPlus /> Create New Campaign
                </Link>
            </div>

            {/* 5 Compact Summary Analytics Cards */}
            <div className="newsletter-stats-grid-5">
                <div className="newsletter-stat-card">
                    <div className="stat-card-icon gold">
                        <FiSend />
                    </div>
                    <div className="stat-card-content">
                        <h4>Total Campaigns</h4>
                        <p className="stat-number">{summary.totalCampaigns}</p>
                    </div>
                </div>

                <div className="newsletter-stat-card">
                    <div className="stat-card-icon green">
                        <FiCheckCircle />
                    </div>
                    <div className="stat-card-content">
                        <h4>Sent Campaigns</h4>
                        <p className="stat-number">{summary.sentCampaigns}</p>
                    </div>
                </div>

                <div className="newsletter-stat-card">
                    <div className="stat-card-icon blue">
                        <FiClock />
                    </div>
                    <div className="stat-card-content">
                        <h4>Draft Campaigns</h4>
                        <p className="stat-number">{summary.draftCampaigns}</p>
                    </div>
                </div>

                <div className="newsletter-stat-card">
                    <div className="stat-card-icon red">
                        <FiAlertCircle />
                    </div>
                    <div className="stat-card-content">
                        <h4>Failed Campaigns</h4>
                        <p className="stat-number">{summary.failedCampaigns}</p>
                    </div>
                </div>

                <div className="newsletter-stat-card">
                    <div className="stat-card-icon gold">
                        <FiMail />
                    </div>
                    <div className="stat-card-content">
                        <h4>Total Emails Sent</h4>
                        <p className="stat-number">{summary.totalEmailsSent}</p>
                    </div>
                </div>
            </div>

            {/* Controls Bar: Search, Status, Sort, More Filters Toggle */}
            <div className="newsletter-controls-bar">
                <div className="search-filter-wrapper">
                    {/* Search box with debounced spinner */}
                    <div className="admin-search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search campaigns by subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {(search !== debouncedSearch || tableLoading) && (
                            <div className="search-spinner-inline" title="Searching..." />
                        )}
                    </div>

                    {/* Status Filter */}
                    <PremiumSelect
                        id="campaign-status-filter"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        options={[
                            { value: "All", label: "All Statuses" },
                            { value: "draft", label: "Draft Only" },
                            { value: "sending", label: "Sending Only" },
                            { value: "sent", label: "Sent Only" },
                            { value: "failed", label: "Failed Only" }
                        ]}
                    />

                    {/* Sort Select */}
                    <PremiumSelect
                        id="campaign-sort-select"
                        value={sortOption}
                        onChange={(e) => {
                            setSortOption(e.target.value);
                            setPage(1);
                        }}
                        options={[
                            { value: "newest", label: "Sort: Newest First" },
                            { value: "oldest", label: "Sort: Oldest First" },
                            { value: "subject_az", label: "Sort: Subject (A-Z)" },
                            { value: "subject_za", label: "Sort: Subject (Z-A)" },
                            { value: "recipients_high", label: "Sort: Recipients (High)" },
                            { value: "recipients_low", label: "Sort: Recipients (Low)" },
                            { value: "sent_high", label: "Sort: Emails Sent (High)" }
                        ]}
                    />

                    {/* More Filters Toggle */}
                    <button
                        type="button"
                        className={`more-filters-toggle-btn ${showMoreFilters ? "active" : ""}`}
                        onClick={() => setShowMoreFilters(!showMoreFilters)}
                    >
                        <FiFilter /> More Filters {showMoreFilters ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                </div>
            </div>

            {/* Expandable More Filters Panel */}
            {showMoreFilters && (
                <div className="more-filters-panel">
                    <div className="filter-group-item">
                        <label>Date Range</label>
                        <PremiumSelect
                            id="date-range-filter"
                            value={dateRangeFilter}
                            onChange={(e) => {
                                setDateRangeFilter(e.target.value);
                                setPage(1);
                            }}
                            options={[
                                { value: "All Time", label: "All Time" },
                                { value: "today", label: "Created Today" },
                                { value: "7d", label: "Last 7 Days" },
                                { value: "30d", label: "Last 30 Days" },
                                { value: "90d", label: "Last 90 Days" }
                            ]}
                        />
                    </div>

                    <div className="filter-group-item">
                        <label>Delivery Status</label>
                        <PremiumSelect
                            id="delivery-filter"
                            value={deliveryFilter}
                            onChange={(e) => {
                                setDeliveryFilter(e.target.value);
                                setPage(1);
                            }}
                            options={[
                                { value: "All", label: "All Deliveries" },
                                { value: "fully_sent", label: "Fully Sent" },
                                { value: "partially_failed", label: "Partially Failed" },
                                { value: "completely_failed", label: "Completely Failed" }
                            ]}
                        />
                    </div>

                    <div className="filter-group-item">
                        <label>Engagement</label>
                        <PremiumSelect
                            id="engagement-filter"
                            value={engagementFilter}
                            onChange={(e) => {
                                setEngagementFilter(e.target.value);
                                setPage(1);
                            }}
                            options={[
                                { value: "Any", label: "Any Engagement" },
                                { value: "opened", label: "Opened" },
                                { value: "not_opened", label: "Not Opened" },
                                { value: "clicked", label: "Clicked" },
                                { value: "not_clicked", label: "Not Clicked" }
                            ]}
                        />
                    </div>

                    <button
                        type="button"
                        className="reset-filters-btn"
                        onClick={() => {
                            setDateRangeFilter("All Time");
                            setDeliveryFilter("All");
                            setEngagementFilter("Any");
                            setStatusFilter("All");
                            setSearch("");
                            setSortOption("newest");
                            setPage(1);
                        }}
                    >
                        Reset All Filters
                    </button>
                </div>
            )}

            {/* Main Table / Results Container */}
            {initialLoading ? (
                <div className="empty-crud-state" style={{ padding: "60px 20px" }}>
                    <p>Loading newsletter campaigns from database...</p>
                </div>
            ) : (
                <div className="table-wrapper-relative">
                    {tableLoading && (
                        <div className="table-loading-overlay">
                            <div className="table-loading-bar" />
                        </div>
                    )}

                    {campaigns.length === 0 ? (
                        <div className="empty-crud-state">
                            <FiSend className="empty-icon" />
                            <h3>No Campaigns Found</h3>
                            <p>
                                {debouncedSearch || statusFilter !== "All" || dateRangeFilter !== "All Time"
                                    ? "No newsletter campaigns match your search or filter parameters."
                                    : "Click 'Create New Campaign' to draft your first newsletter announcement."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Recipients</th>
                                            <th>Sent</th>
                                            <th>Failed</th>
                                            <th>Opened</th>
                                            <th>Clicked</th>
                                            <th className="date-col-header">Created At</th>
                                            <th className="date-col-header">Sent At</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {campaigns.map((camp) => {
                                            const isExpanded = expandedRowId === camp._id;
                                            return (
                                                <tr key={camp._id} className={isExpanded ? "row-expanded-highlight" : ""}>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            <FiMail style={{ color: "#d4af37", flexShrink: 0 }} />
                                                            <span className="car-title-strong" style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={camp.subject}>
                                                                {camp.subject}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`campaign-status-pill ${camp.status}`}>
                                                            {camp.status === "sent" && <FiCheckCircle />}
                                                            {camp.status === "failed" && <FiAlertCircle />}
                                                            {camp.status === "sending" && <FiClock />}
                                                            {camp.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                            <span className="time-badge">
                                                                <FiUsers /> {camp.recipientCount} active
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="view-recipients-link"
                                                                onClick={() => toggleRowRecipients(camp._id)}
                                                            >
                                                                {isExpanded ? "Hide Recipients" : "View Recipients"} {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#22c55e" }}>
                                                            {camp.sentCount}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#ef4444" }}>
                                                            {camp.failedCount}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="time-badge">
                                                            {camp.openedCount || 0} <span style={{ opacity: 0.6, fontSize: "10px" }}>({camp.openRate || "0.0%"})</span>
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="time-badge">
                                                            {camp.clickedCount || 0} <span style={{ opacity: 0.6, fontSize: "10px" }}>({camp.clickRate || "0.0%"})</span>
                                                        </span>
                                                    </td>
                                                    <td className="newsletter-date-cell">
                                                        <span className="time-badge">{formatDate(camp.createdAt)}</span>
                                                    </td>
                                                    <td className="newsletter-date-cell">
                                                        <span className="time-badge">{formatDate(camp.sentAt)}</span>
                                                    </td>
                                                    <td>
                                                        <div className="actions-cell">
                                                            <button
                                                                type="button"
                                                                className="campaign-action-btn view"
                                                                onClick={() => handleOpenViewModal(camp)}
                                                                title="View Campaign Details & Analytics"
                                                            >
                                                                <FiEye /> View
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="campaign-action-btn view"
                                                                onClick={() => {
                                                                    setSelectedCampaign(camp);
                                                                    setTestEmailModal(true);
                                                                }}
                                                                title="Send Test Email"
                                                            >
                                                                <FiMail /> Test
                                                            </button>

                                                            {camp.status !== "sent" && camp.status !== "sending" && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        className="campaign-action-btn send"
                                                                        onClick={() => {
                                                                            setSelectedCampaign(camp);
                                                                            setSendConfirmModal(true);
                                                                        }}
                                                                        title="Send Campaign Now"
                                                                    >
                                                                        <FiSend /> Send
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="edit-btn"
                                                                        onClick={() => navigate(`/admin/newsletter-campaigns/edit/${camp._id}`)}
                                                                        title="Edit Draft"
                                                                    >
                                                                        <FiEdit2 />
                                                                    </button>
                                                                </>
                                                            )}

                                                            <button
                                                                type="button"
                                                                className="delete-btn"
                                                                onClick={() => {
                                                                    setSelectedCampaign(camp);
                                                                    setDeleteConfirmModal(true);
                                                                }}
                                                                title="Delete Campaign"
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

                            {/* Inline Recipient Snapshot Details Drawer */}
                            {expandedRowId && (
                                <div className="expanded-recipients-drawer">
                                    <div className="drawer-header">
                                        <h4>
                                            <FiUsers style={{ color: "#d4af37" }} /> Campaign Recipient Snapshot ({expandedRecipients.length})
                                        </h4>

                                        <button
                                            type="button"
                                            className="export-csv-btn"
                                            style={{ padding: "6px 12px", fontSize: "11px" }}
                                            onClick={() => {
                                                const currentCamp = campaigns.find((c) => c._id === expandedRowId);
                                                handleExportRecipientCsv(expandedRowId, currentCamp?.subject);
                                            }}
                                        >
                                            <FiDownload /> Export Recipients CSV
                                        </button>
                                    </div>

                                    {expandedLoading ? (
                                        <div style={{ padding: "20px", textAlign: "center", color: "#8a8a93", fontSize: "13px" }}>
                                            Loading real recipient snapshot from database...
                                        </div>
                                    ) : expandedRecipients.length === 0 ? (
                                        <div style={{ padding: "20px", textAlign: "center", color: "#8a8a93", fontSize: "13px" }}>
                                            No recipient snapshot records found for this campaign.
                                        </div>
                                    ) : (
                                        <div className="recipient-snapshot-table-wrapper">
                                            <table className="recipient-snapshot-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Email Address</th>
                                                        <th>Status</th>
                                                        <th>Sent At</th>
                                                        <th>Opened At</th>
                                                        <th>Clicked At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {expandedRecipients.map((rec, index) => (
                                                        <tr key={rec._id || index}>
                                                            <td>{index + 1}</td>
                                                            <td className="car-title-strong">{rec.email}</td>
                                                            <td>
                                                                <span className={`badge-status ${rec.status === "sent" ? "success" : rec.status === "failed" ? "danger" : "warning"}`}>
                                                                    {rec.status}
                                                                </span>
                                                            </td>
                                                            <td className="newsletter-date-cell">{formatDate(rec.sentAt)}</td>
                                                            <td className="newsletter-date-cell">{rec.openedAt ? formatDate(rec.openedAt) : "—"}</td>
                                                            <td className="newsletter-date-cell">{rec.clickedAt ? formatDate(rec.clickedAt) : "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            <div className="leads-pagination-footer" style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", color: "#8a8a93", fontSize: "13px" }}>
                                <span>
                                    Showing {pagination.total > 0 ? startIdx : 0}–{endIdx} of {pagination.total} campaigns
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

            {/* Campaign Detail Modal with 4 Tabs */}
            {viewModal && selectedCampaign && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card large">
                        <div className="modal-header">
                            <div>
                                <span style={{ fontSize: "11px", color: "#8a8a93", textTransform: "uppercase" }}>Campaign Dashboard</span>
                                <h3 style={{ color: "#d4af37", margin: "2px 0 0 0" }}>{selectedCampaign.subject}</h3>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setViewModal(false)}>&times;</button>
                        </div>

                        {/* Modal Navigation Tabs */}
                        <div className="modal-tab-bar">
                            <button
                                type="button"
                                className={`modal-tab-btn ${modalActiveTab === "recipients" ? "active" : ""}`}
                                onClick={() => setModalActiveTab("recipients")}
                            >
                                <FiUsers /> Recipients Snapshot
                            </button>
                            <button
                                type="button"
                                className={`modal-tab-btn ${modalActiveTab === "content" ? "active" : ""}`}
                                onClick={() => setModalActiveTab("content")}
                            >
                                <FiFileText /> Email Content
                            </button>
                            <button
                                type="button"
                                className={`modal-tab-btn ${modalActiveTab === "analytics" ? "active" : ""}`}
                                onClick={() => setModalActiveTab("analytics")}
                            >
                                <FiBarChart2 /> Analytics Metrics
                            </button>
                            <button
                                type="button"
                                className={`modal-tab-btn ${modalActiveTab === "links" ? "active" : ""}`}
                                onClick={() => setModalActiveTab("links")}
                            >
                                <FiLink /> Links Clicked
                            </button>
                        </div>

                        <div className="modal-form">
                            {/* Tab 1: Recipients Snapshot */}
                            {modalActiveTab === "recipients" && (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                                        <div style={{ display: "flex", gap: "15px", fontSize: "13px" }}>
                                            <span><strong>Recipients:</strong> {selectedCampaign.recipientCount}</span>
                                            <span><strong style={{ color: "#22c55e" }}>Sent:</strong> {selectedCampaign.sentCount}</span>
                                            <span><strong style={{ color: "#ef4444" }}>Failed:</strong> {selectedCampaign.failedCount}</span>
                                        </div>

                                        <button
                                            type="button"
                                            className="export-csv-btn"
                                            onClick={() => handleExportRecipientCsv(selectedCampaign._id, selectedCampaign.subject)}
                                        >
                                            <FiDownload /> Export Recipients CSV
                                        </button>
                                    </div>

                                    {modalRecipientLoading ? (
                                        <p style={{ color: "#8a8a93", textAlign: "center", padding: "30px 0" }}>
                                            Loading recipient snapshot from MongoDB...
                                        </p>
                                    ) : modalRecipients.length === 0 ? (
                                        <p style={{ color: "#8a8a93", textAlign: "center", padding: "30px 0" }}>
                                            No recipient records recorded for this campaign.
                                        </p>
                                    ) : (
                                        <div className="recipient-snapshot-table-wrapper" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                            <table className="recipient-snapshot-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Email Address</th>
                                                        <th>Status</th>
                                                        <th>Sent At</th>
                                                        <th>Opened At</th>
                                                        <th>Clicked At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {modalRecipients.map((rec, index) => (
                                                        <tr key={rec._id || index}>
                                                            <td>{index + 1}</td>
                                                            <td className="car-title-strong">{rec.email}</td>
                                                            <td>
                                                                <span className={`badge-status ${rec.status === "sent" ? "success" : rec.status === "failed" ? "danger" : "warning"}`}>
                                                                    {rec.status}
                                                                </span>
                                                            </td>
                                                            <td className="newsletter-date-cell">{formatDate(rec.sentAt)}</td>
                                                            <td className="newsletter-date-cell">{rec.openedAt ? formatDate(rec.openedAt) : "—"}</td>
                                                            <td className="newsletter-date-cell">{rec.clickedAt ? formatDate(rec.clickedAt) : "—"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Email Content */}
                            {modalActiveTab === "content" && (
                                <div>
                                    <label style={{ fontSize: "11px", color: "#8a8a93", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>HTML Body Preview</label>
                                    <div
                                        className="preview-body-box"
                                        dangerouslySetInnerHTML={{ __html: selectedCampaign.content }}
                                    />
                                </div>
                            )}

                            {/* Tab 3: Analytics Metrics */}
                            {modalActiveTab === "analytics" && (
                                <div className="analytics-tab-grid">
                                    <div className="metric-card">
                                        <label>Total Recipients</label>
                                        <span>{selectedCampaign.recipientCount}</span>
                                    </div>
                                    <div className="metric-card green">
                                        <label>Sent</label>
                                        <span>{selectedCampaign.sentCount}</span>
                                    </div>
                                    <div className="metric-card red">
                                        <label>Failed</label>
                                        <span>{selectedCampaign.failedCount}</span>
                                    </div>
                                    <div className="metric-card blue">
                                        <label>Opened</label>
                                        <span>{selectedCampaign.openedCount || 0}</span>
                                    </div>
                                    <div className="metric-card gold">
                                        <label>Clicked</label>
                                        <span>{selectedCampaign.clickedCount || 0}</span>
                                    </div>
                                    <div className="metric-card">
                                        <label>Open Rate</label>
                                        <span>{selectedCampaign.openRate || "0.0%"}</span>
                                    </div>
                                    <div className="metric-card">
                                        <label>Click Rate</label>
                                        <span>{selectedCampaign.clickRate || "0.0%"}</span>
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Links Clicked */}
                            {modalActiveTab === "links" && (
                                <div>
                                    <p style={{ color: "#8a8a93", fontSize: "13px", marginBottom: "15px" }}>
                                        Tracked links embedded within this campaign newsletter.
                                    </p>
                                    <div className="recipient-snapshot-table-wrapper">
                                        <table className="recipient-snapshot-table">
                                            <thead>
                                                <tr>
                                                    <th>Target URL</th>
                                                    <th>Total Clicks</th>
                                                    <th>Unique Visitors</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: "center", color: "#8a8a93", padding: "20px" }}>
                                                        No link tracking events recorded for this broadcast. Architecture ready for tracking.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {selectedCampaign.errorMessage && (
                                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "12px 16px", borderRadius: "10px", color: "#ef4444", fontSize: "13px", marginTop: "15px" }}>
                                    <strong>Status Error:</strong> {selectedCampaign.errorMessage}
                                </div>
                            )}

                            <div className="modal-actions-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setViewModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Test Email Modal */}
            {testEmailModal && selectedCampaign && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card">
                        <div className="modal-header">
                            <h3>Send Test Campaign Email</h3>
                            <button type="button" className="modal-close" onClick={() => setTestEmailModal(false)}>&times;</button>
                        </div>
                        <div className="modal-form">
                            <p style={{ color: "#d1d5db", fontSize: "13px", margin: 0 }}>
                                Send a test preview of <strong>"{selectedCampaign.subject}"</strong> to an administrator email address.
                            </p>

                            <div className="modal-form-group">
                                <label>Test Email Address</label>
                                <input
                                    type="email"
                                    placeholder="Enter test recipient email..."
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setTestEmailModal(false)} disabled={actionLoading}>Cancel</button>
                                <button type="button" className="submit-btn" onClick={handleSendTestEmail} disabled={actionLoading}>
                                    {actionLoading ? "Sending Test..." : "Send Test Email"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Confirmation Modal */}
            {sendConfirmModal && selectedCampaign && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card">
                        <div className="modal-header">
                            <h3>Confirm Newsletter Dispatch</h3>
                            <button type="button" className="modal-close" onClick={() => setSendConfirmModal(false)}>&times;</button>
                        </div>
                        <div className="modal-form">
                            <p style={{ color: "#d1d5db", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                                Are you ready to dispatch <strong>"{selectedCampaign.subject}"</strong>?
                            </p>
                            <div style={{ background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.2)", padding: "14px", borderRadius: "10px", color: "#d4af37", fontSize: "13px" }}>
                                <strong>Active Recipients:</strong> {selectedCampaign.recipientCount} subscribers from MongoDB.
                            </div>
                            <span style={{ fontSize: "12px", color: "#71717a" }}>
                                Note: If SMTP credentials are not configured in environment variables, campaign sending will halt and report a configuration error without creating fake sent counts.
                            </span>

                            <div className="modal-actions-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setSendConfirmModal(false)} disabled={actionLoading}>Cancel</button>
                                <button type="button" className="submit-btn" onClick={handleSendCampaign} disabled={actionLoading}>
                                    {actionLoading ? "Dispatching..." : "Send Newsletter"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteConfirmModal && selectedCampaign && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card">
                        <div className="modal-header">
                            <h3>Confirm Delete Campaign</h3>
                            <button type="button" className="modal-close" onClick={() => setDeleteConfirmModal(false)}>&times;</button>
                        </div>
                        <div className="modal-form">
                            <p style={{ color: "#d1d5db", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                                Are you sure you want to permanently delete campaign <strong>"{selectedCampaign.subject}"</strong>?
                            </p>

                            <div className="modal-actions-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setDeleteConfirmModal(false)} disabled={actionLoading}>Cancel</button>
                                <button type="button" className="submit-btn" style={{ background: "#ef4444", color: "#fff" }} onClick={handleDeleteCampaign} disabled={actionLoading}>
                                    {actionLoading ? "Deleting..." : "Delete Campaign"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NewsletterCampaigns;
