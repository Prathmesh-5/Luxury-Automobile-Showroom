import { useState, useEffect } from "react";
import { aboutSettingsApi, uploadApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    FiImage, FiVideo, FiType, FiEye, FiSave, 
    FiRefreshCw, FiUploadCloud, FiCheckCircle, FiStar, FiAward, FiLayers 
} from "react-icons/fi";
import "./HeroSettings.css";

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600&auto=format&fit=crop&q=80";
const DEFAULT_PINNACLE_IMAGE = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80";

function AboutSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [uploadingField, setUploadingField] = useState(null);

    // Hero Section
    const [heroTitle, setHeroTitle] = useState("About Apex");
    const [heroSubtitle, setHeroSubtitle] = useState("Crafting bespoke luxury automotive legacies since 2003");
    const [heroMediaType, setHeroMediaType] = useState("image");
    const [heroImageUrl, setHeroImageUrl] = useState(DEFAULT_HERO_IMAGE);
    const [heroImageAlt, setHeroImageAlt] = useState("About Apex Banner");
    const [heroVideoUrl, setHeroVideoUrl] = useState("");
    const [heroVideoPoster, setHeroVideoPoster] = useState("");
    const [showHeroSection, setShowHeroSection] = useState(true);

    // Pinnacle of Luxury Section
    const [pinnacleTitle, setPinnacleTitle] = useState("The Pinnacle of Luxury");
    const [pinnacleLeadText, setPinnacleLeadText] = useState("Apex Luxury Automobiles represents more than a dealership; we represent a gateway to the world’s most refined driving experiences.");
    const [pinnacleParagraph1, setPinnacleParagraph1] = useState("Founded in 2003 in Dubai, we have established a reputation as a trusted purveyor of high-performance supercars, premium SUVs, and hand-crafted grand tourers. Our commitment to absolute quality guides everything we do, from vehicle selection to post-sale customization.");
    const [pinnacleParagraph2, setPinnacleParagraph2] = useState("Each vehicle in our showroom undergoes a meticulous multi-point inspection by certified mechanics, ensuring that only pristine models reach our distinguished clientele.");
    const [pinnacleMediaType, setPinnacleMediaType] = useState("image");
    const [pinnacleImageUrl, setPinnacleImageUrl] = useState(DEFAULT_PINNACLE_IMAGE);
    const [pinnacleImageAlt, setPinnacleImageAlt] = useState("Showroom Display");
    const [pinnacleVideoUrl, setPinnacleVideoUrl] = useState("");
    const [pinnacleVideoPoster, setPinnacleVideoPoster] = useState("");
    const [showPinnacleSection, setShowPinnacleSection] = useState(true);

    // Core Values Section
    const [valuesTitle, setValuesTitle] = useState("Our Core Values");
    const [showValuesSection, setShowValuesSection] = useState(true);

    const [card1Number, setCard1Number] = useState("01");
    const [card1Title, setCard1Title] = useState("Excellence");
    const [card1Description, setCard1Description] = useState("We demand excellence in our inventory, our services, and our guest hospitality, delivering a world-class environment.");
    const [card1Enabled, setCard1Enabled] = useState(true);

    const [card2Number, setCard2Number] = useState("02");
    const [card2Title, setCard2Title] = useState("Integrity");
    const [card2Description, setCard2Description] = useState("Transparent dealings, absolute authenticity, and honest certifications form the foundations of customer trust.");
    const [card2Enabled, setCard2Enabled] = useState(true);

    const [card3Number, setCard3Number] = useState("03");
    const [card3Title, setCard3Title] = useState("Bespoke Care");
    const [card3Description, setCard3Description] = useState("Every customer is unique. We provide customized buying plans, international logistics, and tailored customizations.");
    const [card3Enabled, setCard3Enabled] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await aboutSettingsApi.getPublic();
            if (data) {
                setHeroTitle(data.heroTitle || "About Apex");
                setHeroSubtitle(data.heroSubtitle || "Crafting bespoke luxury automotive legacies since 2003");
                setHeroMediaType(data.heroMediaType || "image");
                setHeroImageUrl(data.heroImageUrl || DEFAULT_HERO_IMAGE);
                setHeroImageAlt(data.heroImageAlt || "About Apex Banner");
                setHeroVideoUrl(data.heroVideoUrl || "");
                setHeroVideoPoster(data.heroVideoPoster || "");
                setShowHeroSection(data.showHeroSection !== undefined ? data.showHeroSection : true);

                setPinnacleTitle(data.pinnacleTitle || "The Pinnacle of Luxury");
                setPinnacleLeadText(data.pinnacleLeadText || "Apex Luxury Automobiles represents more than a dealership; we represent a gateway to the world’s most refined driving experiences.");
                setPinnacleParagraph1(data.pinnacleParagraph1 || "Founded in 2003 in Dubai, we have established a reputation as a trusted purveyor of high-performance supercars, premium SUVs, and hand-crafted grand tourers. Our commitment to absolute quality guides everything we do, from vehicle selection to post-sale customization.");
                setPinnacleParagraph2(data.pinnacleParagraph2 || "Each vehicle in our showroom undergoes a meticulous multi-point inspection by certified mechanics, ensuring that only pristine models reach our distinguished clientele.");
                setPinnacleMediaType(data.pinnacleMediaType || "image");
                setPinnacleImageUrl(data.pinnacleImageUrl || DEFAULT_PINNACLE_IMAGE);
                setPinnacleImageAlt(data.pinnacleImageAlt || "Showroom Display");
                setPinnacleVideoUrl(data.pinnacleVideoUrl || "");
                setPinnacleVideoPoster(data.pinnacleVideoPoster || "");
                setShowPinnacleSection(data.showPinnacleSection !== undefined ? data.showPinnacleSection : true);

                setValuesTitle(data.valuesTitle || "Our Core Values");
                setShowValuesSection(data.showValuesSection !== undefined ? data.showValuesSection : true);

                setCard1Number(data.card1Number || "01");
                setCard1Title(data.card1Title || "Excellence");
                setCard1Description(data.card1Description || "We demand excellence in our inventory, our services, and our guest hospitality, delivering a world-class environment.");
                setCard1Enabled(data.card1Enabled !== undefined ? data.card1Enabled : true);

                setCard2Number(data.card2Number || "02");
                setCard2Title(data.card2Title || "Integrity");
                setCard2Description(data.card2Description || "Transparent dealings, absolute authenticity, and honest certifications form the foundations of customer trust.");
                setCard2Enabled(data.card2Enabled !== undefined ? data.card2Enabled : true);

                setCard3Number(data.card3Number || "03");
                setCard3Title(data.card3Title || "Bespoke Care");
                setCard3Description(data.card3Description || "Every customer is unique. We provide customized buying plans, international logistics, and tailored customizations.");
                setCard3Enabled(data.card3Enabled !== undefined ? data.card3Enabled : true);
            }
        } catch (err) {
            console.error("Error loading about settings:", err);
            toast.error("Failed to load about settings.");
        } finally {
            setLoading(false);
        }
    };

    const getFullMediaUrl = (path) => {
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
            toast.loading(`Uploading media file...`, { id: "upload-toast" });

            const uploadedPaths = await uploadApi.uploadImages([file]);
            if (uploadedPaths && uploadedPaths.length > 0) {
                const path = uploadedPaths[0];
                if (fieldName === "heroImageUrl") setHeroImageUrl(path);
                if (fieldName === "heroVideoUrl") setHeroVideoUrl(path);
                if (fieldName === "heroVideoPoster") setHeroVideoPoster(path);
                if (fieldName === "pinnacleImageUrl") setPinnacleImageUrl(path);
                if (fieldName === "pinnacleVideoUrl") setPinnacleVideoUrl(path);
                if (fieldName === "pinnacleVideoPoster") setPinnacleVideoPoster(path);
                toast.success("File uploaded successfully!", { id: "upload-toast" });
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload file.", { id: "upload-toast" });
        } finally {
            setUploadingField(null);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                heroTitle,
                heroSubtitle,
                heroMediaType,
                heroImageUrl,
                heroImageAlt,
                heroVideoUrl,
                heroVideoPoster,
                showHeroSection,

                pinnacleTitle,
                pinnacleLeadText,
                pinnacleParagraph1,
                pinnacleParagraph2,
                pinnacleMediaType,
                pinnacleImageUrl,
                pinnacleImageAlt,
                pinnacleVideoUrl,
                pinnacleVideoPoster,
                showPinnacleSection,

                valuesTitle,
                showValuesSection,

                card1Number,
                card1Title,
                card1Description,
                card1Enabled,

                card2Number,
                card2Title,
                card2Description,
                card2Enabled,

                card3Number,
                card3Title,
                card3Description,
                card3Enabled
            };

            await aboutSettingsApi.update(payload);
            toast.success("About Page Settings saved successfully!");
        } catch (err) {
            console.error("Save about settings error:", err);
            toast.error(err.response?.data?.message || "Failed to save about settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Are you sure you want to reset all About page settings to exact production defaults?")) {
            return;
        }

        try {
            setResetting(true);
            await aboutSettingsApi.reset();
            toast.success("About settings reset to default values.");
            loadSettings();
        } catch (err) {
            console.error("Reset about settings error:", err);
            toast.error("Failed to reset about settings.");
        } finally {
            setResetting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-crud-panel">
                <div className="empty-crud-state" style={{ padding: "80px 20px" }}>
                    <p>Loading About Page Settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-crud-panel hero-settings-panel">
            {/* Header Bar */}
            <div className="campaign-header-row" style={{ marginBottom: "25px" }}>
                <div>
                    <h1>Public About Page CMS Settings</h1>
                    <p>Manage content, text, media, and visibility for the About page while maintaining 100% of the existing design layout.</p>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a href="/about" target="_blank" rel="noreferrer" className="campaign-action-btn view" style={{ textDecoration: "none", padding: "10px 18px", borderRadius: "10px" }}>
                        <FiEye /> Preview Public About Page
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
                {/* 1. Hero Section */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ color: "#d4af37", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FiStar /> 1. Hero Banner Section
                        </h3>
                        <label style={{ fontSize: "12px", color: showHeroSection ? "#22c55e" : "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <input type="checkbox" checked={showHeroSection} onChange={(e) => setShowHeroSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            {showHeroSection ? "Section Enabled" : "Section Hidden"}
                        </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Hero Main Title</label>
                            <input
                                type="text"
                                value={heroTitle}
                                onChange={(e) => setHeroTitle(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Hero Subtitle / Tagline</label>
                            <input
                                type="text"
                                value={heroSubtitle}
                                onChange={(e) => setHeroSubtitle(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>
                    </div>

                    {/* Media Type Selector */}
                    <div style={{ marginTop: "20px", background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <label style={{ fontSize: "12px", color: "#d4af37", display: "block", marginBottom: "10px", fontWeight: "700", textTransform: "uppercase" }}>
                            Hero Background Media Type
                        </label>

                        <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
                            <label style={{ color: "#fff", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                                <input type="radio" name="heroMediaType" value="image" checked={heroMediaType === "image"} onChange={() => setHeroMediaType("image")} style={{ accentColor: "#d4af37" }} />
                                <FiImage /> Image
                            </label>
                            <label style={{ color: "#fff", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                                <input type="radio" name="heroMediaType" value="video" checked={heroMediaType === "video"} onChange={() => setHeroMediaType("video")} style={{ accentColor: "#d4af37" }} />
                                <FiVideo /> Video
                            </label>
                        </div>

                        {heroMediaType === "image" ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div>
                                    <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Image URL / Upload Path</label>
                                    <input
                                        type="text"
                                        value={heroImageUrl}
                                        onChange={(e) => setHeroImageUrl(e.target.value)}
                                        style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                    />
                                    <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                                        <label className="campaign-action-btn view" style={{ cursor: "pointer", fontSize: "12px", padding: "8px 14px" }}>
                                            <FiUploadCloud /> {uploadingField === "heroImageUrl" ? "Uploading..." : "Upload Hero Image"}
                                            <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, "heroImageUrl")} disabled={uploadingField !== null} />
                                        </label>
                                        <button type="button" className="reset-filters-btn" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => setHeroImageUrl(DEFAULT_HERO_IMAGE)}>
                                            Reset Image
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Image Alt Text</label>
                                    <input
                                        type="text"
                                        value={heroImageAlt}
                                        onChange={(e) => setHeroImageAlt(e.target.value)}
                                        style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div>
                                    <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Video URL / Upload Path (.mp4, .webm)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. /uploads/hero-video.mp4"
                                        value={heroVideoUrl}
                                        onChange={(e) => setHeroVideoUrl(e.target.value)}
                                        style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                    />
                                    <div style={{ marginTop: "10px" }}>
                                        <label className="campaign-action-btn view" style={{ cursor: "pointer", fontSize: "12px", padding: "8px 14px" }}>
                                            <FiUploadCloud /> {uploadingField === "heroVideoUrl" ? "Uploading..." : "Upload Hero Video"}
                                            <input type="file" accept="video/*" hidden onChange={(e) => handleFileUpload(e, "heroVideoUrl")} disabled={uploadingField !== null} />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Optional Poster / Fallback Image URL</label>
                                    <input
                                        type="text"
                                        placeholder="Optional video poster image path"
                                        value={heroVideoPoster}
                                        onChange={(e) => setHeroVideoPoster(e.target.value)}
                                        style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Pinnacle of Luxury Section */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ color: "#d4af37", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FiAward /> 2. "The Pinnacle of Luxury" Section
                        </h3>
                        <label style={{ fontSize: "12px", color: showPinnacleSection ? "#22c55e" : "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <input type="checkbox" checked={showPinnacleSection} onChange={(e) => setShowPinnacleSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            {showPinnacleSection ? "Section Enabled" : "Section Hidden"}
                        </label>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Section Title</label>
                            <input
                                type="text"
                                value={pinnacleTitle}
                                onChange={(e) => setPinnacleTitle(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#d4af37", display: "block", marginBottom: "6px" }}>Highlighted Lead Paragraph (Gold styling)</label>
                            <textarea
                                rows={2}
                                value={pinnacleLeadText}
                                onChange={(e) => setPinnacleLeadText(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", resize: "vertical" }}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>First Description Paragraph</label>
                                <textarea
                                    rows={4}
                                    value={pinnacleParagraph1}
                                    onChange={(e) => setPinnacleParagraph1(e.target.value)}
                                    style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", resize: "vertical" }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Second Description Paragraph</label>
                                <textarea
                                    rows={4}
                                    value={pinnacleParagraph2}
                                    onChange={(e) => setPinnacleParagraph2(e.target.value)}
                                    style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", resize: "vertical" }}
                                />
                            </div>
                        </div>

                        {/* Media Selector for Pinnacle Section */}
                        <div style={{ marginTop: "10px", background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <label style={{ fontSize: "12px", color: "#d4af37", display: "block", marginBottom: "10px", fontWeight: "700", textTransform: "uppercase" }}>
                                Pinnacle Section Media Type
                            </label>

                            <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
                                <label style={{ color: "#fff", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <input type="radio" name="pinnacleMediaType" value="image" checked={pinnacleMediaType === "image"} onChange={() => setPinnacleMediaType("image")} style={{ accentColor: "#d4af37" }} />
                                    <FiImage /> Image
                                </label>
                                <label style={{ color: "#fff", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <input type="radio" name="pinnacleMediaType" value="video" checked={pinnacleMediaType === "video"} onChange={() => setPinnacleMediaType("video")} style={{ accentColor: "#d4af37" }} />
                                    <FiVideo /> Video
                                </label>
                            </div>

                            {pinnacleMediaType === "image" ? (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    <div>
                                        <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Image URL / Upload Path</label>
                                        <input
                                            type="text"
                                            value={pinnacleImageUrl}
                                            onChange={(e) => setPinnacleImageUrl(e.target.value)}
                                            style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                        />
                                        <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                                            <label className="campaign-action-btn view" style={{ cursor: "pointer", fontSize: "12px", padding: "8px 14px" }}>
                                                <FiUploadCloud /> {uploadingField === "pinnacleImageUrl" ? "Uploading..." : "Upload Section Image"}
                                                <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, "pinnacleImageUrl")} disabled={uploadingField !== null} />
                                            </label>
                                            <button type="button" className="reset-filters-btn" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={() => setPinnacleImageUrl(DEFAULT_PINNACLE_IMAGE)}>
                                                Reset Image
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Image Alt Text</label>
                                        <input
                                            type="text"
                                            value={pinnacleImageAlt}
                                            onChange={(e) => setPinnacleImageAlt(e.target.value)}
                                            style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    <div>
                                        <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Video URL / Upload Path (.mp4, .webm)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. /uploads/pinnacle-video.mp4"
                                            value={pinnacleVideoUrl}
                                            onChange={(e) => setPinnacleVideoUrl(e.target.value)}
                                            style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                        />
                                        <div style={{ marginTop: "10px" }}>
                                            <label className="campaign-action-btn view" style={{ cursor: "pointer", fontSize: "12px", padding: "8px 14px" }}>
                                                <FiUploadCloud /> {uploadingField === "pinnacleVideoUrl" ? "Uploading..." : "Upload Section Video"}
                                                <input type="file" accept="video/*" hidden onChange={(e) => handleFileUpload(e, "pinnacleVideoUrl")} disabled={uploadingField !== null} />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Optional Video Poster Image URL</label>
                                        <input
                                            type="text"
                                            placeholder="Poster image URL"
                                            value={pinnacleVideoPoster}
                                            onChange={(e) => setPinnacleVideoPoster(e.target.value)}
                                            style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Core Values Section */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ color: "#d4af37", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FiLayers /> 3. Core Values Section
                        </h3>
                        <label style={{ fontSize: "12px", color: showValuesSection ? "#22c55e" : "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <input type="checkbox" checked={showValuesSection} onChange={(e) => setShowValuesSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            {showValuesSection ? "Section Enabled" : "Section Hidden"}
                        </label>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Core Values Section Title</label>
                        <input
                            type="text"
                            value={valuesTitle}
                            onChange={(e) => setValuesTitle(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                        />
                    </div>

                    {/* 3 Value Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                        {/* Card 1 */}
                        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <strong style={{ color: "#d4af37", fontSize: "13px" }}>Value Card 1</strong>
                                <label style={{ fontSize: "11px", color: card1Enabled ? "#22c55e" : "#ef4444", cursor: "pointer" }}>
                                    <input type="checkbox" checked={card1Enabled} onChange={(e) => setCard1Enabled(e.target.checked)} style={{ marginRight: "4px" }} />
                                    Active
                                </label>
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                <input
                                    type="text"
                                    placeholder="01"
                                    value={card1Number}
                                    onChange={(e) => setCard1Number(e.target.value)}
                                    style={{ width: "50px", padding: "6px 8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#d4af37", fontWeight: "700" }}
                                />
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={card1Title}
                                    onChange={(e) => setCard1Title(e.target.value)}
                                    style={{ flex: 1, padding: "6px 8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontWeight: "700" }}
                                />
                            </div>

                            <textarea
                                rows={4}
                                placeholder="Description"
                                value={card1Description}
                                onChange={(e) => setCard1Description(e.target.value)}
                                style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px", resize: "vertical" }}
                            />
                        </div>

                        {/* Card 2 */}
                        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <strong style={{ color: "#d4af37", fontSize: "13px" }}>Value Card 2</strong>
                                <label style={{ fontSize: "11px", color: card2Enabled ? "#22c55e" : "#ef4444", cursor: "pointer" }}>
                                    <input type="checkbox" checked={card2Enabled} onChange={(e) => setCard2Enabled(e.target.checked)} style={{ marginRight: "4px" }} />
                                    Active
                                </label>
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                <input
                                    type="text"
                                    placeholder="02"
                                    value={card2Number}
                                    onChange={(e) => setCard2Number(e.target.value)}
                                    style={{ width: "50px", padding: "6px 8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#d4af37", fontWeight: "700" }}
                                />
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={card2Title}
                                    onChange={(e) => setCard2Title(e.target.value)}
                                    style={{ flex: 1, padding: "6px 8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontWeight: "700" }}
                                />
                            </div>

                            <textarea
                                rows={4}
                                placeholder="Description"
                                value={card2Description}
                                onChange={(e) => setCard2Description(e.target.value)}
                                style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px", resize: "vertical" }}
                            />
                        </div>

                        {/* Card 3 */}
                        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <strong style={{ color: "#d4af37", fontSize: "13px" }}>Value Card 3</strong>
                                <label style={{ fontSize: "11px", color: card3Enabled ? "#22c55e" : "#ef4444", cursor: "pointer" }}>
                                    <input type="checkbox" checked={card3Enabled} onChange={(e) => setCard3Enabled(e.target.checked)} style={{ marginRight: "4px" }} />
                                    Active
                                </label>
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                <input
                                    type="text"
                                    placeholder="03"
                                    value={card3Number}
                                    onChange={(e) => setCard3Number(e.target.value)}
                                    style={{ width: "50px", padding: "6px 8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#d4af37", fontWeight: "700" }}
                                />
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={card3Title}
                                    onChange={(e) => setCard3Title(e.target.value)}
                                    style={{ flex: 1, padding: "6px 8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontWeight: "700" }}
                                />
                            </div>

                            <textarea
                                rows={4}
                                placeholder="Description"
                                value={card3Description}
                                onChange={(e) => setCard3Description(e.target.value)}
                                style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px", resize: "vertical" }}
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Section Visibility Summary */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 16px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiCheckCircle /> 4. Global Section Visibility Summary
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showHeroSection} onChange={(e) => setShowHeroSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Hero Section
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showPinnacleSection} onChange={(e) => setShowPinnacleSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Pinnacle Section
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                            <input type="checkbox" checked={showValuesSection} onChange={(e) => setShowValuesSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Core Values Section
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
                    <FiSave /> {saving ? "Saving..." : "Save About Settings"}
                </button>
            </div>
        </div>
    );
}

export default AboutSettings;
