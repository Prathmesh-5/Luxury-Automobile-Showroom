import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { carsApi } from "../../services/api";
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import { PiGaugeBold } from "react-icons/pi";
import HoverTrackerCard from "../Hero/HoverTrackerCard";
import "./FeaturedCars.css";

function FeaturedCars() {
    const [featuredCars, setFeaturedCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch with featured filter
                const res = await carsApi.getAll({ featured: true, limit: 3 });
                setFeaturedCars(res.data || []);
            } catch (err) {
                console.error("Error fetching featured cars:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const getImageUrl = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800";
        if (img.startsWith("http")) return img;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${img}`;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="featured-loading">
                <div className="spinner"></div>
                <p>Loading Exclusive Collection...</p>
            </div>
        );
    }

    return (
        <section className="featured">
            <div className="section-title">
                <p>PREMIUM COLLECTION</p>
                <h2>Featured Cars</h2>
            </div>

            <div className="cars-grid">
                {featuredCars.map((car) => (
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

            <div className="view-all-container">
                <Link to="/cars" className="gold-btn">
                    View Full Inventory
                    <FiArrowRight />
                </Link>
            </div>
        </section>
    );
}

export default FeaturedCars;