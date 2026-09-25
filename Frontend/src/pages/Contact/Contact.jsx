import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { leadsApi, contactSettingsApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend } from "react-icons/fi";
import "./Contact.css";

const DEFAULT_CONTACT_SETTINGS = {
    heroHeading: "CONTACT US",
    heroSubtitle: "Connect with our expert advisors for bespoke automobile services",
    heroMediaType: "image",
    heroImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80",
    heroImageAlt: "Contact Banner",
    heroVideoUrl: "",
    heroVideoPoster: "",
    showHeroSection: true,

    getInTouchHeading: "Get In Touch",
    getInTouchDescription: "Have a question about our inventory, shipping, or trade-in evaluations? Feel free to contact our showroom advisors.",
    showGetInTouchSection: true,

    visitShowroomTitle: "Visit Showroom",
    visitShowroomAddress: "Sheikh Zayed Road, Al Quoz 3, Dubai, United Arab Emirates",
    showVisitShowroomCard: true,

    callShowroomTitle: "Call Showroom",
    callShowroomPhone: "+971 4 000 0000",
    showCallShowroomCard: true,

    emailSupportTitle: "Email Support",
    emailSupportEmail: "info@apexluxury.ae",
    showEmailSupportCard: true,

    showroomTimingsTitle: "Showroom Timings",
    showroomTimingsLine1: "Monday - Saturday: 9:00 AM - 9:00 PM",
    showroomTimingsLine2: "Sunday: 2:00 PM - 8:00 PM",
    showShowroomTimingsCard: true,

    formHeading: "Send a Message",
    formNamePlaceholder: "Your Name",
    formEmailPlaceholder: "Email Address",
    formPhonePlaceholder: "Phone Number",
    formMessagePlaceholder: "How can we assist you?",
    formSubmitButtonText: "Send Message",
    showContactForm: true,

    mapPlaceName: "Sheikh Zayed Road, Al Quoz 3, Dubai, UAE",
    mapAddress: "Sheikh Zayed Road, Al Quoz 3, Dubai, United Arab Emirates",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115546.61111666874!2d55.20786968037107!3d25.17478648348873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43348a6d49bb%3A0x3b0779d71c4c1a40!2sSheikh%20Zayed%20Rd%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    mapLatitude: "25.17478648348873",
    mapLongitude: "55.20786968037107",
    mapZoom: "13",
    showMapSection: true
};

