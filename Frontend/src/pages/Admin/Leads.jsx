import { useState, useEffect } from "react";
import { leadsApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiMail, FiPhone, FiInbox, FiClock } from "react-icons/fi";
import "./AdminCommon.css";

function AdminLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadLeads = async () => {
        setLoading(true);
        try {
            const data = await leadsApi.getAll();
            setLeads(data || []);
        } catch (err) {
            console.error("Failed to load leads list:", err);
            toast.error("Enquiries failed to load.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeads();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await leadsApi.updateStatus(id, newStatus);
            toast.success("Enquiry status updated!");
            loadLeads();
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Status update failed.");
        }
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
                    <h1>Leads & Enquiries</h1>
                    <p>Track, manage, and close incoming customer queries.</p>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Loading enquiries index...</p>
                </div>
            ) : leads.length === 0 ? (
                <div className="empty-crud-state">
                    <FiInbox className="empty-icon" />
                    <h3>No Enquiries Found</h3>
                    <p>Customer interest submissions will appear here.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Received Time</th>
                                <th>Contact Information</th>
                                <th>Associated Vehicle</th>
                                <th>Message / Inquiry Details</th>
                                <th>Status Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr key={lead._id}>
                                    <td>
                                        <span className="time-badge">
                                            <FiClock /> {new Date(lead.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{lead.name}</strong>
                                        <span className="contact-sub-span"><FiMail /> {lead.email}</span>
                                        <span className="contact-sub-span"><FiPhone /> {lead.phone}</span>
                                    </td>
                                    <td>
                                        {lead.carId ? (
                                            <>
                                                <strong className="car-label-block">
                                                    {lead.carId.name} {lead.carId.model}
                                                </strong>
                                                <span className="car-price-sub">
                                                    {formatPrice(lead.carId.price)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="badge-status danger">General Inquiry</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="message-content-box">
                                            {lead.message || "No comments provided."}
                                        </div>
                                    </td>
                                    <td>
                                        <select 
                                            value={lead.status}
                                            onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                            className={`status-select-btn ${lead.status.toLowerCase()}`}
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
        </div>
    );
}

export default AdminLeads;
