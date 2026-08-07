import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { leadsApi, carsApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend } from "react-icons/fi";
import "./Contact.css";

function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [defaultCarId, setDefaultCarId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Fetch a default car ID to satisfy schema required:true constraint
    useEffect(() => {
        const loadDefaultCar = async () => {
            try {
                const res = await carsApi.getAll({ limit: 1 });
                if (res.data && res.data.length > 0) {
                    setDefaultCarId(res.data[0]._id);
                }
            } catch (err) {
                console.error("Failed to load default car for contact:", err);
            }
        };
        loadDefaultCar();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!defaultCarId) {
            toast.error("Showroom registry loading. Please try again in a moment.");
            return;
        }
        
        setSubmitting(true);
        try {
            await leadsApi.create({
                carId: defaultCarId,
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

    return (
        <div className="contact-page">
            <Navbar />
            
            {/* Banner */}
            <div className="contact-banner">
                <div className="banner-overlay"></div>
                <div className="banner-content">
                    <h1>Contact Us</h1>
                    <p>Connect with our expert advisors for bespoke automobile services</p>
                </div>
            </div>

            {/* Core Section */}
            <section className="contact-section">
                <div className="contact-grid-container">
                    
                    {/* Left: Contact Info cards */}
                    <div className="contact-info-panel">
                        <h2>Get In Touch</h2>
                        <p>Have a question about our inventory, shipping, or trade-in evaluations? Feel free to contact our showroom advisors.</p>
                        
                        <div className="info-cards-stack">
                            <div className="info-item-card">
                                <FiMapPin className="info-card-icon" />
                                <div className="info-card-text">
                                    <h4>Visit Showroom</h4>
                                    <p>Sheikh Zayed Road, Al Quoz 3, Dubai, United Arab Emirates</p>
                                </div>
                            </div>
                            
                            <div className="info-item-row">
                                <div className="info-item-card">
                                    <FiPhone className="info-card-icon" />
                                    <div className="info-card-text">
                                        <h4>Call Showroom</h4>
                                        <p>+971 4 000 0000</p>
                                    </div>
                                </div>
                                <div className="info-item-card">
                                    <FiMail className="info-card-icon" />
                                    <div className="info-card-text">
                                        <h4>Email Support</h4>
                                        <p>info@apexluxury.ae</p>
                                    </div>
                                </div>
                            </div>

                            <div className="info-item-card">
                                <FiClock className="info-card-icon" />
                                <div className="info-card-text">
                                    <h4>Showroom Timings</h4>
                                    <p>Monday - Saturday: 9:00 AM - 9:00 PM</p>
                                    <p>Sunday: 2:00 PM - 8:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="contact-form-card">
                        <h3>Send a Message</h3>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-field-group">
                                <input 
                                    type="text" 
                                    placeholder="Your Name" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-field-group">
                                <input 
                                    type="email" 
                                    placeholder="Email Address" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-field-group">
                                <input 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-field-group">
                                <textarea 
                                    placeholder="How can we assist you?" 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows="5"
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="contact-submit-btn" disabled={submitting}>
                                {submitting ? "Sending..." : <>Send Message <FiSend className="btn-icon-right" /></>}
                            </button>
                        </form>
                    </div>

                </div>
            </section>

            {/* Embedded Google Maps Placeholder */}
            <section className="maps-section">
                <div className="map-frame-container">
                    <iframe 
                        title="Showroom Location Map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115546.61111666874!2d55.20786968037107!3d25.17478648348873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43348a6d49bb%3A0x3b0779d71c4c1a40!2sSheikh%20Zayed%20Rd%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                        width="100%" 
                        height="450" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Contact;