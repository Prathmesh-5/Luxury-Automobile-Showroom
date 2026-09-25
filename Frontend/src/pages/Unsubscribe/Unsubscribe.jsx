import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { newsletterApi } from "../../services/api";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { FiCheckCircle, FiAlertCircle, FiHome } from "react-icons/fi";
import "./Unsubscribe.css";

function Unsubscribe() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const processUnsubscribe = async () => {
            if (!token) {
                setLoading(false);
                setSuccess(false);
                setMessage("No unsubscribe token provided.");
                return;
            }

            try {
                setLoading(true);
                const res = await newsletterApi.unsubscribeToken(token);
                setSuccess(true);
                setMessage(res.message || "You have been successfully unsubscribed from our newsletter.");
            } catch (err) {
                setSuccess(false);
                setMessage(err.response?.data?.message || "Invalid or expired unsubscribe link.");
            } finally {
                setLoading(false);
            }
        };

        processUnsubscribe();
    }, [token]);

    return (
        <div className="unsubscribe-page">
            <Navbar />

            <div className="unsubscribe-container">
                <div className="unsubscribe-card">
                    {loading ? (
                        <div className="unsubscribe-state loading">
                            <div className="spinner"></div>
                            <h2>Processing Unsubscribe Request...</h2>
                            <p>Please wait while we update your preferences.</p>
                        </div>
                    ) : success ? (
                        <div className="unsubscribe-state success">
                            <FiCheckCircle className="state-icon success" />
                            <h2>Unsubscribed Successfully</h2>
                            <p>{message}</p>
                            <span className="subtext">
                                You will no longer receive newsletter updates from Apex Luxury Showroom.
                            </span>

                            <Link to="/" className="home-btn">
                                <FiHome /> Return to Showroom
                            </Link>
                        </div>
                    ) : (
                        <div className="unsubscribe-state error">
                            <FiAlertCircle className="state-icon error" />
                            <h2>Unsubscribe Failed</h2>
                            <p>{message}</p>
                            <span className="subtext">
                                If you reached this page by mistake, please check your unsubscribe link or contact support.
                            </span>

                            <Link to="/" className="home-btn">
                                <FiHome /> Return to Showroom
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Unsubscribe;