function Contact() {
    const [settings, setSettings] = useState(DEFAULT_CONTACT_SETTINGS);
    const [videoError, setVideoError] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await contactSettingsApi.getPublic();
            if (data) {
                const merged = { ...DEFAULT_CONTACT_SETTINGS };
                Object.keys(DEFAULT_CONTACT_SETTINGS).forEach((key) => {
                    if (data[key] !== undefined && data[key] !== null) {
                        merged[key] = data[key];
                    }
                });
                setSettings(merged);
            }
        } catch (err) {
            console.error("Failed to load contact settings, using fallback defaults:", err);
        }
    };

    const getFullMediaUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${path}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setSubmitting(true);
        try {
            await leadsApi.create({
                carId: null,
                name,
                email,
                phone,
                message: `[General Contact Inquiry] ${message}`
            });
            toast.success("Contact message sent! Our showroom staff will contact you shortly.");
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
        } catch (err) {
            console.error("Failed to submit contact message:", err);
            toast.error(err.response?.data?.message || "Failed to send contact message.");
        } finally {
            setSubmitting(false);
        }
    };

    const getMapSrc = () => {
        if (settings.mapEmbedUrl && settings.mapEmbedUrl.trim()) {
            return settings.mapEmbedUrl;
        }
        const locQuery = (settings.mapLatitude && settings.mapLongitude)
            ? `${settings.mapLatitude},${settings.mapLongitude}`
            : (settings.mapAddress || settings.mapPlaceName || DEFAULT_CONTACT_SETTINGS.mapAddress);
        const zoom = settings.mapZoom || "13";
        return `https://maps.google.com/maps?q=${encodeURIComponent(locQuery)}&z=${zoom}&output=embed`;
    };

    const isVideoMedia = settings.heroMediaType === "video" && settings.heroVideoUrl && !videoError;
    const heroBgUrl = getFullMediaUrl(settings.heroImageUrl || DEFAULT_CONTACT_SETTINGS.heroImageUrl);
    const posterUrl = getFullMediaUrl(settings.heroVideoPoster || settings.heroImageUrl || DEFAULT_CONTACT_SETTINGS.heroImageUrl);

    const hasAnyCard = settings.showVisitShowroomCard || settings.showCallShowroomCard || settings.showEmailSupportCard || settings.showShowroomTimingsCard;
    const showInfoPanel = settings.showGetInTouchSection || hasAnyCard;
    const showCoreSection = showInfoPanel || settings.showContactForm;

    return (
        <div className="contact-page">
            <Navbar />
            
            {/* Banner */}
            {settings.showHeroSection && (
                <div 
                    className="contact-banner"
                    style={{
                        backgroundImage: isVideoMedia ? "none" : `url("${heroBgUrl}")`
                    }}
                >
                    {isVideoMedia && (
                        <video
                            src={getFullMediaUrl(settings.heroVideoUrl)}
                            poster={posterUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            onError={() => setVideoError(true)}
                            className="banner-video-bg"
                        />
                    )}
                    <div className="banner-overlay"></div>
                    <div className="banner-content">
                        <h1>{settings.heroHeading}</h1>
                        <p>{settings.heroSubtitle}</p>
                    </div>
                </div>
            )}

            {/* Core Section */}
            {showCoreSection && (
                <section className="contact-section">
                    <div className="contact-grid-container">
                        
                        {/* Left: Contact Info cards */}
                        {showInfoPanel && (
                            <div className="contact-info-panel">
                                {settings.showGetInTouchSection && (
                                    <>
                                        <h2>{settings.getInTouchHeading}</h2>
                                        <p>{settings.getInTouchDescription}</p>
                                    </>
                                )}
                                
                                {hasAnyCard && (
                                    <div className="info-cards-stack">
                                        {settings.showVisitShowroomCard && (
                                            <div className="info-item-card">
                                                <FiMapPin className="info-card-icon" />
                                                <div className="info-card-text">
                                                    <h4>{settings.visitShowroomTitle}</h4>
                                                    <p>{settings.visitShowroomAddress}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {(settings.showCallShowroomCard || settings.showEmailSupportCard) && (
                                            <div className="info-item-row">
                                                {settings.showCallShowroomCard && (
                                                    <div className="info-item-card">
                                                        <FiPhone className="info-card-icon" />
                                                        <div className="info-card-text">
                                                            <h4>{settings.callShowroomTitle}</h4>
                                                            <p>
                                                                <a 
                                                                    href={`tel:${settings.callShowroomPhone.replace(/\s+/g, '')}`}
                                                                    style={{ color: "inherit", textDecoration: "none" }}
                                                                >
                                                                    {settings.callShowroomPhone}
                                                                </a>
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {settings.showEmailSupportCard && (
                                                    <div className="info-item-card">
                                                        <FiMail className="info-card-icon" />
                                                        <div className="info-card-text">
                                                            <h4>{settings.emailSupportTitle}</h4>
                                                            <p>
                                                                <a 
                                                                    href={`mailto:${settings.emailSupportEmail}`}
                                                                    style={{ color: "inherit", textDecoration: "none" }}
                                                                >
                                                                    {settings.emailSupportEmail}
                                                                </a>
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {settings.showShowroomTimingsCard && (
                                            <div className="info-item-card">
                                                <FiClock className="info-card-icon" />
                                                <div className="info-card-text">
                                                    <h4>{settings.showroomTimingsTitle}</h4>
                                                    {settings.showroomTimingsLine1 && <p>{settings.showroomTimingsLine1}</p>}
                                                    {settings.showroomTimingsLine2 && <p>{settings.showroomTimingsLine2}</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Right: Contact Form */}
                        {settings.showContactForm && (
                            <div className="contact-form-card">
                                <h3>{settings.formHeading}</h3>
                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-field-group">
                                        <input 
                                            type="text" 
                                            placeholder={settings.formNamePlaceholder} 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="form-field-group">
                                        <input 
                                            type="email" 
                                            placeholder={settings.formEmailPlaceholder} 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="form-field-group">
                                        <input 
                                            type="tel" 
                                            placeholder={settings.formPhonePlaceholder} 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="form-field-group">
                                        <textarea 
                                            placeholder={settings.formMessagePlaceholder} 
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows="5"
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="contact-submit-btn" disabled={submitting}>
                                        {submitting ? "Sending..." : <>{settings.formSubmitButtonText} <FiSend className="btn-icon-right" /></>}
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </section>
            )}

            {/* Embedded Google Maps */}
            {settings.showMapSection && (
                <section className="maps-section">
                    <div className="map-frame-container">
                        <iframe 
                            title={settings.mapPlaceName || "Showroom Location Map"}
                            src={getMapSrc()} 
                            width="100%" 
                            height="450" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
}

export default Contact;