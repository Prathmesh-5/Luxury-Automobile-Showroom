import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaYoutube,
    FaLinkedin,
    FaLock,
    FaClock
} from "react-icons/fa";
import { footerSettingsApi, heroSettingsApi, newsletterApi } from "../../services/api";
import { toast } from "react-hot-toast";

import "./Footer.css";
import defaultLogo from "../../assets/images/logo/logo.png";
import sideCar from "../../assets/images/cars/sidecar.png";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_QUICK_LINKS = [
    { title: "Our Inventory", url: "/cars", isExternal: false, enabled: true },
    { title: "Sell Your Car", url: "/sell-your-car", isExternal: false, enabled: true },
    { title: "About Us", url: "/about", isExternal: false, enabled: true },
    { title: "Contact Support", url: "/contact", isExternal: false, enabled: true },
    { title: "FAQs / Chatbot", url: "/faq", isExternal: false, enabled: true }
];

const DEFAULT_SOCIAL_LINKS = [
    { platform: "Facebook", url: "#", icon: "facebook", enabled: true },
    { platform: "Instagram", url: "#", icon: "instagram", enabled: true },
    { platform: "Twitter", url: "#", icon: "twitter", enabled: true },
    { platform: "YouTube", url: "#", icon: "youtube", enabled: true }
];

