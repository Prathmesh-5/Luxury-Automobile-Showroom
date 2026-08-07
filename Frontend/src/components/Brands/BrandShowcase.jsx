import "./BrandShowcase.css";
import { useNavigate } from "react-router-dom";

const fallbackHero = "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200";

const BrandShowcase = ({ brand }) => {
    const navigate = useNavigate();

    const handleExploreInventory = () => {
        navigate(`/cars?brand=${brand.slug}`);
    };

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return null;
        if (logoPath.startsWith("http")) return logoPath;

        const base =
            import.meta.env.VITE_IMAGE_BASE_URL ||
            "http://localhost:5000";

        return `${base}${logoPath}`;
    };

    // Robust dynamic data fallbacks
    const name = brand.name || "Bespoke Brand";
    const country = brand.country || "International";
    const founded = brand.foundedYear ? `Founded in ${brand.foundedYear} • ` : "";
    const overview = brand.overview || brand.description || "Crafted to represent the absolute pinnacle of luxury performance, motoring excellence, and bespoke craftsmanship.";
    
    const whyChooseList = Array.isArray(brand.whyChoose) && brand.whyChoose.length > 0 
        ? brand.whyChoose 
        : [
            "Bespoke Personalization",
            "Cutting-edge Technology",
            "Uncompromised Performance",
            "Exquisite Cabin Comfort",
            "Iconic Design Heritage"
        ];

    const popularModelsList = Array.isArray(brand.popularModels) && brand.popularModels.length > 0
        ? brand.popularModels
        : ["Bespoke Collection"];

    const speed = brand.performance?.speed || "N/A";
    const zero = brand.performance?.zero || "N/A";
    const hp = brand.performance?.hp || "N/A";
    const engine = brand.performance?.engine || "Bespoke Power Unit";

    const heroImage = brand.heroCar ? getLogoUrl(brand.heroCar) : fallbackHero;
    const logoImage = getLogoUrl(brand.logo);

    return (
        <section className="brand-showcase">
            <div className="brand-showcase-glass-panel">
                {/* Gold ambient background lights */}
                <div className="gold-glow-orb-top-right"></div>
                <div className="gold-glow-orb-bottom-left"></div>

                <div className="showcase-grid-header">
                    <div className="brand-details-column">
                        <div className="brand-meta-wrapper">
                            {logoImage ? (
                                <img
                                    className="showcase-brand-logo"
                                    src={logoImage}
                                    alt={`${name} logo`}
                                />
                            ) : (
                                <div className="showcase-brand-text-logo">{name}</div>
                            )}
                            <div className="brand-title-group">
                                <h2>{name}</h2>
                                <span className="brand-origin-badge">
                                    {founded}{country}
                                </span>
                            </div>
                        </div>
                        <p className="brand-overview-text">
                            {overview}
                        </p>
                    </div>

                    <div className="brand-hero-column">
                        <div className="hero-car-image-container">
                            <img
                                className="showcase-hero-car"
                                src={heroImage}
                                alt={`${name} hero car`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = fallbackHero;
                                }}
                            />
                            <div className="hero-reflection-overlay"></div>
                        </div>
                    </div>
                </div>

                <div className="showcase-grid-middle">
                    <div className="why-choose-block">
                        <h3>Why Choose {name}</h3>
                        <ul className="why-choose-list">
                            {whyChooseList.map((item, index) => (
                                <li key={index} className="why-choose-item">
                                    <span className="gold-bullet">✦</span>
                                    <span className="item-text">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="popular-models-block">
                        <h3>Popular Models</h3>
                        <div className="models-badge-grid">
                            {popularModelsList.map((model, index) => (
                                <div key={index} className="model-badge-card">
                                    <span className="badge-bullet">⚜</span>
                                    <h4>{model}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="performance-highlights-section">
                    <h3>Performance Highlights</h3>
                    <div className="performance-metrics-grid">
                        <div className="metric-card">
                            <span className="metric-label">Top Speed</span>
                            <strong className="metric-value">{speed}</strong>
                            <div className="metric-card-border-glow"></div>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">0-100 km/h</span>
                            <strong className="metric-value">{zero}</strong>
                            <div className="metric-card-border-glow"></div>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Horsepower</span>
                            <strong className="metric-value">{hp}</strong>
                            <div className="metric-card-border-glow"></div>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Engine</span>
                            <strong className="metric-value">{engine}</strong>
                            <div className="metric-card-border-glow"></div>
                        </div>
                    </div>
                </div>

                <div className="showcase-cta-container">
                    <button
                        className="explore-brand-inventory-btn"
                        onClick={handleExploreInventory}
                    >
                        Explore {name} Inventory
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BrandShowcase;