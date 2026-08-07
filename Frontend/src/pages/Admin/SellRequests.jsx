import { useState, useEffect } from "react";
import { sellCarsApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiMail, FiPhone, FiInbox, FiClock, FiEye, FiCheck } from "react-icons/fi";
import "./AdminCommon.css";

function AdminSellRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Image lightbox modal state
    const [lightboxImg, setLightboxImg] = useState("");

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await sellCarsApi.getAll();
            setRequests(data || []);
        } catch (err) {
            console.error("Failed to load sell requests:", err);
            toast.error("Valuation offers failed to load.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await sellCarsApi.updateStatus(id, newStatus);
            toast.success("Submission status updated!");
            loadRequests();
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Status update failed.");
        }
    };

    const getImageUrl = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100";
        if (img.startsWith("http")) return img;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${img}`;
    };

    const formatPrice = (p) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(p);
    };

    return (
        <div className="admin-crud-panel">
            <div className="crud-header">
                <div>
                    <h1>Valuation / Sell Requests</h1>
                    <p>Track offers from customers requesting vehicle sell quotes.</p>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Loading offers index...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="empty-crud-state">
                    <FiInbox className="empty-icon" />
                    <h3>No Valuation Requests</h3>
                    <p>Client sell offers will appear here once submitted.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Submitted Time</th>
                                <th>Client Details</th>
                                <th>Vehicle Details</th>
                                <th>Customer Notes</th>
                                <th>Photos</th>
                                <th>Status Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req._id}>
                                    <td>
                                        <span className="time-badge">
                                            <FiClock /> {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{req.name}</strong>
                                        <span className="contact-sub-span"><FiMail /> {req.email}</span>
                                        <span className="contact-sub-span"><FiPhone /> {req.phone}</span>
                                    </td>
                                    <td>
                                        <strong className="car-label-block">{req.carBrand} {req.carModel}</strong>
                                        <span className="spec-tag-sub">{req.carYear} | {req.condition} | {req.mileage.toLocaleString()} km</span>
                                        <span className="car-price-sub" style={{ marginTop: "5px" }}>
                                            Expected: {formatPrice(req.price)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="message-content-box">
                                            {req.message || "No notes."}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="gallery-mini-thumbs">
                                            {req.images && req.images.length > 0 ? (
                                                req.images.map((img, i) => (
                                                    <div 
                                                        className="thumb-wrapper" 
                                                        key={i}
                                                        onClick={() => setLightboxImg(getImageUrl(img))}
                                                    >
                                                        <img src={getImageUrl(img)} alt="Offer photo" />
                                                        <div className="overlay"><FiEye /></div>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="badge-status danger">No Photos</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <select 
                                            value={req.status}
                                            onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                            className={`status-select-btn ${req.status.toLowerCase()}`}
                                        >
                                            <option value="New">New</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Image Lightbox Modal */}
            {lightboxImg && (
                <div className="lightbox-backdrop" onClick={() => setLightboxImg("")}>
                    <div className="lightbox-content">
                        <img src={lightboxImg} alt="Enlarged preview" />
                        <button className="lightbox-close" onClick={() => setLightboxImg("")}>&times;</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSellRequests;
