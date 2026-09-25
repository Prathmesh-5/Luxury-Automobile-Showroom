import { useState, useEffect } from "react";
import { dashboardApi, settingsApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    FiTruck, FiLayers, FiMail, FiCalendar, 
    FiRefreshCw, FiCheckCircle, FiAlertTriangle, FiSliders, FiClock 
} from "react-icons/fi";
import "./Dashboard.css";

function Dashboard() {
    // Analytics States
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Sync settings states
    const [spreadsheetId, setSpreadsheetId] = useState("");
    const [sheetName, setSheetName] = useState("Sheet1");
    const [syncEnabled, setSyncEnabled] = useState(false);
    const [syncInterval, setSyncInterval] = useState(5);
    const [lastSync, setLastSync] = useState(null);
    const [syncErrors, setSyncErrors] = useState([]);
    
    const [updatingSettings, setUpdatingSettings] = useState(false);
    const [syncingNow, setSyncingNow] = useState(false);

    const loadDashboardData = async () => {
        setLoadingStats(true);
        try {
            const data = await dashboardApi.getStats();
            setStats(data);
        } catch (err) {
            console.error("Failed to load dashboard stats:", err);
            toast.error("Analytics data failed to load.");
        } finally {
            setLoadingStats(false);
        }
    };

    const loadSettingsData = async () => {
        try {
            const settings = await settingsApi.get();
            setSpreadsheetId(settings.googleSpreadsheetId || settings.googleSheetUrl || "");
            setSheetName(settings.googleSheetName || "Sheet1");
            setSyncEnabled(settings.syncEnabled || false);
            setSyncInterval(settings.syncIntervalMinutes || 5);
            setLastSync(settings.lastSyncTime);
            setSyncErrors(settings.syncErrors || []);
        } catch (err) {
            console.error("Failed to load synchronization settings:", err);
        }
    };

    useEffect(() => {
        loadDashboardData();
        loadSettingsData();
    }, []);

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setUpdatingSettings(true);
        try {
            await settingsApi.update({
                googleSpreadsheetId: spreadsheetId,
                googleSheetName: sheetName,
                syncEnabled,
                syncIntervalMinutes: parseInt(syncInterval)
            });
            toast.success("Synchronization configuration updated!");
            loadSettingsData();
        } catch (err) {
            console.error("Failed to save settings:", err);
            toast.error("Settings configuration update failed.");
        } finally {
            setUpdatingSettings(false);
        }
    };

    const handleTriggerSyncNow = async () => {
        if (!spreadsheetId) {
            toast.error("Configure a Spreadsheet ID or URL first.");
            return;
        }
        setSyncingNow(true);
        toast.loading("Synchronizing active spreadsheet rows...", { id: "sync-progress" });
        try {
            const res = await settingsApi.triggerSync();
            toast.success(res.message || `Sync completed! Modified count: ${res.data?.count || 0}`, { id: "sync-progress" });
            
            // Reload settings and dashboard counters
            await loadSettingsData();
            await loadDashboardData();
        } catch (err) {
            console.error("Sync trigger error:", err);
            toast.error(err.response?.data?.message || "Sync execution failed.", { id: "sync-progress" });
            loadSettingsData();
        } finally {
            setSyncingNow(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Never";
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div className="admin-dashboard-page">
            <div className="admin-page-header">
                <h1>Overview Dashboard</h1>
                <p>Welcome to your showroom administration control center.</p>
            </div>

            {/* Loading Stats Spinner */}
            {loadingStats ? (
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Loading analytics details...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards Grid */}
                    <div className="stats-cards-grid">
                        <div className="stat-overview-card font-gold">
                            <div className="stat-info">
                                <span>Active Inventory</span>
                                <h2>{stats?.totalCars || 0}</h2>
                            </div>
                            <FiTruck className="stat-card-icon" />
                        </div>
                        
                        <div className="stat-overview-card font-blue">
                            <div className="stat-info">
                                <span>Seeded Brands</span>
                                <h2>{stats?.totalBrands || 0}</h2>
                            </div>
                            <FiLayers className="stat-card-icon" />
                        </div>

                        <div className="stat-overview-card font-green">
                            <div className="stat-info">
                                <span>Total Enquiries</span>
                                <h2>{stats?.totalLeads || 0}</h2>
                            </div>
                            <FiMail className="stat-card-icon" />
                        </div>

                        <div className="stat-overview-card font-purple">
                            <div className="stat-info">
                                <span>Test Drive Bookings</span>
                                <h2>{stats?.totalTestDrives || 0}</h2>
                            </div>
                            <FiCalendar className="stat-card-icon" />
                        </div>
                    </div>

                    {/* Double Panel Layout */}
                    <div className="dashboard-double-panel">
                        
                        {/* Left Side: Recent enquiries */}
                        <div className="dashboard-panel-left">
                            <div className="recent-list-card">
                                <h3>Recent Customer Enquiries</h3>
                                {stats?.recentLeads && stats.recentLeads.length > 0 ? (
                                    <div className="recent-items-stack">
                                        {stats.recentLeads.map((lead) => (
                                            <div className="recent-item" key={lead._id}>
                                                <div className="item-meta">
                                                    <strong>{lead.name}</strong>
                                                    <span>{lead.email}</span>
                                                    <span className="car-badge-mini">
                                                        {lead.carId ? `${lead.carId.name} ${lead.carId.model}` : "General Enquiry"}
                                                    </span>
                                                </div>
                                                <div className={`status-badge-mini ${lead.status.toLowerCase()}`}>
                                                    {lead.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="empty-panel-text">No incoming inquiries found.</p>
                                )}
                            </div>

                            <div className="recent-list-card" style={{ marginTop: "30px" }}>
                                <h3>Recent Test Drive Slots</h3>
                                {stats?.recentTestDrives && stats.recentTestDrives.length > 0 ? (
                                    <div className="recent-items-stack">
                                        {stats.recentTestDrives.map((td) => (
                                            <div className="recent-item" key={td._id}>
                                                <div className="item-meta">
                                                    <strong>{td.name}</strong>
                                                    <span>{td.phone}</span>
                                                    <span className="car-badge-mini">
                                                        {td.carId ? `${td.carId.name} ${td.carId.model}` : "Unknown Model"}
                                                    </span>
                                                </div>
                                                <div className="slot-time-badge">
                                                    <FiClock className="icon" /> {new Date(td.preferredDate).toLocaleDateString()} - {td.preferredTime.split(" ")[0]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="empty-panel-text">No drive slots booked.</p>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Google Sheets Sync Controls */}
                        <div className="dashboard-panel-right">
                            <div className="sync-controller-card">
                                <div className="card-title-bar">
                                    <FiSliders className="card-icon" />
                                    <h3>Automated Spreadsheet Sync</h3>
                                </div>

                                <form onSubmit={handleUpdateSettings} className="sync-config-form">
                                    <div className="sync-form-field">
                                        <label>Google Spreadsheet ID or URL</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
                                            value={spreadsheetId}
                                            onChange={(e) => setSpreadsheetId(e.target.value)}
                                            required
                                        />
                                        <span className="field-tip">
                                            Enter the Google Spreadsheet ID (found in the sheet URL) or the full URL.
                                        </span>
                                    </div>

                                    <div className="sync-form-field">
                                        <label>Google Sheet Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Sheet1"
                                            value={sheetName}
                                            onChange={(e) => setSheetName(e.target.value)}
                                            required
                                        />
                                        <span className="field-tip">
                                            The tab name in your spreadsheet (e.g. Sheet1, Inventory).
                                        </span>
                                    </div>

                                    <div className="sync-form-row">
                                        <div className="sync-form-field half">
                                            <label>Sync Interval (Minutes)</label>
                                            <input 
                                                type="number" 
                                                min="5" 
                                                value={syncInterval}
                                                onChange={(e) => setSyncInterval(e.target.value)}
                                            />
                                        </div>
                                        <div className="sync-form-field half checkbox-field">
                                            <label className="checkbox-container">
                                                <input 
                                                    type="checkbox" 
                                                    checked={syncEnabled}
                                                    onChange={(e) => setSyncEnabled(e.target.checked)}
                                                />
                                                <span className="checkbox-label">Enable Auto-Sync</span>
                                            </label>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="save-config-btn"
                                        disabled={updatingSettings}
                                    >
                                        {updatingSettings ? "Saving Settings..." : "Save Settings"}
                                    </button>
                                </form>

                                <div className="manual-sync-trigger-box">
                                    <div className="last-sync-tag">
                                        Last sync completed: <strong>{formatDate(lastSync)}</strong>
                                    </div>
                                    <button 
                                        className={`trigger-sync-btn ${syncingNow ? "spinning" : ""}`}
                                        onClick={handleTriggerSyncNow}
                                        disabled={syncingNow}
                                    >
                                        <FiRefreshCw className="icon" /> Trigger Sync Now
                                    </button>
                                </div>

                                {/* Sync Errors List */}
                                {syncErrors.length > 0 && (
                                    <div className="sync-errors-alert">
                                        <h4>
                                            <FiAlertTriangle /> Sync Warnings ({syncErrors.length})
                                        </h4>
                                        <div className="errors-box">
                                            {syncErrors.map((err, index) => (
                                                <div className="err-line" key={index}>
                                                    &bull; {err}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;
