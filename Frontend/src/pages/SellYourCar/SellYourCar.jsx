import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { sellCarsApi, uploadApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiUser, FiMail, FiPhone, FiInfo, FiCamera, FiCheckCircle } from "react-icons/fi";
import "./SellYourCar.css";

function SellYourCar() {
    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [carBrand, setCarBrand] = useState("");
    const [carModel, setCarModel] = useState("");
    const [carYear, setCarYear] = useState("");
    const [mileage, setMileage] = useState("");
    const [condition, setCondition] = useState("Used");
    const [price, setPrice] = useState("");
    const [message, setMessage] = useState("");
    
    // File upload states
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);

        // Generate image previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            let uploadedImageUrls = [];
            
            // 1. Upload images if selected
            if (selectedFiles.length > 0) {
                toast.loading("Uploading images...", { id: "uploading" });
                uploadedImageUrls = await uploadApi.uploadImages(selectedFiles);
                toast.success("Images uploaded successfully!", { id: "uploading" });
            }

            // 2. Submit sell request payload
            const payload = {
                name,
                email,
                phone,
                carBrand,
                carModel,
                carYear: parseInt(carYear),
                mileage: parseInt(mileage),
                condition,
                price: parseFloat(price),
                message,
                images: uploadedImageUrls
            };

            await sellCarsApi.create(payload);
            toast.success("Vehicle valuation request submitted! Our team will contact you in 24 hours.");
            
            // Reset form
            setName("");
            setEmail("");
            setPhone("");
            setCarBrand("");
            setCarModel("");
            setCarYear("");
            setMileage("");
            setCondition("Used");
            setPrice("");
            setMessage("");
            setSelectedFiles([]);
            setPreviews([]);
        } catch (err) {
            console.error("Valuation request failed:", err);
            toast.error(err.response?.data?.message || "Valuation submission failed.", { id: "uploading" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="sell-car-page">
            <Navbar />
            
            {/* Banner */}
            <div className="sell-banner">
                <div className="banner-overlay"></div>
                <div className="banner-content">
                    <h1>Sell Your Car</h1>
                    <p>Get an instant valuation and premium cash offer for your vehicle</p>
                </div>
            </div>

            {/* Core Section */}
            <section className="sell-section">
                <div className="sell-grid-container">
                    
                    {/* Left: Value proposition */}
                    <div className="sell-info-panel">
                        <h2>Why Sell to Apex?</h2>
                        <p>We provide a seamless, premium vehicle purchasing experience tailored to your convenience.</p>
                        
                        <div className="prop-list">
                            <div className="prop-item">
                                <FiCheckCircle className="prop-icon" />
                                <div className="prop-text">
                                    <h4>Instant Evaluation</h4>
                                    <p>Our appraisers calculate highly competitive valuations within 24 hours of submission.</p>
                                </div>
                            </div>
                            <div className="prop-item">
                                <FiCheckCircle className="prop-icon" />
                                <div className="prop-text">
                                    <h4>Immediate Bank Transfer</h4>
                                    <p>Get paid instantly via secure direct bank transfer as soon as sale contracts are finalized.</p>
                                </div>
                            </div>
                            <div className="prop-item">
                                <FiCheckCircle className="prop-icon" />
                                <div className="prop-text">
                                    <h4>Hassle-Free Inspection</h4>
                                    <p>We arrange a free physical vehicle inspection at our showroom or your preferred location.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Submission Form */}
                    <div className="sell-form-container">
                        <div className="form-header">
                            <FiInfo className="header-icon" />
                            <h3>Vehicle Information</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="sell-form">
                            {/* Contact Details */}
                            <div className="form-sub-header">Customer Details</div>
                            <div className="form-row">
                                <div className="form-group-icon">
                                    <FiUser className="input-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-row two-cols">
                                <div className="form-group-icon">
                                    <FiMail className="input-icon" />
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group-icon">
                                    <FiPhone className="input-icon" />
                                    <input 
                                        type="tel" 
                                        placeholder="Phone Number" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Car Specifications */}
                            <div className="form-sub-header">Car Specifications</div>
                            <div className="form-row two-cols">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Make (e.g. Porsche)" 
                                        value={carBrand}
                                        onChange={(e) => setCarBrand(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Model (e.g. 911 GT3)" 
                                        value={carModel}
                                        onChange={(e) => setCarModel(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-row three-cols">
                                <div className="form-group">
                                    <input 
                                        type="number" 
                                        placeholder="Year" 
                                        value={carYear}
                                        onChange={(e) => setCarYear(e.target.value)}
                                        required 
                                        min="1990"
                                        max="2027"
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="number" 
                                        placeholder="Mileage (Km)" 
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        required 
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <select 
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                        required
                                    >
                                        <option value="Used">Pre-Owned</option>
                                        <option value="New">New Model</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="number" 
                                        placeholder="Expected Price (INR)" 
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required 
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <textarea 
                                        placeholder="Additional Details (modifications, exterior color, service history...)" 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Image selector */}
                            <div className="form-sub-header">Vehicle Images</div>
                            <div className="form-row upload-row">
                                <label className="file-upload-card">
                                    <FiCamera className="upload-icon" />
                                    <span>Upload Car Photos</span>
                                    <p>Select multiple images</p>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="hidden-file-input"
                                    />
                                </label>
                            </div>

                            {/* Previews grid */}
                            {previews.length > 0 && (
                                <div className="previews-grid">
                                    {previews.map((src, index) => (
                                        <div className="preview-card" key={index}>
                                            <img src={src} alt={`Preview ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button type="submit" className="sell-submit-btn" disabled={submitting}>
                                {submitting ? "Processing Request..." : "Request Free Valuation"}
                            </button>
                        </form>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
}

export default SellYourCar;
