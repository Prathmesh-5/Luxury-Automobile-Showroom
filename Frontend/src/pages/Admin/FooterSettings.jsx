import { useState, useEffect } from "react";
import { footerSettingsApi, uploadApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    FiImage, FiType, FiLink2, FiPhone, FiMail, 
    FiMapPin, FiClock, FiShare2, FiSend, 
    FiSave, FiRefreshCw, FiEye, FiUploadCloud, 
    FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiCheckCircle
} from "react-icons/fi";
import "./HeroSettings.css";

const DEFAULT_QUICK_LINKS = [
    { title: "Our Inventory", url: "/cars", isExternal: false, enabled: true, order: 1 },
    { title: "Sell Your Car", url: "/sell-your-car", isExternal: false, enabled: true, order: 2 },
    { title: "About Us", url: "/about", isExternal: false, enabled: true, order: 3 },
    { title: "Contact Support", url: "/contact", isExternal: false, enabled: true, order: 4 },
    { title: "FAQs / Chatbot", url: "/faq", isExternal: false, enabled: true, order: 5 }
];

const DEFAULT_SOCIAL_LINKS = [
    { platform: "Facebook", url: "#", icon: "facebook", enabled: true },
    { platform: "Instagram", url: "#", icon: "instagram", enabled: true },
    { platform: "Twitter", url: "#", icon: "twitter", enabled: true },
    { platform: "YouTube", url: "#", icon: "youtube", enabled: true }
];

function FooterSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [uploadingField, setUploadingField] = useState(null);

    // Form state
    const [logoUrl, setLogoUrl] = useState("");
    const [description, setDescription] = useState("");
    const [quickLinks, setQuickLinks] = useState([]);
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [businessHours, setBusinessHours] = useState("");
    const [socialLinks, setSocialLinks] = useState([]);
    const [newsletterHeading, setNewsletterHeading] = useState("");
    const [newsletterDescription, setNewsletterDescription] = useState("");
    const [newsletterPlaceholder, setNewsletterPlaceholder] = useState("");
    const [newsletterButtonText, setNewsletterButtonText] = useState("");
    const [carImageUrl, setCarImageUrl] = useState("");
    const [carImageAlt, setCarImageAlt] = useState("");
    const [copyrightText, setCopyrightText] = useState("");
    const [autoCurrentYear, setAutoCurrentYear] = useState(true);

    // Visibility toggles
    const [showLogo, setShowLogo] = useState(true);
    const [showDescription, setShowDescription] = useState(true);
    const [showSocialLinks, setShowSocialLinks] = useState(true);
    const [showQuickLinks, setShowQuickLinks] = useState(true);
    const [showShowroomInfo, setShowShowroomInfo] = useState(true);
    const [showNewsletter, setShowNewsletter] = useState(true);
    const [showCarImage, setShowCarImage] = useState(true);
    const [showCopyright, setShowCopyright] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await footerSettingsApi.getPublic();
            if (data) {
                setLogoUrl(data.logoUrl || "");
                setDescription(data.description || "Discover an exclusive collection of luxury, sports, and exotic automobiles. We define excellence and bespoke automotive experiences.");
                setQuickLinks(data.quickLinks && data.quickLinks.length > 0 ? data.quickLinks : DEFAULT_QUICK_LINKS);
                setAddress(data.address || "Sheikh Zayed Road, Al Quoz 3, Dubai, UAE");
                setPhone(data.phone || "+971 4 000 0000");
                setEmail(data.email || "info@apexluxury.ae");
                setBusinessHours(data.businessHours || "Mon - Sat: 9:00 AM - 9:00 PM");
                setSocialLinks(data.socialLinks && data.socialLinks.length > 0 ? data.socialLinks : DEFAULT_SOCIAL_LINKS);
                setNewsletterHeading(data.newsletterHeading || "Newsletter");
                setNewsletterDescription(data.newsletterDescription || "Subscribe to receive updates on our latest luxury arrivals.");
                setNewsletterPlaceholder(data.newsletterPlaceholder || "Your Email Address");
                setNewsletterButtonText(data.newsletterButtonText || "Subscribe");
                setCarImageUrl(data.carImageUrl || "");
                setCarImageAlt(data.carImageAlt || "Luxury Sports Car");
                setCopyrightText(data.copyrightText || "Apex Luxury Showroom. All Rights Reserved.");
                setAutoCurrentYear(data.autoCurrentYear !== undefined ? data.autoCurrentYear : true);

                setShowLogo(data.showLogo !== undefined ? data.showLogo : true);
                setShowDescription(data.showDescription !== undefined ? data.showDescription : true);
                setShowSocialLinks(data.showSocialLinks !== undefined ? data.showSocialLinks : true);
                setShowQuickLinks(data.showQuickLinks !== undefined ? data.showQuickLinks : true);
                setShowShowroomInfo(data.showShowroomInfo !== undefined ? data.showShowroomInfo : true);
                setShowNewsletter(data.showNewsletter !== undefined ? data.showNewsletter : true);
                setShowCarImage(data.showCarImage !== undefined ? data.showCarImage : true);
                setShowCopyright(data.showCopyright !== undefined ? data.showCopyright : true);
            }
        } catch (err) {
            console.error("Error loading footer settings:", err);
            toast.error("Failed to load footer settings.");
        } finally {
            setLoading(false);
        }
    };

    const getFullImageUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${path}`;
    };

    const handleFileUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingField(fieldName);
            toast.loading(`Uploading image...`, { id: "upload-toast" });

            const uploadedPaths = await uploadApi.uploadImages([file]);
            if (uploadedPaths && uploadedPaths.length > 0) {
                const path = uploadedPaths[0];
                if (fieldName === "logoUrl") setLogoUrl(path);
                if (fieldName === "carImageUrl") setCarImageUrl(path);
                toast.success("Image uploaded successfully!", { id: "upload-toast" });
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload image.", { id: "upload-toast" });
        } finally {
            setUploadingField(null);
        }
    };

    // Quick Links Handlers
    const handleAddQuickLink = () => {
        setQuickLinks([
            ...quickLinks,
            { title: "New Link", url: "/", isExternal: false, enabled: true, order: quickLinks.length + 1 }
        ]);
    };

    const handleUpdateQuickLink = (index, field, value) => {
        const updated = [...quickLinks];
        updated[index] = { ...updated[index], [field]: value };
        setQuickLinks(updated);
    };

    const handleRemoveQuickLink = (index) => {
        setQuickLinks(quickLinks.filter((_, i) => i !== index));
    };

    const handleMoveQuickLink = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === quickLinks.length - 1)) return;
        const updated = [...quickLinks];
        const temp = updated[index];
        updated[index] = updated[index + direction];
        updated[index + direction] = temp;
        setQuickLinks(updated);
    };

    // Social Links Handlers
    const handleAddSocialLink = () => {
        setSocialLinks([
            ...socialLinks,
            { platform: "New Platform", url: "#", icon: "facebook", enabled: true }
        ]);
    };

    const handleUpdateSocialLink = (index, field, value) => {
        const updated = [...socialLinks];
        updated[index] = { ...updated[index], [field]: value };
        setSocialLinks(updated);
    };

    const handleRemoveSocialLink = (index) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                logoUrl,
                description,
                quickLinks,
                address,
                phone,
                email,
                businessHours,
                socialLinks,
                newsletterHeading,
                newsletterDescription,
                newsletterPlaceholder,
                newsletterButtonText,
                carImageUrl,
                carImageAlt,
                copyrightText,
                autoCurrentYear,
                showLogo,
                showDescription,
                showSocialLinks,
                showQuickLinks,
                showShowroomInfo,
                showNewsletter,
                showCarImage,
                showCopyright
            };

            await footerSettingsApi.update(payload);
            toast.success("Footer Settings saved successfully!");
        } catch (err) {
            console.error("Save footer settings error:", err);
            toast.error(err.response?.data?.message || "Failed to save footer settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Are you sure you want to reset all footer settings to standard production defaults?")) {
            return;
        }

        try {
            setResetting(true);
            await footerSettingsApi.reset();
            toast.success("Footer settings reset to default values.");
            loadSettings();
        } catch (err) {
            console.error("Reset footer settings error:", err);
            toast.error("Failed to reset footer settings.");
        } finally {
            setResetting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-crud-panel">
                <div className="empty-crud-state" style={{ padding: "80px 20px" }}>
                    <p>Loading Footer Settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-crud-panel hero-settings-panel">
            {/* Header Bar */}
            <div className="campaign-header-row" style={{ marginBottom: "25px" }}>
                <div>
                    <h1>Public Footer CMS Settings</h1>
                    <p>Manage content displayed on the public website footer without altering the visual design or layout.</p>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a href="/" target="_blank" rel="noreferrer" className="campaign-action-btn view" style={{ textDecoration: "none", padding: "10px 18px", borderRadius: "10px" }}>
                        <FiEye /> Preview Public Footer
                    </a>

                    <button type="button" className="reset-filters-btn" onClick={handleReset} disabled={resetting || saving}>
                        <FiRefreshCw /> {resetting ? "Resetting..." : "Reset Defaults"}
                    </button>

                    <button type="button" className="create-campaign-btn" onClick={handleSave} disabled={saving || resetting}>
                        <FiSave /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="hero-settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "25px" }}>
                {/* 1. Brand Logo & Description */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 16px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiImage /> 1. Brand Logo & Description
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Footer Logo</label>
                            <input
                                type="text"
                                className="admin-search-box"
                                placeholder="Logo Image Path or URL (e.g. /src/assets/images/logo/logo.png)"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />

                            <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                                <label className="campaign-action-btn view" style={{ cursor: "pointer", fontSize: "12px", padding: "8px 14px" }}>
                                    <FiUploadCloud /> {uploadingField === "logoUrl" ? "Uploading..." : "Upload Logo"}
                                    <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, "logoUrl")} disabled={uploadingField !== null} />
                                </label>

                                {logoUrl && (
                                    <button type="button" className="reset-filters-btn" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => setLogoUrl("")}>
                                        Use Default Logo
                                    </button>
                                )}
                            </div>

                            {logoUrl && (
                                <div style={{ marginTop: "12px", background: "#000", padding: "10px", borderRadius: "8px", display: "inline-block" }}>
                                    <img src={getFullImageUrl(logoUrl)} alt="Logo Preview" style={{ maxHeight: "60px", display: "block" }} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Brand Description Text</label>
                            <textarea
                                rows={4}
                                placeholder="Footer description paragraph..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", resize: "vertical" }}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Quick Links Management */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ color: "#d4af37", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FiLink2 /> 2. Quick Links
                        </h3>
                        <button type="button" className="campaign-action-btn send" style={{ fontSize: "12px", padding: "6px 14px" }} onClick={handleAddQuickLink}>
                            <FiPlus /> Add New Link
                        </button>
                    </div>

                    <div className="recipient-snapshot-table-wrapper">
                        <table className="recipient-snapshot-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Link Title</th>
                                    <th>Target URL</th>
                                    <th>Type</th>
                                    <th>Enabled</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quickLinks.map((link, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <input
                                                type="text"
                                                value={link.title}
                                                onChange={(e) => handleUpdateQuickLink(idx, "title", e.target.value)}
                                                style={{ width: "100%", padding: "6px 10px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "13px" }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={link.url}
                                                onChange={(e) => handleUpdateQuickLink(idx, "url", e.target.value)}
                                                style={{ width: "100%", padding: "6px 10px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "13px" }}
                                            />
                                        </td>
                                        <td>
                                            <label style={{ fontSize: "12px", color: "#d1d5db", cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={link.isExternal}
                                                    onChange={(e) => handleUpdateQuickLink(idx, "isExternal", e.target.checked)}
                                                    style={{ marginRight: "6px" }}
                                                />
                                                External
                                            </label>
                                        </td>
                                        <td>
                                            <label style={{ fontSize: "12px", color: link.enabled ? "#22c55e" : "#ef4444", cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={link.enabled !== false}
                                                    onChange={(e) => handleUpdateQuickLink(idx, "enabled", e.target.checked)}
                                                    style={{ marginRight: "6px" }}
                                                />
                                                {link.enabled !== false ? "Active" : "Disabled"}
                                            </label>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button type="button" className="campaign-action-btn view" style={{ padding: "4px 8px" }} disabled={idx === 0} onClick={() => handleMoveQuickLink(idx, -1)}>
                                                    <FiArrowUp />
                                                </button>
                                                <button type="button" className="campaign-action-btn view" style={{ padding: "4px 8px" }} disabled={idx === quickLinks.length - 1} onClick={() => handleMoveQuickLink(idx, 1)}>
                                                    <FiArrowDown />
                                                </button>
                                                <button type="button" className="delete-btn" style={{ padding: "4px 8px" }} onClick={() => handleRemoveQuickLink(idx)}>
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Showroom Info */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 16px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiMapPin /> 3. Showroom Information
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>
                                <FiMapPin /> Address Line
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>
                                <FiPhone /> Phone Number
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>
                                <FiMail /> Showroom Email
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>
                                <FiClock /> Business Hours (Optional)
                            </label>
                            <input
                                type="text"
                                value={businessHours}
                                onChange={(e) => setBusinessHours(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Social Media Links */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ color: "#d4af37", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FiShare2 /> 4. Social Media Channels
                        </h3>
                        <button type="button" className="campaign-action-btn send" style={{ fontSize: "12px", padding: "6px 14px" }} onClick={handleAddSocialLink}>
                            <FiPlus /> Add Social Link
                        </button>
                    </div>

                    <div className="recipient-snapshot-table-wrapper">
                        <table className="recipient-snapshot-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Platform Name</th>
                                    <th>Profile / Page URL</th>
                                    <th>Icon Type</th>
                                    <th>Enabled</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {socialLinks.map((soc, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <input
                                                type="text"
                                                value={soc.platform}
                                                onChange={(e) => handleUpdateSocialLink(idx, "platform", e.target.value)}
                                                style={{ width: "100%", padding: "6px 10px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "13px" }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={soc.url}
                                                onChange={(e) => handleUpdateSocialLink(idx, "url", e.target.value)}
                                                style={{ width: "100%", padding: "6px 10px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "13px" }}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                value={soc.icon || "facebook"}
                                                onChange={(e) => handleUpdateSocialLink(idx, "icon", e.target.value)}
                                                style={{ width: "100%", padding: "6px 10px", background: "#121216", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "13px" }}
                                            >
                                                <option value="facebook">Facebook</option>
                                                <option value="instagram">Instagram</option>
                                                <option value="twitter">Twitter / X</option>
                                                <option value="youtube">YouTube</option>
                                                <option value="linkedin">LinkedIn</option>
                                            </select>
                                        </td>
                                        <td>
                                            <label style={{ fontSize: "12px", color: soc.enabled ? "#22c55e" : "#ef4444", cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={soc.enabled !== false}
                                                    onChange={(e) => handleUpdateSocialLink(idx, "enabled", e.target.checked)}
                                                    style={{ marginRight: "6px" }}
                                                />
                                                {soc.enabled !== false ? "Active" : "Disabled"}
                                            </label>
                                        </td>
                                        <td>
                                            <button type="button" className="delete-btn" style={{ padding: "4px 8px" }} onClick={() => handleRemoveSocialLink(idx)}>
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Newsletter Block Content */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 16px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiSend /> 5. Newsletter Form Content
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Column Heading</label>
                            <input
                                type="text"
                                value={newsletterHeading}
                                onChange={(e) => setNewsletterHeading(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Button Text</label>
                            <input
                                type="text"
                                value={newsletterButtonText}
                                onChange={(e) => setNewsletterButtonText(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Description Text</label>
                            <input
                                type="text"
                                value={newsletterDescription}
                                onChange={(e) => setNewsletterDescription(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Input Field Placeholder</label>
                            <input
                                type="text"
                                value={newsletterPlaceholder}
                                onChange={(e) => setNewsletterPlaceholder(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>
                    </div>
                </div>

                {/* 6. Footer Car Image */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 16px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiImage /> 6. Footer Car Image
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Car Image URL / Path</label>
                            <input
                                type="text"
                                placeholder="Image Path (e.g. /src/assets/images/cars/sidecar.png)"
                                value={carImageUrl}
                                onChange={(e) => setCarImageUrl(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />

                            <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                                <label className="campaign-action-btn view" style={{ cursor: "pointer", fontSize: "12px", padding: "8px 14px" }}>
                                    <FiUploadCloud /> {uploadingField === "carImageUrl" ? "Uploading..." : "Upload Car Image"}
                                    <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, "carImageUrl")} disabled={uploadingField !== null} />
                                </label>

                                {carImageUrl && (
                                    <button type="button" className="reset-filters-btn" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => setCarImageUrl("")}>
                                        Use Default Sidecar Image
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Alt Text</label>
                            <input
                                type="text"
                                value={carImageAlt}
                                onChange={(e) => setCarImageAlt(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />

                            {carImageUrl && (
                                <div style={{ marginTop: "12px", background: "#000", padding: "10px", borderRadius: "8px" }}>
                                    <img src={getFullImageUrl(carImageUrl)} alt="Car Preview" style={{ maxHeight: "70px", display: "block", margin: "0 auto" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 7. Copyright & Legal */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 16px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiType /> 7. Copyright Notice
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "center" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Copyright Text</label>
                            <input
                                type="text"
                                value={copyrightText}
                                onChange={(e) => setCopyrightText(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "13px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
                                <input
                                    type="checkbox"
                                    checked={autoCurrentYear}
                                    onChange={(e) => setAutoCurrentYear(e.target.checked)}
                                    style={{ width: "16px", height: "16px", accentColor: "#d4af37" }}
                                />
                                Automatically prepend current year (e.g. © {new Date().getFullYear()})
                            </label>
                        </div>
                    </div>
                </div>

                {/* 8. Section Visibility Controls */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 16px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiCheckCircle /> 8. Section Visibility Toggles
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Show Logo
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Show Description
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showSocialLinks} onChange={(e) => setShowSocialLinks(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Show Social Links
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showQuickLinks} onChange={(e) => setShowQuickLinks(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Show Quick Links
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showShowroomInfo} onChange={(e) => setShowShowroomInfo(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Show Showroom Info
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showNewsletter} onChange={(e) => setShowNewsletter(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Show Newsletter
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showCarImage} onChange={(e) => setShowCarImage(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Show Footer Car
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showCopyright} onChange={(e) => setShowCopyright(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Show Copyright
                        </label>
                    </div>
                </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end", gap: "15px" }}>
                <button type="button" className="reset-filters-btn" onClick={handleReset} disabled={resetting || saving}>
                    <FiRefreshCw /> {resetting ? "Resetting..." : "Reset Defaults"}
                </button>

                <button type="button" className="create-campaign-btn" onClick={handleSave} disabled={saving || resetting}>
                    <FiSave /> {saving ? "Saving..." : "Save Footer Settings"}
                </button>
            </div>
        </div>
    );
}

export default FooterSettings;
