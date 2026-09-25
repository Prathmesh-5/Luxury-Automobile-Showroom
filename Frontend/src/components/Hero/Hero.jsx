import { useState, useEffect, useRef, useMemo } from "react";
import "./Hero.css";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import defaultHeroImage from "../../assets/images/hero/hero.jpg";
import HeroStats from "./HeroStats";
import HeroBadge from "./HeroBadge";
import FloatingWheel from "../FloatingWheel/FloatingWheel";
import { heroSettingsApi } from "../../services/api";

function Hero() {
    const [settings, setSettings] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, {
        stiffness: 40,
        damping: 18
    });

    const smoothY = useSpring(mouseY, {
        stiffness: 40,
        damping: 18
    });

    useEffect(() => {
        let timeoutId = null;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsMobile(window.innerWidth < 768);
            }, 150);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const fetchHeroSettings = async () => {
            try {
                const data = await heroSettingsApi.getPublic();
                if (data) {
                    setSettings(data);
                }
            } catch (err) {
                if (import.meta.env.DEV) {
                    console.error("Failed to load hero settings:", err);
                }
            }
        };
        fetchHeroSettings();
    }, []);

    const handleMouseMove = (e) => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX - innerWidth / 2) / 35;
        const y = (e.clientY - innerHeight / 2) / 35;

        mouseX.set(x);
        mouseY.set(y);
    };

    const getMediaUrl = (path, fallback) => {
        if (!path) return fallback;
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${path}`;
    };

    // Hero Media Logic
    const mediaType = settings?.mediaType || "image";

    const bgImage = useMemo(() => {
        if (isMobile && settings?.mobileHeroImage) {
            return getMediaUrl(settings.mobileHeroImage, defaultHeroImage);
        } else if (settings?.desktopHeroImage) {
            return getMediaUrl(settings.desktopHeroImage, defaultHeroImage);
        }
        return defaultHeroImage;
    }, [isMobile, settings?.mobileHeroImage, settings?.desktopHeroImage]);

    const heroVideoUrl = useMemo(() => {
        return mediaType === "video" && settings?.heroVideo ? getMediaUrl(settings.heroVideo, "") : "";
    }, [mediaType, settings?.heroVideo]);

    useEffect(() => {
        setVideoError(false);
    }, [heroVideoUrl, mediaType]);

    useEffect(() => {
        if (mediaType === "video" && heroVideoUrl && videoRef.current && !videoError) {
            videoRef.current.muted = true;
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    if (import.meta.env.DEV) {
                        console.warn("Hero video autoplay failed, falling back to image:", err);
                    }
                    setVideoError(true);
                });
            }
        }
        return () => {
            if (videoRef.current) {
                try {
                    videoRef.current.pause();
                } catch (_) {}
            }
        };
    }, [mediaType, heroVideoUrl, videoError]);

    const handleVideoError = (err) => {
        if (import.meta.env.DEV) {
            console.error("Hero background video load error:", err);
        }
        setVideoError(true);
    };

    const isImageActive = mediaType === "image" || videoError || !heroVideoUrl;
    const overlayDarkness = settings?.overlayDarkness !== undefined ? settings.overlayDarkness : 0.6;

    // Content fields
    const smallBadgeText = settings?.smallBadgeText || "PREMIUM LUXURY AUTOMOBILES";
    const mainTitle = settings?.mainTitle || "Drive Beyond";
    const highlightTitle = settings?.highlightTitle || "Luxury";
    const descriptionText = settings?.descriptionText || "Discover an exclusive collection of luxury, sports and exotic cars crafted for those who demand excellence.";
    const topRightBadgeText = settings?.topRightBadgeText || "★ Trusted Since 2003";

    // Button fields
    const exploreBtnText = settings?.exploreBtnText || "Explore Collection";
    const exploreBtnLink = settings?.exploreBtnLink || "/cars";
    const bookBtnText = settings?.bookBtnText || "Book Test Drive";
    const bookBtnLink = settings?.bookBtnLink || "/test-drive";

    return (
        <section
            className={`hero ${isImageActive ? "hero-image-mode" : ""}`}
            onMouseMove={handleMouseMove}
            style={isImageActive ? { backgroundImage: `url(${bgImage})` } : {}}
        >
            {!isImageActive && (
                <video
                    ref={videoRef}
                    key={heroVideoUrl}
                    className="hero-video-bg"
                    src={heroVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    onError={handleVideoError}
                />
            )}

            <div
                className="hero-overlay"
                style={{
                    background: `linear-gradient(rgba(0,0,0,${overlayDarkness + 0.1}), rgba(0,0,0,${overlayDarkness}))`
                }}
            ></div>

            <motion.div
                className="car-reflection"
                style={{
                    x: smoothX,
                    y: smoothY
                }}
            ></motion.div>

            <div className="headlight-glow left"></div>
            <div className="headlight-glow right"></div>
            <div className="light-rays"></div>
            <div className="lens-flare"></div>
            <div className="hero-smoke"></div>

            <motion.div
                className="hero-content"
                style={{
                    x: smoothX,
                    y: smoothY
                }}
            >
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hero-subtitle"
                >
                    {smallBadgeText}
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {mainTitle} {highlightTitle && <span>{highlightTitle}</span>}
                </motion.h1>

                <motion.p
                    className="hero-description"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {descriptionText}
                </motion.p>

                <motion.div
                    className="hero-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {exploreBtnLink.startsWith("http") ? (
                        <a href={exploreBtnLink} target="_blank" rel="noreferrer" className="gold-btn">
                            {exploreBtnText}
                            <FaArrowRight />
                        </a>
                    ) : (
                        <Link to={exploreBtnLink} className="gold-btn">
                            {exploreBtnText}
                            <FaArrowRight />
                        </Link>
                    )}

                    {bookBtnLink.startsWith("http") ? (
                        <a href={bookBtnLink} target="_blank" rel="noreferrer" className="outline-btn">
                            {bookBtnText}
                        </a>
                    ) : (
                        <Link to={bookBtnLink} className="outline-btn">
                            {bookBtnText}
                        </Link>
                    )}
                </motion.div>
            </motion.div>

            <HeroBadge badgeText={topRightBadgeText} />
            <HeroStats establishedYear={settings?.establishedYear} />
            <FloatingWheel />

            <div className="scroll-indicator">
                Scroll
            </div>

            <div className="gold-particles">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className="smoke smoke1"></div>
            <div className="smoke smoke2"></div>
            <div className="smoke smoke3"></div>
            <div className="smoke smoke4"></div>
            <div className="smoke smoke5"></div>
            <div className="smoke smoke6"></div>
            <div className="smoke smoke7"></div>
            <div className="smoke smoke8"></div>
        </section>
    );
}

export default Hero;