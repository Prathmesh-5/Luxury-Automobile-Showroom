import { useState, useEffect } from "react";
import { heroSettingsApi, uploadApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    FiType, FiImage, FiVideo, FiLink2, FiShield, 
    FiEye, FiCalendar, FiSave, FiUploadCloud, FiInfo, FiBarChart2 
} from "react-icons/fi";
import "./HeroSettings.css";

function HeroSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingField, setUploadingField] = useState(null);

    // Form state
    const [smallBadgeText, setSmallBadgeText] = useState("");
    const [mainTitle, setMainTitle] = useState("");
    const [highlightTitle, setHighlightTitle] = useState("");
    const [descriptionText, setDescriptionText] = useState("");
    const [topRightBadgeText, setTopRightBadgeText] = useState("");
    
    const [mediaType, setMediaType] = useState("image");
    const [desktopHeroImage, setDesktopHeroImage] = useState("");
    const [mobileHeroImage, setMobileHeroImage] = useState("");
    const [heroVideo, setHeroVideo] = useState("");
    
    const [exploreBtnText, setExploreBtnText] = useState("");
    const [exploreBtnLink, setExploreBtnLink] = useState("");
    const [bookBtnText, setBookBtnText] = useState("");
    const [bookBtnLink, setBookBtnLink] = useState("");
    
    const [logoUrl, setLogoUrl] = useState("");
    const [overlayDarkness, setOverlayDarkness] = useState(0.6);
    const [establishedYear, setEstablishedYear] = useState(2003);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await heroSettingsApi.getPublic();
            if (data) {
                setSmallBadgeText(data.smallBadgeText || "PREMIUM LUXURY AUTOMOBILES");
                setMainTitle(data.mainTitle || "Drive Beyond");
                setHighlightTitle(data.highlightTitle || "Luxury");
                setDescriptionText(data.descriptionText || "Discover an exclusive collection of luxury, sports and exotic cars crafted for those who demand excellence.");
                setTopRightBadgeText(data.topRightBadgeText || "★ Trusted Since 2003");
                
                setMediaType(data.mediaType || "image");
                setDesktopHeroImage(data.desktopHeroImage || "");
                setMobileHeroImage(data.mobileHeroImage || "");
                setHeroVideo(data.heroVideo || "");
                
                setExploreBtnText(data.exploreBtnText || "Explore Collection");
                setExploreBtnLink(data.exploreBtnLink || "/cars");
                setBookBtnText(data.bookBtnText || "Book Test Drive");
                setBookBtnLink(data.bookBtnLink || "/test-drive");
                
                setLogoUrl(data.logoUrl || "");
                setOverlayDarkness(data.overlayDarkness !== undefined ? data.overlayDarkness : 0.6);
                setEstablishedYear(data.establishedYear || 2003);
            }
        } catch (err) {
            console.error("Error loading hero settings:", err);
            toast.error("Failed to load hero settings");
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
            toast.loading(`Uploading file...`, { id: "upload-toast" });

            const formData = new FormData();
            formData.append("images", file);

            const uploadedPaths = await uploadApi.uploadImagesSingle(formData);
            if (uploadedPaths && uploadedPaths.length > 0) {
                const path = uploadedPaths[0];
                if (fieldName === "desktopHeroImage") setDesktopHeroImage(path);
                if (fieldName === "mobileHeroImage") setMobileHeroImage(path);
                if (fieldName === "heroVideo") setHeroVideo(path);
                if (fieldName === "logoUrl") setLogoUrl(path);
                toast.success("File uploaded successfully!", { id: "upload-toast" });
            }
        } catch (err) {
            console.error(`Upload error for ${fieldName}:`, err);
            toast.error("File upload failed", { id: "upload-toast" });
        } finally {
            setUploadingField(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                smallBadgeText,
                mainTitle,
                highlightTitle,
                descriptionText,
                topRightBadgeText,
                mediaType,
                desktopHeroImage,
                mobileHeroImage,
                heroVideo,
                exploreBtnText,
                exploreBtnLink,
                bookBtnText,
                bookBtnLink,
                logoUrl,
                overlayDarkness: Number(overlayDarkness),
                establishedYear: Number(establishedYear)
            };

            await heroSettingsApi.update(payload);
            toast.success("Homepage Hero settings saved successfully!");
        } catch (err) {
            console.error("Save error:", err);
            toast.error(err.response?.data?.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const calculatedExperience = Math.max(0, currentYear - Number(establishedYear || 2003));

    if (loading) {
        return (
            <div className="admin-loading-state" style={{ padding: "60px", textAlign: "center", color: "#a1a1aa" }}>
                <p>Loading Hero Settings...</p>
            </div>
        );
    }

    return (
        <div className="hero-settings-container">
            <div className="hero-settings-header">
                <h1>Homepage Hero Settings</h1>
                <p>Customize content, media, appearance, links, and branding for the public Homepage hero section.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="hero-settings-grid">

                    {/* 1. Hero Content */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <FiType className="settings-card-icon" />
                            <h2>Hero Content</h2>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group-custom">
                                <label>Small Badge Text</label>
                                <input
                                    type="text"
                                    value={smallBadgeText}
                                    onChange={(e) => setSmallBadgeText(e.target.value)}
                                    placeholder="e.g. PREMIUM LUXURY AUTOMOBILES"
                                />
                            </div>

                            <div className="form-group-custom">
                                <label>Top-Right Badge Text</label>
                                <input
                                    type="text"
                                    value={topRightBadgeText}
                                    onChange={(e) => setTopRightBadgeText(e.target.value)}
                                    placeholder="e.g. ★ Trusted Since 2003"
                                />
                            </div>

                            <div className="form-group-custom">
                                <label>Main Title</label>
                                <input
                                    type="text"
                                    value={mainTitle}
                                    onChange={(e) => setMainTitle(e.target.value)}
                                    placeholder="e.g. Drive Beyond"
                                />
                            </div>

                            <div className="form-group-custom">
                                <label>Highlight Title (Gold Accent)</label>
                                <input
                                    type="text"
                                    value={highlightTitle}
                                    onChange={(e) => setHighlightTitle(e.target.value)}
                                    placeholder="e.g. Luxury"
                                />
                            </div>

                            <div className="form-group-custom form-group-full">
                                <label>Description Text</label>
                                <textarea
                                    value={descriptionText}
                                    onChange={(e) => setDescriptionText(e.target.value)}
                                    placeholder="Enter description paragraph..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Hero Media */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            {mediaType === "video" ? <FiVideo className="settings-card-icon" /> : <FiImage className="settings-card-icon" />}
                            <h2>Hero Media</h2>
                        </div>

                        <div className="media-type-selector">
                            <button
                                type="button"
                                className={`media-type-btn ${mediaType === "image" ? "active" : ""}`}
                                onClick={() => setMediaType("image")}
                            >
                                <FiImage /> Image Mode
                            </button>
                            <button
                                type="button"
                                className={`media-type-btn ${mediaType === "video" ? "active" : ""}`}
                                onClick={() => setMediaType("video")}
                            >
                                <FiVideo /> Video Mode
                            </button>
                        </div>

                        {mediaType === "image" ? (
                            <div className="form-grid-2">
                                <div className="form-group-custom">
                                    <label>Desktop Hero Image</label>
                                    <label className="upload-drop-zone">
                                        <FiUploadCloud className="upload-icon" />
                                        <p>{uploadingField === "desktopHeroImage" ? "Uploading..." : "Click to upload Desktop Image"}</p>
                                        <span>JPG, PNG, WEBP max 100MB</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={(e) => handleFileUpload(e, "desktopHeroImage")}
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        value={desktopHeroImage}
                                        onChange={(e) => setDesktopHeroImage(e.target.value)}
                                        placeholder="Or enter Image URL / upload path..."
                                        style={{ marginTop: "8px" }}
                                    />
                                    {desktopHeroImage && (
                                        <div className="media-preview-box">
                                            <img src={getFullMediaUrl(desktopHeroImage)} alt="Desktop Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="form-group-custom">
                                    <label>Mobile Hero Image (Optional)</label>
                                    <label className="upload-drop-zone">
                                        <FiUploadCloud className="upload-icon" />
                                        <p>{uploadingField === "mobileHeroImage" ? "Uploading..." : "Click to upload Mobile Image"}</p>
                                        <span>JPG, PNG, WEBP max 100MB</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={(e) => handleFileUpload(e, "mobileHeroImage")}
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        value={mobileHeroImage}
                                        onChange={(e) => setMobileHeroImage(e.target.value)}
                                        placeholder="Or enter Mobile Image URL / upload path..."
                                        style={{ marginTop: "8px" }}
                                    />
                                    {mobileHeroImage && (
                                        <div className="media-preview-box">
                                            <img src={getFullMediaUrl(mobileHeroImage)} alt="Mobile Preview" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="form-group-custom">
                                <label>Hero Video</label>
                                <label className="upload-drop-zone">
                                    <FiUploadCloud className="upload-icon" />
                                    <p>{uploadingField === "heroVideo" ? "Uploading..." : "Click to upload Hero Video"}</p>
                                    <span>MP4 (H.264 recommended for best performance), WEBM max 100MB</span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => handleFileUpload(e, "heroVideo")}
                                    />
                                </label>
                                <input
                                    type="text"
                                    value={heroVideo}
                                    onChange={(e) => setHeroVideo(e.target.value)}
                                    placeholder="Or enter Video URL / upload path..."
                                    style={{ marginTop: "8px" }}
                                />
                                {heroVideo && (
                                    <div className="media-preview-box">
                                        <video src={getFullMediaUrl(heroVideo)} controls muted />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3. Buttons */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <FiLink2 className="settings-card-icon" />
                            <h2>Hero Buttons</h2>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group-custom">
                                <label>Explore Collection Button Text</label>
                                <input
                                    type="text"
                                    value={exploreBtnText}
                                    onChange={(e) => setExploreBtnText(e.target.value)}
                                    placeholder="e.g. Explore Collection"
                                />
                            </div>

                            <div className="form-group-custom">
                                <label>Explore Collection Link Target</label>
                                <input
                                    type="text"
                                    value={exploreBtnLink}
                                    onChange={(e) => setExploreBtnLink(e.target.value)}
                                    placeholder="e.g. /cars"
                                />
                            </div>

                            <div className="form-group-custom">
                                <label>Book Test Drive Button Text</label>
                                <input
                                    type="text"
                                    value={bookBtnText}
                                    onChange={(e) => setBookBtnText(e.target.value)}
                                    placeholder="e.g. Book Test Drive"
                                />
                            </div>

                            <div className="form-group-custom">
                                <label>Book Test Drive Link Target</label>
                                <input
                                    type="text"
                                    value={bookBtnLink}
                                    onChange={(e) => setBookBtnLink(e.target.value)}
                                    placeholder="e.g. /test-drive"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. Branding */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <FiShield className="settings-card-icon" />
                            <h2>Branding — Website Logo</h2>
                        </div>

                        <div className="form-group-custom">
                            <label>Website Logo</label>
                            <label className="upload-drop-zone">
                                <FiUploadCloud className="upload-icon" />
                                <p>{uploadingField === "logoUrl" ? "Uploading..." : "Click to upload Website Logo"}</p>
                                <span>PNG, SVG, WEBP max 10MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => handleFileUpload(e, "logoUrl")}
                                />
                            </label>
                            <input
                                type="text"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="Or enter Logo URL / upload path..."
                                style={{ marginTop: "8px" }}
                            />
                            {logoUrl && (
                                <div className="media-preview-box" style={{ background: "#111" }}>
                                    <img src={getFullMediaUrl(logoUrl)} alt="Logo Preview" className="logo-img-preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. Appearance */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <FiEye className="settings-card-icon" />
                            <h2>Hero Appearance</h2>
                        </div>

                        <div className="form-group-custom">
                            <label>Background Overlay Darkness</label>
                            <div className="slider-container">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={overlayDarkness}
                                    onChange={(e) => setOverlayDarkness(parseFloat(e.target.value))}
                                />
                                <div className="slider-value-badge">
                                    {Math.round(overlayDarkness * 100)}%
                                </div>
                            </div>
                            <span style={{ fontSize: "12px", color: "#71717a", marginTop: "6px" }}>
                                Controls dark overlay shading over background image/video for optimal text readability.
                            </span>
                        </div>
                    </div>

                    {/* 6. Experience & Automatic Statistics */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <FiCalendar className="settings-card-icon" />
                            <h2>Experience & Database Statistics</h2>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group-custom">
                                <label>Established Year</label>
                                <input
                                    type="number"
                                    min="1900"
                                    max={currentYear}
                                    value={establishedYear}
                                    onChange={(e) => setEstablishedYear(e.target.value)}
                                    placeholder="e.g. 2003"
                                />
                                <span style={{ fontSize: "12px", color: "#d4af37", marginTop: "4px" }}>
                                    Calculated Experience Output: <strong>{calculatedExperience}+ Years Experience</strong>
                                </span>
                            </div>

                            <div className="form-group-custom">
                                <label>Automatic Statistics (Database-Driven)</label>
                                <div className="auto-stats-card">
                                    <FiBarChart2 className="info-icon" />
                                    <p>
                                        <strong>Luxury Cars Count</strong> and <strong>Brands Count</strong> are dynamically calculated from your MongoDB database and rendered automatically on the hero stats counter.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sticky Action Footer */}
                <div className="save-actions-bar">
                    <span className="save-status-text">
                        Make sure to save after changing Hero Settings.
                    </span>
                    <button type="submit" className="save-hero-btn" disabled={saving}>
                        <FiSave /> {saving ? "Saving Changes..." : "Save Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default HeroSettings;
