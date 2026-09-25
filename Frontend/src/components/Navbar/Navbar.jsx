import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { brandsApi, heroSettingsApi } from "../../services/api";
import "./Navbar.css";
import defaultLogo from "../../assets/images/logo/logo.png";

function Navbar() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    
    const [brands, setBrands] = useState([]);
    const [brandsDropdownOpen, setBrandsDropdownOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const list = await brandsApi.getAll();
                setBrands(list.filter(b => b.isActive));
            } catch (err) {
                console.error("Failed to load brands for navbar:", err);
            }
        };
        const fetchSettings = async () => {
            try {
                const data = await heroSettingsApi.getPublic();
                if (data && data.logoUrl) {
                    setLogoUrl(data.logoUrl);
                }
            } catch (err) {
                console.error("Failed to load logo from hero settings:", err);
            }
        };
        fetchBrands();
        fetchSettings();
    }, []);

    const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

    const closeMobileMenu = () => {
        setMobileOpen(false);
        setBrandsDropdownOpen(false);
    };

    const getFormattedLogo = (url) => {
        if (!url) return defaultLogo;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${url}`;
    };

    return (
        <header className={`navbar ${scrolled ? "scrolled" : ""} ${mobileOpen ? "mobile-active" : ""}`}>
            <div className="navbar-container">
                {/* Mobile Menu Icon */}
                <button className="navbar-toggle-btn" onClick={toggleMobileMenu}>
                    {mobileOpen ? <FiX /> : <FiMenu />}
                </button>

                {/* Left Navigation */}
                <nav className={`nav-links nav-left ${mobileOpen ? "open" : ""}`}>
                    <NavLink to="/cars" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
                        Inventory
                    </NavLink>
                    
                    {/* Brands Dropdown */}
                    <div 
                        className="brands-dropdown-container"
                        onClick={() => setBrandsDropdownOpen(!brandsDropdownOpen)}
                        onMouseEnter={() => { if (window.innerWidth > 1024) setBrandsDropdownOpen(true); }}
                        onMouseLeave={() => { if (window.innerWidth > 1024) setBrandsDropdownOpen(false); }}
                    >
                        <span className="dropdown-trigger-text">
                            Brands
                        </span>
                        {brandsDropdownOpen && (
                            <div className="brands-dropdown-menu">
                                {brands.map(brand => (
                                    <Link 
                                        key={brand._id}
                                        to={`/cars?brand=${brand.slug}`}
                                        className="dropdown-item-link"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setBrandsDropdownOpen(false);
                                            closeMobileMenu();
                                        }}
                                    >
                                        {brand.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <NavLink to="/sell-your-car" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
                        Sell Your Car
                    </NavLink>
                    <NavLink to="/faq" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
                        FAQs
                    </NavLink>
                </nav>

                {/* Logo */}
                <div className="nav-logo">
                    <Link to="/" onClick={closeMobileMenu}>
                        <img src={getFormattedLogo(logoUrl)} alt="Apex Luxury Automobiles" />
                    </Link>
                </div>

                {/* Right Navigation */}
                <nav className={`nav-links nav-right ${mobileOpen ? "open" : ""}`}>
                    <NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
                        About
                    </NavLink>
                    <NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMobileMenu}>
                        Contact
                    </NavLink>
                    <button className="book-btn" onClick={() => { navigate("/test-drive"); closeMobileMenu(); }}>
                        Book Test Drive
                    </button>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;