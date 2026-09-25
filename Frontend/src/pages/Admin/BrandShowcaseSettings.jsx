import { useState, useEffect } from "react";
import { brandShowcaseSettingsApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiType, FiEye, FiSave, FiLayers, FiCheckCircle } from "react-icons/fi";
import "./HeroSettings.css";

function BrandShowcaseSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state - exactly 3 settings as requested
    const [smallHeading, setSmallHeading] = useState("WORLD'S FINEST AUTOMOBILE BRANDS");
    const [mainHeading, setMainHeading] = useState("Luxury Brands");
    const [showSection, setShowSection] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await brandShowcaseSettingsApi.getPublic();
            if (data) {
                setSmallHeading(data.smallHeading || "WORLD'S FINEST AUTOMOBILE BRANDS");
                setMainHeading(data.mainHeading || "Luxury Brands");
                setShowSection(data.showSection !== undefined ? data.showSection : true);
            }
        } catch (err) {
            console.error("Error loading brand showcase settings:", err);
            toast.error("Failed to load brand showcase settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                smallHeading,
                mainHeading,
                showSection
            };

            await brandShowcaseSettingsApi.update(payload);
            toast.success("Brand Showcase Settings saved successfully!");
        } catch (err) {
            console.error("Save brand showcase settings error:", err);
            toast.error(err.response?.data?.message || "Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-crud-panel">
                <div className="empty-crud-state" style={{ padding: "80px 20px" }}>
                    <p>Loading Brand Showcase Settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-crud-panel hero-settings-panel">
            {/* Header Bar */}
            <div className="campaign-header-row" style={{ marginBottom: "25px" }}>
                <div>
                    <h1>Brand Showcase Settings</h1>
                    <p>Manage the headings and visibility of the Luxury Brands section on the homepage.</p>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a href="/" target="_blank" rel="noreferrer" className="campaign-action-btn view" style={{ textDecoration: "none", padding: "10px 18px", borderRadius: "10px" }}>
                        <FiEye /> Preview Website
                    </a>

                    <button type="button" className="create-campaign-btn" onClick={handleSave} disabled={saving}>
                        <FiSave /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="hero-settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "25px", maxWidth: "800px" }}>
                {/* Headings & Visibility Settings */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 20px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiLayers /> Luxury Brands Showcase Configuration
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* 1. Small Heading */}
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>
                                <FiType /> Small Subtitle / Sub-Heading
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. WORLD'S FINEST AUTOMOBILE BRANDS"
                                value={smallHeading}
                                onChange={(e) => setSmallHeading(e.target.value)}
                                style={{ width: "100%", padding: "12px 16px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "#fff", fontSize: "14px" }}
                            />
                        </div>

                        {/* 2. Main Heading */}
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>
                                <FiType /> Main Section Title / Heading
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Luxury Brands"
                                value={mainHeading}
                                onChange={(e) => setMainHeading(e.target.value)}
                                style={{ width: "100%", padding: "12px 16px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "#fff", fontSize: "14px" }}
                            />
                        </div>

                        {/* 3. Section Visibility */}
                        <div style={{ marginTop: "10px" }}>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>
                                <FiCheckCircle /> Section Display Visibility
                            </label>
                            <label style={{ background: "rgba(0,0,0,0.3)", padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", display: "inline-flex", alignItems: "center", gap: "12px", cursor: "pointer", color: "#fff", fontSize: "14px" }}>
                                <input
                                    type="checkbox"
                                    checked={showSection}
                                    onChange={(e) => setShowSection(e.target.checked)}
                                    style={{ width: "18px", height: "18px", accentColor: "#d4af37" }}
                                />
                                Show Luxury Brands section on homepage
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-start", maxWidth: "800px" }}>
                <button type="button" className="create-campaign-btn" onClick={handleSave} disabled={saving}>
                    <FiSave /> {saving ? "Saving..." : "Save Brand Showcase Settings"}
                </button>
            </div>
        </div>
    );
}

export default BrandShowcaseSettings;
