import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { aboutSettingsApi } from "../../services/api";
import "./About.css";

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600&auto=format&fit=crop&q=80";
const DEFAULT_PINNACLE_IMAGE = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80";

function About() {
    const [settings, setSettings] = useState(null);
    const [heroVideoError, setHeroVideoError] = useState(false);
    const [pinnacleVideoError, setPinnacleVideoError] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await aboutSettingsApi.getPublic();
                if (data) {
                    setSettings(data);
                }
            } catch (err) {
                console.error("Failed to load about page settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const getFormattedMedia = (url, fallback = "") => {
        if (!url) return fallback;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${url}`;
    };

    // Hero Fallbacks
    const heroTitle = settings?.heroTitle || "About Apex";
    const heroSubtitle = settings?.heroSubtitle || "Crafting bespoke luxury automotive legacies since 2003";
    const heroMediaType = settings?.heroMediaType || "image";
    const heroImageUrl = getFormattedMedia(settings?.heroImageUrl, DEFAULT_HERO_IMAGE);
    const heroVideoUrl = getFormattedMedia(settings?.heroVideoUrl);
    const heroVideoPoster = getFormattedMedia(settings?.heroVideoPoster);
    const showHeroSection = settings?.showHeroSection !== false;

    // Pinnacle Fallbacks
    const pinnacleTitle = settings?.pinnacleTitle || "The Pinnacle of Luxury";
    const pinnacleLeadText = settings?.pinnacleLeadText || "Apex Luxury Automobiles represents more than a dealership; we represent a gateway to the world’s most refined driving experiences.";
    const pinnacleParagraph1 = settings?.pinnacleParagraph1 || "Founded in 2003 in Dubai, we have established a reputation as a trusted purveyor of high-performance supercars, premium SUVs, and hand-crafted grand tourers. Our commitment to absolute quality guides everything we do, from vehicle selection to post-sale customization.";
    const pinnacleParagraph2 = settings?.pinnacleParagraph2 || "Each vehicle in our showroom undergoes a meticulous multi-point inspection by certified mechanics, ensuring that only pristine models reach our distinguished clientele.";
    const pinnacleMediaType = settings?.pinnacleMediaType || "image";
    const pinnacleImageUrl = getFormattedMedia(settings?.pinnacleImageUrl, DEFAULT_PINNACLE_IMAGE);
    const pinnacleImageAlt = settings?.pinnacleImageAlt || "Showroom Display";
    const pinnacleVideoUrl = getFormattedMedia(settings?.pinnacleVideoUrl);
    const pinnacleVideoPoster = getFormattedMedia(settings?.pinnacleVideoPoster);
    const showPinnacleSection = settings?.showPinnacleSection !== false;

    // Values Fallbacks
    const valuesTitle = settings?.valuesTitle || "Our Core Values";
    const showValuesSection = settings?.showValuesSection !== false;

    const card1Number = settings?.card1Number || "01";
    const card1Title = settings?.card1Title || "Excellence";
    const card1Description = settings?.card1Description || "We demand excellence in our inventory, our services, and our guest hospitality, delivering a world-class environment.";
    const card1Enabled = settings?.card1Enabled !== false;

    const card2Number = settings?.card2Number || "02";
    const card2Title = settings?.card2Title || "Integrity";
    const card2Description = settings?.card2Description || "Transparent dealings, absolute authenticity, and honest certifications form the foundations of customer trust.";
    const card2Enabled = settings?.card2Enabled !== false;

    const card3Number = settings?.card3Number || "03";
    const card3Title = settings?.card3Title || "Bespoke Care";
    const card3Description = settings?.card3Description || "Every customer is unique. We provide customized buying plans, international logistics, and tailored customizations.";
    const card3Enabled = settings?.card3Enabled !== false;

    const isHeroVideo = heroMediaType === "video" && heroVideoUrl && !heroVideoError;
    const isPinnacleVideo = pinnacleMediaType === "video" && pinnacleVideoUrl && !pinnacleVideoError;

    return (
        <div className="about-page">
            <Navbar />
            
            {/* Banner */}
            {showHeroSection && (
                <div
                    className="about-banner"
                    style={{
                        backgroundImage: isHeroVideo ? "none" : `url("${heroImageUrl}")`
                    }}
                >
                    {isHeroVideo && (
                        <video
                            src={heroVideoUrl}
                            poster={heroVideoPoster}
                            autoPlay
                            muted
                            loop
                            playsInline
                            onError={() => setHeroVideoError(true)}
                            style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                zIndex: 1
                            }}
                        />
                    )}
                    <div className="banner-overlay" style={{ zIndex: 2 }}></div>
                    <div className="banner-content" style={{ zIndex: 3 }}>
                        <h1>{heroTitle}</h1>
                        <p>{heroSubtitle}</p>
                    </div>
                </div>
            )}

            {/* Introduction */}
            {showPinnacleSection && (
                <section className="about-intro-section">
                    <div className="about-container">
                        <div className="intro-grid">
                            <div className="intro-text">
                                <h2>{pinnacleTitle}</h2>
                                {pinnacleLeadText && (
                                    <p className="lead-text">
                                        {pinnacleLeadText}
                                    </p>
                                )}
                                {pinnacleParagraph1 && <p>{pinnacleParagraph1}</p>}
                                {pinnacleParagraph2 && <p>{pinnacleParagraph2}</p>}
                            </div>
                            <div className="intro-image">
                                {isPinnacleVideo ? (
                                    <video
                                        src={pinnacleVideoUrl}
                                        poster={pinnacleVideoPoster}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        onError={() => setPinnacleVideoError(true)}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <img 
                                        src={pinnacleImageUrl} 
                                        alt={pinnacleImageAlt} 
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Core Values */}
            {showValuesSection && (card1Enabled || card2Enabled || card3Enabled) && (
                <section className="values-section">
                    <div className="about-container">
                        <h2 className="section-header">{valuesTitle}</h2>
                        <div className="values-grid">
                            {card1Enabled && (
                                <div className="value-card">
                                    <div className="value-num">{card1Number}</div>
                                    <h3>{card1Title}</h3>
                                    <p>{card1Description}</p>
                                </div>
                            )}

                            {card2Enabled && (
                                <div className="value-card">
                                    <div className="value-num">{card2Number}</div>
                                    <h3>{card2Title}</h3>
                                    <p>{card2Description}</p>
                                </div>
                            )}

                            {card3Enabled && (
                                <div className="value-card">
                                    <div className="value-num">{card3Number}</div>
                                    <h3>{card3Title}</h3>
                                    <p>{card3Description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
}

export default About;