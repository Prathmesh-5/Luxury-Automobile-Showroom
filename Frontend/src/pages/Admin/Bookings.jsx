import { useState, useEffect } from "react";
import { testDrivesApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiMail, FiPhone, FiInbox, FiClock, FiCalendar } from "react-icons/fi";
import "./AdminCommon.css";

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const data = await testDrivesApi.getAll();
            setBookings(data || []);
        } catch (err) {
            console.error("Failed to load test drives bookings list:", err);
            toast.error("Bookings failed to load.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await testDrivesApi.updateStatus(id, newStatus);
            toast.success("Test drive booking status updated!");
            loadBookings();
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
                    <h1>Test Drives / Bookings</h1>
                    <p>Track showroom viewing and driving appointments.</p>
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Loading bookings index...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="empty-crud-state">
                    <FiInbox className="empty-icon" />
                    <h3>No Bookings Found</h3>
                    <p>Test drive reservations will appear here.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Preferred Time Slot</th>
                                <th>Customer Details</th>
                                <th>Reserved Car</th>
                                <th>Current Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>
                                        <span className="time-badge block font-gold">
                                            <FiCalendar /> {new Date(booking.preferredDate).toLocaleDateString()}
                                        </span>
                                        <span className="time-badge block" style={{ marginTop: "5px" }}>
                                            <FiClock /> {booking.preferredTime}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{booking.name}</strong>
                                        <span className="contact-sub-span"><FiMail /> {booking.email}</span>
                                        <span className="contact-sub-span"><FiPhone /> {booking.phone}</span>
                                    </td>
                                    <td>
                                        {booking.carId ? (
                                            <>
                                                <strong className="car-label-block">
                                                    {booking.carId.name} {booking.carId.model}
                                                </strong>
                                                <span className="car-price-sub">
                                                    {formatPrice(booking.carId.price)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="badge-status danger">Unspecified Car</span>
                                        )}
                                    </td>
                                    <td>
                                        <select 
                                            value={booking.status}
                                            onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                            className={`status-select-btn ${booking.status.toLowerCase()}`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
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

export default AdminBookings;
