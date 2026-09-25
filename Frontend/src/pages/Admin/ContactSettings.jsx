import { useState, useEffect } from "react";
import { contactSettingsApi, uploadApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    FiImage, FiVideo, FiEye, FiSave, 
    FiRefreshCw, FiUploadCloud, FiCheckCircle, FiStar, FiMapPin,
    FiPhone, FiMail, FiClock, FiMessageSquare, FiCompass
} from "react-icons/fi";
import "./HeroSettings.css";

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80";

function ContactSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [uploadingField, setUploadingField] = useState(null);

    // 1. Hero Section
    const [heroHeading, setHeroHeading] = useState("CONTACT US");
    const [heroSubtitle, setHeroSubtitle] = useState("Connect with our expert advisors for bespoke automobile services");
    const [heroMediaType, setHeroMediaType] = useState("image");
    const [heroImageUrl, setHeroImageUrl] = useState(DEFAULT_HERO_IMAGE);
    const [heroImageAlt, setHeroImageAlt] = useState("Contact Banner");
    const [heroVideoUrl, setHeroVideoUrl] = useState("");
    const [heroVideoPoster, setHeroVideoPoster] = useState("");
    const [showHeroSection, setShowHeroSection] = useState(true);

    // 2. Get In Touch Section
    const [getInTouchHeading, setGetInTouchHeading] = useState("Get In Touch");
    const [getInTouchDescription, setGetInTouchDescription] = useState("Have a question about our inventory, shipping, or trade-in evaluations? Feel free to contact our showroom advisors.");
    const [showGetInTouchSection, setShowGetInTouchSection] = useState(true);

    // 3. Visit Showroom Card
    const [visitShowroomTitle, setVisitShowroomTitle] = useState("Visit Showroom");
    const [visitShowroomAddress, setVisitShowroomAddress] = useState("Sheikh Zayed Road, Al Quoz 3, Dubai, United Arab Emirates");
    const [showVisitShowroomCard, setShowVisitShowroomCard] = useState(true);

    // 4. Call Showroom Card
    const [callShowroomTitle, setCallShowroomTitle] = useState("Call Showroom");
    const [callShowroomPhone, setCallShowroomPhone] = useState("+971 4 000 0000");
    const [showCallShowroomCard, setShowCallShowroomCard] = useState(true);

    // 5. Email Support Card
    const [emailSupportTitle, setEmailSupportTitle] = useState("Email Support");
    const [emailSupportEmail, setEmailSupportEmail] = useState("info@apexluxury.ae");
    const [showEmailSupportCard, setShowEmailSupportCard] = useState(true);

    // 6. Showroom Timings Card
    const [showroomTimingsTitle, setShowroomTimingsTitle] = useState("Showroom Timings");
    const [showroomTimingsLine1, setShowroomTimingsLine1] = useState("Monday - Saturday: 9:00 AM - 9:00 PM");
    const [showroomTimingsLine2, setShowroomTimingsLine2] = useState("Sunday: 2:00 PM - 8:00 PM");
    const [showShowroomTimingsCard, setShowShowroomTimingsCard] = useState(true);

    // 7. Contact Form Settings
    const [formHeading, setFormHeading] = useState("Send a Message");
    const [formNamePlaceholder, setFormNamePlaceholder] = useState("Your Name");
    const [formEmailPlaceholder, setFormEmailPlaceholder] = useState("Email Address");
    const [formPhonePlaceholder, setFormPhonePlaceholder] = useState("Phone Number");
    const [formMessagePlaceholder, setFormMessagePlaceholder] = useState("How can we assist you?");
    const [formSubmitButtonText, setFormSubmitButtonText] = useState("Send Message");
    const [showContactForm, setShowContactForm] = useState(true);

    // 8 & 9. Map / Location Settings
    const [mapPlaceName, setMapPlaceName] = useState("Sheikh Zayed Road, Al Quoz 3, Dubai, UAE");
    const [mapAddress, setMapAddress] = useState("Sheikh Zayed Road, Al Quoz 3, Dubai, United Arab Emirates");
    const [mapEmbedUrl, setMapEmbedUrl] = useState("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115546.61111666874!2d55.20786968037107!3d25.17478648348873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43348a6d49bb%3A0x3b0779d71c4c1a40!2sSheikh%20Zayed%20Rd%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin");
    const [mapLatitude, setMapLatitude] = useState("25.17478648348873");
    const [mapLongitude, setMapLongitude] = useState("55.20786968037107");
    const [mapZoom, setMapZoom] = useState("13");
    const [showMapSection, setShowMapSection] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await contactSettingsApi.getPublic();
            if (data) {
                setHeroHeading(data.heroHeading || "CONTACT US");
                setHeroSubtitle(data.heroSubtitle || "Connect with our expert advisors for bespoke automobile services");
                setHeroMediaType(data.heroMediaType || "image");
                setHeroImageUrl(data.heroImageUrl || DEFAULT_HERO_IMAGE);
                setHeroImageAlt(data.heroImageAlt || "Contact Banner");
                setHeroVideoUrl(data.heroVideoUrl || "");
                setHeroVideoPoster(data.heroVideoPoster || "");
                setShowHeroSection(data.showHeroSection !== undefined ? data.showHeroSection : true);

                setGetInTouchHeading(data.getInTouchHeading || "Get In Touch");
                setGetInTouchDescription(data.getInTouchDescription || "Have a question about our inventory, shipping, or trade-in evaluations? Feel free to contact our showroom advisors.");
                setShowGetInTouchSection(data.showGetInTouchSection !== undefined ? data.showGetInTouchSection : true);

                setVisitShowroomTitle(data.visitShowroomTitle || "Visit Showroom");
                setVisitShowroomAddress(data.visitShowroomAddress || "Sheikh Zayed Road, Al Quoz 3, Dubai, United Arab Emirates");
                setShowVisitShowroomCard(data.showVisitShowroomCard !== undefined ? data.showVisitShowroomCard : true);

                setCallShowroomTitle(data.callShowroomTitle || "Call Showroom");
                setCallShowroomPhone(data.callShowroomPhone || "+971 4 000 0000");
                setShowCallShowroomCard(data.showCallShowroomCard !== undefined ? data.showCallShowroomCard : true);

                setEmailSupportTitle(data.emailSupportTitle || "Email Support");
                setEmailSupportEmail(data.emailSupportEmail || "info@apexluxury.ae");
                setShowEmailSupportCard(data.showEmailSupportCard !== undefined ? data.showEmailSupportCard : true);

                setShowroomTimingsTitle(data.showroomTimingsTitle || "Showroom Timings");
                setShowroomTimingsLine1(data.showroomTimingsLine1 || "Monday - Saturday: 9:00 AM - 9:00 PM");
                setShowroomTimingsLine2(data.showroomTimingsLine2 || "Sunday: 2:00 PM - 8:00 PM");
                setShowShowroomTimingsCard(data.showShowroomTimingsCard !== undefined ? data.showShowroomTimingsCard : true);

                setFormHeading(data.formHeading || "Send a Message");
                setFormNamePlaceholder(data.formNamePlaceholder || "Your Name");
                setFormEmailPlaceholder(data.formEmailPlaceholder || "Email Address");
                setFormPhonePlaceholder(data.formPhonePlaceholder || "Phone Number");
                setFormMessagePlaceholder(data.formMessagePlaceholder || "How can we assist you?");
                setFormSubmitButtonText(data.formSubmitButtonText || "Send Message");
                setShowContactForm(data.showContactForm !== undefined ? data.showContactForm : true);

                setMapPlaceName(data.mapPlaceName || "Sheikh Zayed Road, Al Quoz 3, Dubai, UAE");
                setMapAddress(data.mapAddress || "Sheikh Zayed Road, Al Quoz 3, Dubai, United Arab Emirates");
                setMapEmbedUrl(data.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115546.61111666874!2d55.20786968037107!3d25.17478648348873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43348a6d49bb%3A0x3b0779d71c4c1a40!2sSheikh%20Zayed%20Rd%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin");
                setMapLatitude(data.mapLatitude || "25.17478648348873");
                setMapLongitude(data.mapLongitude || "55.20786968037107");
                setMapZoom(data.mapZoom || "13");
                setShowMapSection(data.showMapSection !== undefined ? data.showMapSection : true);
            }
        } catch (err) {
            console.error("Error loading contact settings:", err);
            toast.error("Failed to load contact settings.");
        } finally {
            setLoading(false);
        }
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
                heroHeading,
                heroSubtitle,
                heroMediaType,
                heroImageUrl,
                heroImageAlt,
                heroVideoUrl,
                heroVideoPoster,
                showHeroSection,

                getInTouchHeading,
                getInTouchDescription,
                showGetInTouchSection,

                visitShowroomTitle,
                visitShowroomAddress,
                showVisitShowroomCard,

                callShowroomTitle,
                callShowroomPhone,
                showCallShowroomCard,

                emailSupportTitle,
                emailSupportEmail,
                showEmailSupportCard,

                showroomTimingsTitle,
                showroomTimingsLine1,
                showroomTimingsLine2,
                showShowroomTimingsCard,

                formHeading,
                formNamePlaceholder,
                formEmailPlaceholder,
                formPhonePlaceholder,
                formMessagePlaceholder,
                formSubmitButtonText,
                showContactForm,

                mapPlaceName,
                mapAddress,
                mapEmbedUrl,
                mapLatitude,
                mapLongitude,
                mapZoom,
                showMapSection
            };

            await contactSettingsApi.update(payload);
            toast.success("Contact Page Settings saved successfully!");
        } catch (err) {
            console.error("Save contact settings error:", err);
            toast.error(err.response?.data?.message || "Failed to save contact settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Are you sure you want to reset all Contact page settings to exact production defaults?")) {
            return;
        }

        try {
            setResetting(true);
            await contactSettingsApi.reset();
            toast.success("Contact settings reset to default values.");
            loadSettings();
        } catch (err) {
            console.error("Reset contact settings error:", err);
            toast.error("Failed to reset contact settings.");
        } finally {
            setResetting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-crud-panel">
                <div className="empty-crud-state" style={{ padding: "80px 20px" }}>
                    <p>Loading Contact Page Settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-crud-panel hero-settings-panel">
            {/* Header Bar */}
            <div className="campaign-header-row" style={{ marginBottom: "25px" }}>
                <div>
                    <h1>Public Contact Page CMS Settings</h1>
                    <p>Manage hero media, contact cards, map location, placeholders, and section visibility for the Contact page.</p>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a href="/contact" target="_blank" rel="noreferrer" className="campaign-action-btn view" style={{ textDecoration: "none", padding: "10px 18px", borderRadius: "10px" }}>
                        <FiEye /> Preview Public Contact Page
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
                            <FiStar /> 1. Hero Banner Settings
                        </h3>
                        <label style={{ fontSize: "12px", color: showHeroSection ? "#22c55e" : "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <input type="checkbox" checked={showHeroSection} onChange={(e) => setShowHeroSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            {showHeroSection ? "Section Enabled" : "Section Hidden"}
                        </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Hero Main Heading</label>
                            <input
                                type="text"
                                value={heroHeading}
                                onChange={(e) => setHeroHeading(e.target.value)}
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
                                            Reset Default Image
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
                                        placeholder="e.g. /uploads/hero-video.mp4 or https://..."
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
                                    <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Video Poster / Fallback Image URL</label>
                                    <input
                                        type="text"
                                        placeholder="Poster / Fallback image URL"
                                        value={heroVideoPoster}
                                        onChange={(e) => setHeroVideoPoster(e.target.value)}
                                        style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                    />
                                    <div style={{ marginTop: "10px" }}>
                                        <label className="campaign-action-btn view" style={{ cursor: "pointer", fontSize: "12px", padding: "8px 14px" }}>
                                            <FiUploadCloud /> {uploadingField === "heroVideoPoster" ? "Uploading..." : "Upload Poster Image"}
                                            <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, "heroVideoPoster")} disabled={uploadingField !== null} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Get In Touch Section */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ color: "#d4af37", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FiMessageSquare /> 2. Get In Touch Section
                        </h3>
                        <label style={{ fontSize: "12px", color: showGetInTouchSection ? "#22c55e" : "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <input type="checkbox" checked={showGetInTouchSection} onChange={(e) => setShowGetInTouchSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            {showGetInTouchSection ? "Section Enabled" : "Section Hidden"}
                        </label>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Section Heading</label>
                            <input
                                type="text"
                                value={getInTouchHeading}
                                onChange={(e) => setGetInTouchHeading(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Intro / Description Paragraph</label>
                            <textarea
                                rows={3}
                                value={getInTouchDescription}
                                onChange={(e) => setGetInTouchDescription(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", resize: "vertical" }}
                            />
                        </div>
                    </div>
                </div>

                {/* 3, 4, 5, 6. Contact Cards Settings */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 16px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiPhone /> 3 - 6. Contact Information Cards
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {/* Visit Showroom Card */}
                        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                <strong style={{ color: "#d4af37", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><FiMapPin /> Visit Showroom Card</strong>
                                <label style={{ fontSize: "11px", color: showVisitShowroomCard ? "#22c55e" : "#ef4444", cursor: "pointer" }}>
                                    <input type="checkbox" checked={showVisitShowroomCard} onChange={(e) => setShowVisitShowroomCard(e.target.checked)} style={{ marginRight: "4px" }} />
                                    Enabled
                                </label>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <label style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "4px" }}>Card Title</label>
                                <input
                                    type="text"
                                    value={visitShowroomTitle}
                                    onChange={(e) => setVisitShowroomTitle(e.target.value)}
                                    style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "4px" }}>Showroom Address</label>
                                <textarea
                                    rows={2}
                                    value={visitShowroomAddress}
                                    onChange={(e) => setVisitShowroomAddress(e.target.value)}
                                    style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px", resize: "vertical" }}
                                />
                            </div>
                        </div>

                        {/* Call Showroom Card */}
                        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                <strong style={{ color: "#d4af37", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><FiPhone /> Call Showroom Card</strong>
                                <label style={{ fontSize: "11px", color: showCallShowroomCard ? "#22c55e" : "#ef4444", cursor: "pointer" }}>
                                    <input type="checkbox" checked={showCallShowroomCard} onChange={(e) => setShowCallShowroomCard(e.target.checked)} style={{ marginRight: "4px" }} />
                                    Enabled
                                </label>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <label style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "4px" }}>Card Title</label>
                                <input
                                    type="text"
                                    value={callShowroomTitle}
                                    onChange={(e) => setCallShowroomTitle(e.target.value)}
                                    style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "4px" }}>Phone Number</label>
                                <input
                                    type="text"
                                    value={callShowroomPhone}
                                    onChange={(e) => setCallShowroomPhone(e.target.value)}
                                    style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                                />
                            </div>
                        </div>

                        {/* Email Support Card */}
                        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                <strong style={{ color: "#d4af37", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><FiMail /> Email Support Card</strong>
                                <label style={{ fontSize: "11px", color: showEmailSupportCard ? "#22c55e" : "#ef4444", cursor: "pointer" }}>
                                    <input type="checkbox" checked={showEmailSupportCard} onChange={(e) => setShowEmailSupportCard(e.target.checked)} style={{ marginRight: "4px" }} />
                                    Enabled
                                </label>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <label style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "4px" }}>Card Title</label>
                                <input
                                    type="text"
                                    value={emailSupportTitle}
                                    onChange={(e) => setEmailSupportTitle(e.target.value)}
                                    style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "4px" }}>Email Address</label>
                                <input
                                    type="email"
                                    value={emailSupportEmail}
                                    onChange={(e) => setEmailSupportEmail(e.target.value)}
                                    style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                                />
                            </div>
                        </div>

                        {/* Showroom Timings Card */}
                        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                <strong style={{ color: "#d4af37", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><FiClock /> Showroom Timings Card</strong>
                                <label style={{ fontSize: "11px", color: showShowroomTimingsCard ? "#22c55e" : "#ef4444", cursor: "pointer" }}>
                                    <input type="checkbox" checked={showShowroomTimingsCard} onChange={(e) => setShowShowroomTimingsCard(e.target.checked)} style={{ marginRight: "4px" }} />
                                    Enabled
                                </label>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <label style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "4px" }}>Card Title</label>
                                <input
                                    type="text"
                                    value={showroomTimingsTitle}
                                    onChange={(e) => setShowroomTimingsTitle(e.target.value)}
                                    style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                                />
                            </div>
                            <div style={{ marginBottom: "6px" }}>
                                <label style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "4px" }}>Timing Line 1 (Mon - Sat)</label>
                                <input
                                    type="text"
                                    value={showroomTimingsLine1}
                                    onChange={(e) => setShowroomTimingsLine1(e.target.value)}
                                    style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "4px" }}>Timing Line 2 (Sunday)</label>
                                <input
                                    type="text"
                                    value={showroomTimingsLine2}
                                    onChange={(e) => setShowroomTimingsLine2(e.target.value)}
                                    style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. Contact Form Settings */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ color: "#d4af37", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FiMessageSquare /> 7. Contact Form Customization
                        </h3>
                        <label style={{ fontSize: "12px", color: showContactForm ? "#22c55e" : "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <input type="checkbox" checked={showContactForm} onChange={(e) => setShowContactForm(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            {showContactForm ? "Form Enabled" : "Form Hidden"}
                        </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Form Heading</label>
                            <input
                                type="text"
                                value={formHeading}
                                onChange={(e) => setFormHeading(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Submit Button Text</label>
                            <input
                                type="text"
                                value={formSubmitButtonText}
                                onChange={(e) => setFormSubmitButtonText(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Name Field Placeholder</label>
                            <input
                                type="text"
                                value={formNamePlaceholder}
                                onChange={(e) => setFormNamePlaceholder(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Email Field Placeholder</label>
                            <input
                                type="text"
                                value={formEmailPlaceholder}
                                onChange={(e) => setFormEmailPlaceholder(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Phone Field Placeholder</label>
                            <input
                                type="text"
                                value={formPhonePlaceholder}
                                onChange={(e) => setFormPhonePlaceholder(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Message Textarea Placeholder</label>
                            <input
                                type="text"
                                value={formMessagePlaceholder}
                                onChange={(e) => setFormMessagePlaceholder(e.target.value)}
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>
                    </div>
                </div>

                {/* 8 & 9. Map / Location Settings */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ color: "#d4af37", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <FiCompass /> 8 & 9. Map / Location Settings
                        </h3>
                        <label style={{ fontSize: "12px", color: showMapSection ? "#22c55e" : "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <input type="checkbox" checked={showMapSection} onChange={(e) => setShowMapSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            {showMapSection ? "Map Enabled" : "Map Hidden"}
                        </label>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Location / Place Name</label>
                                <input
                                    type="text"
                                    value={mapPlaceName}
                                    onChange={(e) => setMapPlaceName(e.target.value)}
                                    style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Full Address</label>
                                <input
                                    type="text"
                                    value={mapAddress}
                                    onChange={(e) => setMapAddress(e.target.value)}
                                    style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Google Maps Embed URL</label>
                            <input
                                type="text"
                                value={mapEmbedUrl}
                                onChange={(e) => setMapEmbedUrl(e.target.value)}
                                placeholder="https://www.google.com/maps/embed?pb=..."
                                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                            <div>
                                <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Latitude</label>
                                <input
                                    type="text"
                                    value={mapLatitude}
                                    onChange={(e) => setMapLatitude(e.target.value)}
                                    placeholder="25.174786"
                                    style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Longitude</label>
                                <input
                                    type="text"
                                    value={mapLongitude}
                                    onChange={(e) => setMapLongitude(e.target.value)}
                                    placeholder="55.207869"
                                    style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: "12px", color: "#8a8a93", display: "block", marginBottom: "6px" }}>Map Zoom Level</label>
                                <input
                                    type="text"
                                    value={mapZoom}
                                    onChange={(e) => setMapZoom(e.target.value)}
                                    placeholder="13"
                                    style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 10. Global Section Visibility Summary */}
                <div className="hero-settings-card" style={{ background: "rgba(18, 18, 22, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "24px" }}>
                    <h3 style={{ color: "#d4af37", margin: "0 0 16px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiCheckCircle /> 10. Section Visibility Controls Summary
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "12px" }}>
                            <input type="checkbox" checked={showHeroSection} onChange={(e) => setShowHeroSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Hero Section
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "12px" }}>
                            <input type="checkbox" checked={showGetInTouchSection} onChange={(e) => setShowGetInTouchSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Get In Touch Section
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "12px" }}>
                            <input type="checkbox" checked={showVisitShowroomCard} onChange={(e) => setShowVisitShowroomCard(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Visit Showroom Card
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "12px" }}>
                            <input type="checkbox" checked={showCallShowroomCard} onChange={(e) => setShowCallShowroomCard(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Call Showroom Card
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "12px" }}>
                            <input type="checkbox" checked={showEmailSupportCard} onChange={(e) => setShowEmailSupportCard(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Email Support Card
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "12px" }}>
                            <input type="checkbox" checked={showShowroomTimingsCard} onChange={(e) => setShowShowroomTimingsCard(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Showroom Timings Card
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "12px" }}>
                            <input type="checkbox" checked={showContactForm} onChange={(e) => setShowContactForm(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Contact Form
                        </label>

                        <label style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "12px" }}>
                            <input type="checkbox" checked={showMapSection} onChange={(e) => setShowMapSection(e.target.checked)} style={{ accentColor: "#d4af37" }} />
                            Map Section
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ContactSettings;
