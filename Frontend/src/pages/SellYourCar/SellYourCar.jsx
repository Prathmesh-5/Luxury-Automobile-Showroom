import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { sellCarsApi, uploadApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiUser, FiMail, FiPhone, FiInfo, FiCamera, FiCheckCircle, FiX } from "react-icons/fi";
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
    
    // Unified image state: each item is { file: File, id: string, previewUrl: string }
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Limit total images to 10
        if (images.length + files.length > 10) {
            toast.error("You can upload a maximum of 10 vehicle images.");
            return;
        }

        const validImages = [];
        for (let file of files) {
            // File size validation (10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} exceeds the 10MB limit.`);
                continue;
            }
            // File type validation (images only)
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not a valid image format.`);
                continue;
            }

            validImages.push({
                file,
                id: Math.random().toString(36).substring(2, 9),
                previewUrl: URL.createObjectURL(file)
            });
        }

        setImages(prev => [...prev, ...validImages]);
    };

    const handleDeleteImage = (id) => {
        setImages(prev => {
            const item = prev.find(img => img.id === id);
            if (item && item.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
            return prev.filter(img => img.id !== id);
        });
    };

    // HTML5 Drag and Drop handlers
    const handleDragStart = (e, index) => {
        e.dataTransfer.setData("text/plain", index);
        e.currentTarget.classList.add("dragging");
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove("dragging");
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (sourceIndex === targetIndex) return;

        setImages(prev => {
            const reordered = [...prev];
            const [movedItem] = reordered.splice(sourceIndex, 1);
            reordered.splice(targetIndex, 0, movedItem);
            return reordered;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        
        try {
            let uploadedImageUrls = [];
            
            // 1. Upload images if selected using dedicated public upload route
            if (images.length > 0) {
                toast.loading("Uploading vehicle images...", { id: "uploading" });
                const filesToUpload = images.map(img => img.file);
                uploadedImageUrls = await uploadApi.uploadPublicImages(filesToUpload);
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
            
            // Clean up Object URLs to prevent memory leaks
            images.forEach(img => {
                if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
            });

            setIsSuccess(true);
            toast.success("Vehicle valuation request submitted successfully!");

            // Reset form fields
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
            setImages([]);
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
                            <h3>Valuation Request Form</h3>
                        </div>

                        {isSuccess ? (
                            <div className="empty-crud-state" style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
                                <FiCheckCircle className="empty-icon" style={{ color: "#22c55e", fontSize: "48px" }} />
                                <h3>Valuation Submitted Successfully!</h3>
                                <p style={{ color: "#a1a1aa", fontSize: "14px", margin: 0, textAlign: "center" }}>
                                    Thank you for submitting your vehicle details. Our premium appraisal team will review your request and get in touch within 24 hours.
                                </p>
                                <button 
                                    onClick={() => setIsSuccess(false)}
                                    className="sell-submit-btn" 
                                    style={{ maxWidth: "200px", marginTop: "10px" }}
                                >
                                    Submit Another Car
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="sell-form">
                                {/* Contact Details */}
                                <div className="form-section-card">
                                    <h4 className="form-section-title">Customer Details</h4>
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
                                </div>

                                {/* Car Specifications */}
                                <div className="form-section-card">
                                    <h4 className="form-section-title">Car Specifications</h4>
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
                                </div>

                                {/* Image selector */}
                                <div className="form-section-card">
                                    <h4 className="form-section-title">Vehicle Images</h4>
                                    <div className="form-row upload-row">
                                        <label className="file-upload-card">
                                            <FiCamera className="upload-icon" />
                                            <span>Upload Car Photos</span>
                                            <p>PNG, JPG, or JPEG format (max 10MB each, up to 10 photos total)</p>
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*" 
                                                onChange={handleFileChange}
                                                className="hidden-file-input"
                                            />
                                        </label>
                                    </div>

                                    {/* Previews Grid with Drag & Drop ordering */}
                                    {images.length > 0 && (
                                        <div>
                                            <span style={{ fontSize: "11px", color: "#8a8a93", display: "block", marginBottom: "10px", fontStyle: "italic" }}>
                                                Tip: Click and drag photos to change their display order.
                                            </span>
                                            <div className="previews-grid">
                                                {images.map((img, index) => (
                                                    <div 
                                                        className="preview-card" 
                                                        key={img.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, index)}
                                                        onDragEnd={handleDragEnd}
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) => handleDrop(e, index)}
                                                    >
                                                        <img src={img.previewUrl} alt={`Preview ${index + 1}`} />
                                                        <button 
                                                            type="button" 
                                                            className="delete-preview-btn"
                                                            onClick={() => handleDeleteImage(img.id)}
                                                            title="Delete image"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="sell-submit-btn" disabled={submitting}>
                                    {submitting ? "Processing Request..." : "Request Free Valuation"}
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
}

export default SellYourCar;
