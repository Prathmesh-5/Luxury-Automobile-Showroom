import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { carsApi, brandsApi } from "../../services/api";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { FiSearch, FiSliders, FiCalendar, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { PiGaugeBold } from "react-icons/pi";
import HoverTrackerCard from "../../components/Hero/HoverTrackerCard";
import InventoryPremiumSelect from "./InventoryPremiumSelect";
import { motion } from "framer-motion";
import "./Cars.css";



function Cars() {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Core Data States
    const [cars, setCars] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    
    // Filter Panel States
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    
    // Read parameters from URL (or set defaults)
    const search = searchParams.get("search") || "";
    const brandIdParam = searchParams.get("brandId") || "";
    const brandSlugParam = searchParams.get("brand") || "";
    const condition = searchParams.get("condition") || "";
    const status = searchParams.get("status") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const year = searchParams.get("year") || "";
    const sort = searchParams.get("sort") || "";
    const page = parseInt(searchParams.get("page")) || 1;

    // Resolve Collection Dropdown Value
    let collectionValue = "";
    if (condition === "New") {
        collectionValue = "New";
    } else if (status === "Available") {
        collectionValue = "Available";
    } else if (status === "Sold") {
        collectionValue = "Sold";
    }

    const handleCollectionChange = (e) => {
        const val = e.target.value;
        const newParams = new URLSearchParams(searchParams);
        
        newParams.delete("condition");
        newParams.delete("status");
        
        if (val === "New") {
            newParams.set("condition", "New");
        } else if (val === "Available") {
            newParams.set("status", "Available");
        } else if (val === "Sold") {
            newParams.set("status", "Sold");
        }
        
        newParams.set("page", "1");
        setSearchParams(newParams);
    };

    // Load active brands list
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const list = await brandsApi.getAll();
                setBrands(list || []);
            } catch (err) {
                console.error("Failed to load brands:", err);
            }
        };
        fetchBrands();
    }, []);

    // Fetch filtered cars
    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                // Resolve Brand ID from brandSlugParam if brandIdParam is not provided
                let finalBrandId = brandIdParam;
                if (!finalBrandId && brandSlugParam && brands.length > 0) {
                    const matched = brands.find(b => b.slug === brandSlugParam);
                    if (matched) {
                        finalBrandId = matched._id;
                    }
                }

                const params = {
                    search,
                    brandId: finalBrandId,
                    condition,
                    status,
                    minPrice,
                    maxPrice,
                    year,
                    sort,
                    page,
                    limit: 9 // Increased from 6 to 9 to show 3 rows of 3 columns
                };
                const res = await carsApi.getAll(params);
                setCars(res.data || []);
                setTotalPages(res.totalPages || 1);
            } catch (err) {
                console.error("Failed to load cars catalog:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, [search, brandIdParam, brandSlugParam, condition, status, minPrice, maxPrice, year, sort, page, brands]);

    // Handle filter parameters changes
    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        if (key !== "page") {
            newParams.set("page", "1"); // Only reset to page 1 if changing filters, not switching pages!
        }
        setSearchParams(newParams);
    };

    const handleClearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);
    };

    const getImageUrl = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800";
        if (img.startsWith("http")) return img;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${img}`;
    };

    return (
        <motion.div 
            className="cars-page-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
        >
            <Navbar />
            
            {/* Header Banner */}
            <div className="cars-banner">
                <div className="banner-overlay"></div>
                <div className="banner-content">
                    <h1>Explore Inventory</h1>
                    <p>Discover your next bespoke luxury driving experience</p>
                </div>
            </div>

            {/* Inventory Core Section */}
            <section className="inventory-section">
                <div className="inventory-container">
                    
                    {/* Filters Sidebar */}
                    <aside className={`filters-sidebar ${showMobileFilters ? "open" : ""}`}>
                        <div className="sidebar-header">
                            <h3>Filters</h3>
                            <button className="clear-all-btn" onClick={handleClearFilters}>
                                Clear All
                            </button>
                        </div>

                        {/* Keyword Search */}
                        <div className="filter-group">
                            <label>Search</label>
                            <div className="sidebar-search">
                                <FiSearch className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Model, features..."
                                    value={search}
                                    onChange={(e) => updateFilter("search", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Brand Select */}
                        <div className="filter-group">
                            <label>Brand</label>
                            <InventoryPremiumSelect 
                                id="cars-filter-brand"
                                value={brandIdParam || (brands.find(b => b.slug === brandSlugParam)?._id || "")}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.delete("brand"); // Clear slug parameter to avoid conflict
                                    if (val) {
                                        newParams.set("brandId", val);
                                    } else {
                                        newParams.delete("brandId");
                                    }
                                    newParams.set("page", "1");
                                    setSearchParams(newParams);
                                }}
                                options={[
                                    { value: "", label: "All Brands" },
                                    ...brands.map((b) => ({ value: b._id, label: b.name }))
                                ]}
                            />
                        </div>

                        {/* Collection Filter (New Arrival, For Sale, Previously Sold) */}
                        <div className="filter-group">
                            <label>Collection Type</label>
                            <InventoryPremiumSelect 
                                id="cars-filter-collection"
                                value={collectionValue}
                                onChange={handleCollectionChange}
                                options={[
                                    { value: "", label: "All Vehicles" },
                                    { value: "New", label: "New Arrivals" },
                                    { value: "Available", label: "Cars for Sale" },
                                    { value: "Sold", label: "Previously Sold Cars" }
                                ]}
                            />
                        </div>


                        {/* Model Year Input */}
                        <div className="filter-group">
                            <label>Year</label>
                            <input 
                                type="number" 
                                placeholder="e.g. 2025"
                                value={year}
                                onChange={(e) => updateFilter("year", e.target.value)}
                                min="1990"
                                max="2027"
                            />
                        </div>

                        {/* Price Bounds */}
                        <div className="filter-group">
                            <label>Price Range (INR)</label>
                            <div className="price-inputs">
                                <input 
                                    type="number" 
                                    placeholder="Min Price"
                                    value={minPrice}
                                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                                />
                                <input 
                                    type="number" 
                                    placeholder="Max Price"
                                    value={maxPrice}
                                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            className="apply-mobile-btn"
                            onClick={() => setShowMobileFilters(false)}
                        >
                            Apply Filters
                        </button>
                    </aside>

                    {/* Catalog Core Grid */}
                    <div className="catalog-content">
                        
                        {/* Top Filters Info Bar */}
                        <div className="catalog-header-bar">
                            <div className="found-count">
                                <span>{cars.length}</span> Vehicles Available
                            </div>
                            
                            <div className="sorting-group">
                                <button 
                                    className="mobile-filters-trigger"
                                    onClick={() => setShowMobileFilters(true)}
                                >
                                    <FiSliders /> Filters
                                </button>
                                
                                <InventoryPremiumSelect 
                                    id="cars-sort-select"
                                    value={sort}
                                    onChange={(e) => updateFilter("sort", e.target.value)}
                                    options={[
                                        { value: "", label: "Sort: Default" },
                                        { value: "price", label: "Price: Low to High" },
                                        { value: "-price", label: "Price: High to Low" },
                                        { value: "-year", label: "Newest Arrivals" }
                                    ]}
                                />

                            </div>
                        </div>

                        {/* Results Wrapper (stable layout) */}
                        <div className="catalog-results-wrapper">
                            {loading && (
                                <div className="catalog-loading-overlay">
                                    <div className="spinner"></div>
                                    <p>Refining Selection...</p>
                                </div>
                            )}

                            {cars.length === 0 && !loading ? (
                                <div className="no-cars-found">
                                    <h3>No Automobiles Found</h3>
                                    <p>Try clearing or modifying your filter parameters.</p>
                                    <button className="gold-btn" onClick={handleClearFilters}>
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className={`catalog-results-content ${loading ? "loading-fade" : ""}`}>
                                    {/* Grid */}
                                    <div className="catalog-grid">
                                        {cars.map((car) => (
                                            <HoverTrackerCard variant="car" key={car._id}>
                                                <Link to={`/cars/${car._id}`} className="car-card">
                                                    <div className="car-image">
                                                        <img src={getImageUrl(car.images[0])} alt={car.name} />
                                                        <div className="car-overlay">
                                                            <span className="view-btn">
                                                                View Details
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="car-content">
                                                        <div className="car-brand-name">
                                                            {car.brandId ? car.brandId.name : "Exclusive"}
                                                        </div>
                                                        <h3>{car.name}</h3>
                                                        <div className="car-price">
                                                            {car.priceOnCall ? "Price On Call" : formatPrice(car.price)}
                                                        </div>

                                                        <div className="car-meta">
                                                            <span>
                                                                <FiCalendar className="meta-icon" />
                                                                {car.year}
                                                            </span>
                                                            <div className="meta-divider"></div>
                                                            <span>
                                                                <PiGaugeBold className="meta-icon" />
                                                                {car.mileage === 0 ? "New" : `${car.mileage.toLocaleString()} km`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </HoverTrackerCard>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="catalog-pagination">
                                            <button 
                                                disabled={page === 1}
                                                onClick={() => updateFilter("page", page - 1)}
                                                className="pag-btn"
                                            >
                                                <FiArrowLeft /> Prev
                                            </button>
                                            <span className="pag-info">
                                                Page {page} of {totalPages}
                                            </span>
                                            <button 
                                                disabled={page === totalPages}
                                                onClick={() => updateFilter("page", page + 1)}
                                                className="pag-btn"
                                            >
                                                Next <FiArrowRight />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            {showMobileFilters && (
                <div 
                    className="filters-backdrop" 
                    onClick={() => setShowMobileFilters(false)}
                ></div>
            )}

            <Footer />
        </motion.div>

    );
}

export default Cars;