import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { carsApi, testDrivesApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiInbox, FiAlertCircle } from "react-icons/fi";
import "./TestDrive.css";
import PremiumSelect from "../Admin/PremiumSelect";

function TestDrive() {
    const [searchParams] = useSearchParams();
    const preselectedCarId = searchParams.get("carId") || "";

    // Data States
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form States
    const [carId, setCarId] = useState(preselectedCarId);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Fetch all cars for select dropdown
    useEffect(() => {
        const loadCars = async () => {
            try {
                const res = await carsApi.getAll({ limit: 100 });
                setCars(res.data || []);
                // If there's a preselected car, set it
                if (preselectedCarId) {
                    setCarId(preselectedCarId);
                } 
                //else if (res.data && res.data.length > 0) {
                    //setCarId(res.data[0]._id);}
            } catch (err) {
                console.error("Failed to load cars list for booking:", err);
            } finally {
                setLoading(false);
            }
        };
        loadCars();
    }, [preselectedCarId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!carId) {
            toast.error("Please select a vehicle model.");
            return;
        }

        // Find selected car to check status
        const selectedCar = cars.find(c => c._id === carId);
        if (selectedCar && selectedCar.status === "Sold") {
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

        setSubmitting(true);
        try {
            await testDrivesApi.create({
                carId,
                name,
                email,
                phone,
                preferredDate: date,
                preferredTime: timeSlot
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
            setName("");
            setEmail("");
            setPhone("");
            setDate("");
            setTimeSlot("");
        } catch (err) {
            console.error("Booking error:", err);
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
            setSubmitting(false);
        }
    };

    return (
        <div className="test-drive-page">
            <Navbar />
            
            {/* Banner */}
            <div className="booking-banner">
                <div className="banner-overlay"></div>
                <div className="banner-content">
                    <h1>Schedule a Test Drive</h1>
                    <p>Experience extreme engineering first-hand on Sheikh Zayed Road</p>
                </div>
            </div>

            {/* Form Section */}
            <section className="booking-section">
                <div className="booking-container-card">
                    {loading ? (
                        <div className="catalog-loading">
                            <div className="spinner"></div>
                            <p>Loading vehicle registry...</p>
                        </div>
                    ) : cars.length === 0 ? (
                        <div className="no-cars-state">
                            <FiInbox className="help-icon" />
                            <h3>No vehicles available for booking at the showroom.</h3>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="booking-form-full">
                            <div className="booking-form-title">
                                <h2>Request an Appointment</h2>
                                <p>Fill in the specifications below, and our advisors will reserve your vehicle slot.</p>
                            </div>

                            <div className="form-sections-layout">
                                {/* Left Side: Customer details */}
                                <div className="form-column">
                                    <h3>1. Contact Information</h3>
                                    
                                    <div className="form-group-field">
                                        <label>Full Name</label>
                                        <div className="icon-input-container">
                                            <FiUser className="field-icon" />
                                            <input 
                                                type="text" 
                                                placeholder="Enter full name" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-field">
                                        <label>Email Address</label>
                                        <div className="icon-input-container">
                                            <FiMail className="field-icon" />
                                            <input 
                                                type="email" 
                                                placeholder="Enter email address" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-field">
                                        <label>Phone Number</label>
                                        <div className="icon-input-container">
                                            <FiPhone className="field-icon" />
                                            <input 
                                                type="tel" 
                                                placeholder="Enter phone number" 
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Car & Time Details */}
                                <div className="form-column">
                                    <h3>2. Driving Preference</h3>
                                    
                                    <div className="form-group-field">
                                        <label>Select Vehicle Model</label>
                                        
                                        <PremiumSelect
                                        id="testdrive-car"
                                        value={carId}
                                        onChange={(e) => setCarId(e.target.value)}
                                        options={[
                                            { value: "", label: "Choose a Vehicle" },
                                            ...cars.map((c) => ({
                                                value: c._id,
                                                label: `${c.brandId?.name || ""} ${c.name} (${c.year})`,
                                            })),
                                        ]}
                                        />
                                    </div>

                                    <div className="form-group-field">
                                        <label>Preferred Date</label>
                                        <div className="icon-input-container">
                                            <FiCalendar className="field-icon" />
                                            <input 
                                                type="date" 
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-field">
    <label>Time Slot</label>

    <PremiumSelect
        id="testdrive-time"
        value={timeSlot}
        onChange={(e) => setTimeSlot(e.target.value)}
        icon={<FiClock />}
        options={[
            { value: "", label: "Select Time Slot" },
            { value: "10:00 AM - 12:00 PM", label: "10:00 AM - 12:00 PM" },
            { value: "12:00 PM - 02:00 PM", label: "12:00 PM - 02:00 PM" },
            { value: "02:00 PM - 04:00 PM", label: "02:00 PM - 04:00 PM" },
            { value: "04:00 PM - 06:00 PM", label: "04:00 PM - 06:00 PM" },
            { value: "06:00 PM - 08:00 PM", label: "06:00 PM - 08:00 PM" },
        ]}
    />
</div>
                                </div>
                            </div>

                            <button type="submit" className="booking-submit-btn" disabled={submitting}>
                                {submitting ? "Booking Vehicle Slot..." : "Request Appointment"}
                            </button>
                        </form>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default TestDrive;