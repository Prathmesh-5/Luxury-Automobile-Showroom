import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { carsApi, leadsApi, testDrivesApi } from "../../services/api";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { toast } from "react-hot-toast";
import { 
    FiCalendar, FiCompass, FiCpu, FiCompass as FiGear, FiDroplet, 
    FiPhoneCall, FiMail, FiCalendar as FiBooking, FiClock, FiMessageSquare,
    FiAlertCircle
} from "react-icons/fi";
import { PiGaugeBold } from "react-icons/pi";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import "./CarDetails.css";


function CarDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data States
    const [car, setCar] = useState(null);
    const [similarCars, setSimilarCars] = useState([]);
    const [activeImage, setActiveImage] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Lightbox States
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Form States
    const [leadName, setLeadName] = useState("");
    const [leadEmail, setLeadEmail] = useState("");
    const [leadPhone, setLeadPhone] = useState("");
    const [leadMessage, setLeadMessage] = useState("");
    const [submittingLead, setSubmittingLead] = useState(false);

    const [bookingName, setBookingName] = useState("");
    const [bookingEmail, setBookingEmail] = useState("");
    const [bookingPhone, setBookingPhone] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [submittingBooking, setSubmittingBooking] = useState(false);

    useEffect(() => {
        const loadCarData = async () => {
            setLoading(true);
            try {
                const data = await carsApi.getById(id);
                setCar(data);
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0]);
                }
                
                // Fetch similar cars
                const similar = await carsApi.getSimilar(id);
                setSimilarCars(similar || []);
            } catch (err) {
                console.error("Failed to load car details:", err);
                toast.error("Automobile details could not be loaded.");
                navigate("/cars");
            } finally {
                setLoading(false);
            }
        };
        loadCarData();
    }, [id, navigate]);

    // Keyboard navigation for Lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showLightbox || !car || !car.images || car.images.length === 0) return;
            if (e.key === "ArrowRight") {
                setLightboxIndex((prev) => (prev + 1) % car.images.length);
            } else if (e.key === "ArrowLeft") {
                setLightboxIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
            } else if (e.key === "Escape") {
                setShowLightbox(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showLightbox, car]);

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

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        setSubmittingLead(true);
        try {
            await leadsApi.create({
                carId: car._id,
                name: leadName,
                email: leadEmail,
                phone: leadPhone,
                message: leadMessage
            });
            toast.success("Inquiry submitted successfully! A sales manager will contact you soon.");
            setLeadName("");
            setLeadEmail("");
            setLeadPhone("");
            setLeadMessage("");
        } catch (err) {
            console.error("Failed to submit inquiry:", err);
            toast.error(err.response?.data?.message || "Enquiry submission failed.");
        } finally {
            setSubmittingLead(false);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (car && car.status === "Sold") {
            toast(
                "This vehicle is currently unavailable. Please submit an enquiry below or explore our other premium models.",
                {
                    duration: 6000,
                    position: "top-right",
                    style: {
                        background: "#0D0D0D",
                        color: "#fff",
                        border: "1px solid #d4af37",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontFamily: "'Outfit', sans-serif",
                        padding: "16px 20px",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                    },
                    icon: <FiAlertCircle style={{ color: "#d4af37", fontSize: "20px", flexShrink: 0 }} />
                }
            );
            return;
        }

        setSubmittingBooking(true);
        try {
            await testDrivesApi.create({
                carId: car._id,
                name: bookingName,
                email: bookingEmail,
                phone: bookingPhone,
                preferredDate: bookingDate,
                preferredTime: bookingTime
            });
            toast.success(
                "Appointment Booked! Our team will contact you shortly to confirm your test drive.",
                {
                    duration: 6000,
                    position: "top-right",
                    style: {
                        background: "#0D0D0D",
                        color: "#fff",
                        border: "1px solid #d4af37",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontFamily: "'Outfit', sans-serif",
                        padding: "16px 20px",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                    },
                    iconTheme: {
                        primary: "#d4af37",
                        secondary: "#0D0D0D",
                    }
                }
            );
            setBookingName("");
            setBookingEmail("");
            setBookingPhone("");
            setBookingDate("");
            setBookingTime("");
        } catch (err) {
            console.error("Failed to book test drive:", err);
            toast.error(err.response?.data?.message || "Booking submission failed.", {
                style: {
                    background: "#0D0D0D",
                    color: "#fff",
                    border: "1px solid #ef4444",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: "'Outfit', sans-serif",
                    padding: "16px 20px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                }
            });
        } finally {
            setSubmittingBooking(false);
        }
    };

    if (loading) {
        return (
            <motion.div 
                className="details-loading-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                <Navbar />
                <div className="catalog-loading">
                    <div className="spinner"></div>
                    <p>Fetching Vehicle Profile...</p>
                </div>
                <Footer />
            </motion.div>
        );
    }

    if (!car) return null;

    const waText = encodeURIComponent(`Hi, I'm interested in the ${car.brandId?.name || ""} ${car.name} (Year: ${car.year}). Can you provide more details?`);
    const waUrl = `https://wa.me/97140000000?text=${waText}`;

    return (
        <motion.div 
            className="car-details-page"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
        >
            <Navbar />
            
            <section className="details-hero">
                <div className="details-container">
                    
                    {/* Back to Inventory */}
                    <div className="back-link-container">
                        <Link to="/cars" className="back-link">
                            &larr; Back to Inventory
                        </Link>
                    </div>

                    {/* Titles */}
                    <div className="details-header">
                        <div className="brand-badge">{car.brandId?.name || "Premium"}</div>
                        <h1>{car.name}</h1>
                        <div className="price-tag">
                            {car.priceOnCall ? "Price On Call" : formatPrice(car.price)}
                        </div>
                    </div>

                    <div className="details-grid">
                        
                        {/* Left: Media Gallery */}
                        <div className="gallery-section">
                            <div 
                                className="main-display-img" 
                                onClick={() => {
                                    const idx = car.images.indexOf(activeImage);
                                    setLightboxIndex(idx >= 0 ? idx : 0);
                                    setShowLightbox(true);
                                }}
                                style={{ cursor: "zoom-in" }}
                            >
                                <img src={getImageUrl(activeImage)} alt={car.name} />
                            </div>
                            
                            {car.images && car.images.length > 1 && (
                                <div className="thumbnails-grid">
                                    {car.images.slice(0, 5).map((img, index) => {
                                        const isLast = index === 4 && car.images.length > 5;
                                        const remainingCount = car.images.length - 4;
                                        
                                        return (
                                            <div 
                                                key={index} 
                                                className={`thumb-card ${activeImage === img ? "active" : ""} ${isLast ? "has-overlay" : ""}`}
                                                onClick={() => {
                                                    if (isLast) {
                                                        setLightboxIndex(4);
                                                        setShowLightbox(true);
                                                    } else {
                                                        setActiveImage(img);
                                                    }
                                                }}
                                            >
                                                <img src={getImageUrl(img)} alt={`Thumbnail ${index + 1}`} />
                                                {isLast && (
                                                    <div className="thumb-more-overlay">
                                                        <span>+{remainingCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right: Info & Actions */}
                        <div className="details-actions-panel">
                            
                            {/* Key Features Quick Specs */}
                            <div className="quick-specs-box">
                                <h3>Technical Specifications</h3>
                                <div className="specs-grid">
                                    <div className="spec-card">
                                        <FiCalendar className="spec-icon" />
                                        <div className="spec-info">
                                            <span>Year</span>
                                            <strong>{car.year}</strong>
                                        </div>
                                    </div>
                                    <div className="spec-card">
                                        <PiGaugeBold className="spec-icon" />
                                        <div className="spec-info">
                                            <span>Mileage</span>
                                            <strong>{car.mileage === 0 ? "New" : `${car.mileage.toLocaleString()} km`}</strong>
                                        </div>
                                    </div>
                                    <div className="spec-card">
                                        <FiCpu className="spec-icon" />
                                        <div className="spec-info">
                                            <span>Engine</span>
                                            <strong>{car.engine || "Unspecified"}</strong>
                                        </div>
                                    </div>
                                    <div className="spec-card">
                                        <FiGear className="spec-icon" />
                                        <div className="spec-info">
                                            <span>Gearbox</span>
                                            <strong>{car.transmission || "Automatic"}</strong>
                                        </div>
                                    </div>
                                    <div className="spec-card">
                                        <FiDroplet className="spec-icon" />
                                        <div className="spec-info">
                                            <span>Fuel Type</span>
                                            <strong>{car.fuelType || "Petrol"}</strong>
                                        </div>
                                    </div>
                                    <div className="spec-card">
                                        <FiCompass className="spec-icon" />
                                        <div className="spec-info">
                                            <span>Condition</span>
                                            <strong>{car.condition}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp Call to Action */}
                            <a href={waUrl} target="_blank" rel="noreferrer" className="whatsapp-cta-btn">
                                <FaWhatsapp className="btn-icon" /> Chat on WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Forms Section */}
                    <div className="forms-section-grid">
                        
                        {/* Form 1: General Inquiry */}
                        <div className="form-card-container">
                            <div className="form-card-header">
                                <FiMessageSquare className="form-title-icon" />
                                <h3>Send Enquiry</h3>
                            </div>
                            <form className="details-form" onSubmit={handleLeadSubmit}>
                                <div className="form-field">
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        value={leadName}
                                        onChange={(e) => setLeadName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-field">
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        value={leadEmail}
                                        onChange={(e) => setLeadEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-field">
                                    <input 
                                        type="tel" 
                                        placeholder="Phone Number" 
                                        value={leadPhone}
                                        onChange={(e) => setLeadPhone(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-field">
                                    <textarea 
                                        placeholder="Your Message" 
                                        value={leadMessage}
                                        onChange={(e) => setLeadMessage(e.target.value)}
                                        rows="4"
                                    ></textarea>
                                </div>
                                <button type="submit" className="form-submit-btn" disabled={submittingLead}>
                                    {submittingLead ? "Sending..." : "Submit Enquiry"}
                                </button>
                            </form>
                        </div>

                        {/* Form 2: Test Drive Booking */}
                        <div className="form-card-container">
                            <div className="form-card-header">
                                <FiBooking className="form-title-icon" />
                                <h3>Book Test Drive</h3>
                            </div>
                            <form className="details-form" onSubmit={handleBookingSubmit}>
                                <div className="form-field">
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        value={bookingName}
                                        onChange={(e) => setBookingName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-field">
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        value={bookingEmail}
                                        onChange={(e) => setBookingEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-field">
                                    <input 
                                        type="tel" 
                                        placeholder="Phone Number" 
                                        value={bookingPhone}
                                        onChange={(e) => setBookingPhone(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-fields-row">
                                    <div className="form-field half">
                                        <input 
                                            type="date" 
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="form-field half">
                                        <select 
                                            value={bookingTime}
                                            onChange={(e) => setBookingTime(e.target.value)}
                                            required
                                        >
                                            <option value="">Time Slot</option>
                                            <option value="10:00 AM - 12:00 PM">10 AM - 12 PM</option>
                                            <option value="12:00 PM - 02:00 PM">12 PM - 2 PM</option>
                                            <option value="02:00 PM - 04:00 PM">2 PM - 4 PM</option>
                                            <option value="04:00 PM - 06:00 PM">4 PM - 6 PM</option>
                                            <option value="06:00 PM - 08:00 PM">6 PM - 8 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="form-submit-btn gold" disabled={submittingBooking}>
                                    {submittingBooking ? "Booking..." : "Book Appointment"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Similar Collection */}
                    {similarCars.length > 0 && (
                        <div className="similar-vehicles-section">
                            <h2>Similar Collections</h2>
                            <div className="similar-grid">
                                {similarCars.map((sCar) => (
                                    <Link to={`/cars/${sCar._id}`} className="similar-card" key={sCar._id}>
                                        <div className="similar-image">
                                            <img src={getImageUrl(sCar.images[0])} alt={sCar.name} />
                                        </div>
                                        <div className="similar-content">
                                            <h4>{sCar.name}</h4>
                                            <p>{sCar.priceOnCall ? "Price On Call" : formatPrice(sCar.price)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />

            {/* Full-Screen Photo Lightbox */}
            {showLightbox && car.images && (
                <div className="fullscreen-lightbox-backdrop" onClick={() => setShowLightbox(false)}>
                    <button className="lightbox-close-x" onClick={() => setShowLightbox(false)}>
                        &times;
                    </button>
                    
                    <button 
                        className="lightbox-nav-btn prev" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
                        }}
                    >
                        &#10094;
                    </button>

                    <div className="lightbox-image-container" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={getImageUrl(car.images[lightboxIndex])} 
                            alt={`Enlarged view ${lightboxIndex + 1}`} 
                        />
                        <div className="lightbox-counter">
                            Image {lightboxIndex + 1} of {car.images.length}
                        </div>
                    </div>

                    <button 
                        className="lightbox-nav-btn next" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev + 1) % car.images.length);
                        }}
                    >
                        &#10095;
                    </button>
                </div>
            )}
        </motion.div>
    );
}

export default CarDetails;