function Footer() {
    const [footerSettings, setFooterSettings] = useState({});
    const [heroLogoUrl, setHeroLogoUrl] = useState("");
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        const fetchAllSettings = async () => {
            try {
                const data = await footerSettingsApi.getPublic();
                if (data) {
                    setFooterSettings(data);
                }
            } catch (err) {
                console.error("Failed to load footer settings:", err);
            }

            try {
                const heroData = await heroSettingsApi.getPublic();
                if (heroData && heroData.logoUrl) {
                    setHeroLogoUrl(heroData.logoUrl);
                }
            } catch (err) {
                console.error("Failed to load logo from hero settings for footer:", err);
            }
        };

        fetchAllSettings();
    }, []);

    const getFormattedImage = (path, fallback) => {
        if (!path) return fallback;
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${path}`;
    };

    const getSocialIcon = (iconType, platform) => {
        const key = (iconType || platform || "").toLowerCase();
        if (key.includes("facebook")) return <FaFacebookF />;
        if (key.includes("instagram")) return <FaInstagram />;
        if (key.includes("twitter") || key.includes("x")) return <FaTwitter />;
        if (key.includes("youtube")) return <FaYoutube />;
        if (key.includes("linkedin")) return <FaLinkedin />;
        return <FaFacebookF />;
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setFeedback(null);

        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
            setFeedback({
                type: "error",
                message: "Please enter a valid email address."
            });
            return;
        }

        try {
            setSubmitting(true);
            const res = await newsletterApi.subscribe(trimmedEmail);

            if (res.success) {
                const isAlreadySubscribed = res.message && res.message.toLowerCase().includes("already subscribed");
                
                if (isAlreadySubscribed) {
                    setFeedback({
                        type: "error",
                        message: "You're already subscribed."
                    });
                    toast.error("You're already subscribed.");
                } else {
                    setFeedback({
                        type: "success",
                        message: res.message || "Thank you for subscribing!"
                    });
                    toast.success("Thank you for subscribing!");
                    setEmail("");
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong. Please try again.";
            setFeedback({
                type: "error",
                message: errorMsg
            });
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter enabled links with fallback to default links
    const quickLinksList = (
        footerSettings.quickLinks && footerSettings.quickLinks.length > 0
            ? footerSettings.quickLinks.filter((l) => l.enabled !== false)
            : DEFAULT_QUICK_LINKS
    );

    const socialLinksList = (
        footerSettings.socialLinks && footerSettings.socialLinks.length > 0
            ? footerSettings.socialLinks.filter((s) => s.enabled !== false)
            : DEFAULT_SOCIAL_LINKS
    );

    const logoSrc = getFormattedImage(footerSettings.logoUrl || heroLogoUrl, defaultLogo);
    const carSrc = getFormattedImage(footerSettings.carImageUrl, sideCar);

    return (
        <footer className="showroom-footer">
            <div className="footer-top">
                <div className="footer-container">
                    {/* Brand Info */}
                    <div className="footer-col brand-info">
                        {footerSettings.showLogo !== false && (
                            <img src={logoSrc} alt="Apex Luxury Automobiles" className="footer-logo" />
                        )}

                        {footerSettings.showDescription !== false && (
                            <p className="footer-desc">
                                {footerSettings.description || "Discover an exclusive collection of luxury, sports, and exotic automobiles. We define excellence and bespoke automotive experiences."}
                            </p>
                        )}

                        {footerSettings.showSocialLinks !== false && socialLinksList.length > 0 && (
                            <div className="social-links">
                                {socialLinksList.map((soc, idx) => (
                                    <a key={soc._id || idx} href={soc.url || "#"} target="_blank" rel="noopener noreferrer">
                                        {getSocialIcon(soc.icon, soc.platform)}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    {footerSettings.showQuickLinks !== false && (
                        <div className="footer-col links-col">
                            <h3>Quick Links</h3>
                            <ul>
                                {quickLinksList.map((link, idx) => (
                                    <li key={link._id || idx}>
                                        {link.isExternal ? (
                                            <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a>
                                        ) : (
                                            <Link to={link.url}>{link.title}</Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contact */}
                    {footerSettings.showShowroomInfo !== false && (
                        <div className="footer-col contact-col">
                            <h3>Showroom Info</h3>

                            <ul>
                                <li>
                                    <FaMapMarkerAlt className="footer-icon" />
                                    <span>{footerSettings.address || "Sheikh Zayed Road, Al Quoz 3, Dubai, UAE"}</span>
                                </li>

                                <li>
                                    <FaPhoneAlt className="footer-icon" />
                                    <span>{footerSettings.phone || "+971 4 000 0000"}</span>
                                </li>

                                <li>
                                    <FaEnvelope className="footer-icon" />
                                    <span>{footerSettings.email || "info@apexluxury.ae"}</span>
                                </li>

                                {footerSettings.businessHours && (
                                    <li>
                                        <FaClock className="footer-icon" />
                                        <span>{footerSettings.businessHours}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Newsletter */}
                    {footerSettings.showNewsletter !== false && (
                        <div className="footer-col newsletter-col">
                            <h3>{footerSettings.newsletterHeading || "Newsletter"}</h3>

                            <p>
                                {footerSettings.newsletterDescription || "Subscribe to receive updates on our latest luxury arrivals."}
                            </p>

                            <form
                                className="subscribe-form"
                                onSubmit={handleSubscribe}
                            >
                                <input
                                    type="email"
                                    placeholder={footerSettings.newsletterPlaceholder || "Your Email Address"}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (feedback) setFeedback(null);
                                    }}
                                    disabled={submitting}
                                    required
                                />

                                <button
                                    type="submit"
                                    className="subscribe-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? "Subscribing..." : (footerSettings.newsletterButtonText || "Subscribe")}
                                </button>
                            </form>

                            {feedback && (
                                <div className={`subscribe-msg ${feedback.type}`}>
                                    {feedback.message}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* CAR YAHAN HOGI */}
            {footerSettings.showCarImage !== false && (
                <div className="footer-car">
                    <img src={carSrc} alt={footerSettings.carImageAlt || "Luxury Sports Car"} />
                </div>
            )}

            <div className="footer-bottom">
                <div className="footer-container">
                    {footerSettings.showCopyright !== false && (
                        <p>
                            &copy; {footerSettings.autoCurrentYear !== false ? `${new Date().getFullYear()} ` : ""}{footerSettings.copyrightText || "Apex Luxury Showroom. All Rights Reserved."}
                        </p>
                    )}

                    <div className="footer-bottom-links">
                        <Link
                            to="/admin/login"
                            className="admin-portal-link"
                        >
                            <FaLock style={{ fontSize: "11px" }} />
                            {" "}Secure Admin Portal
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;