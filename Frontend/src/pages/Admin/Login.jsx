import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiLock, FiMail } from "react-icons/fi";
import ForgotPasswordModal from "./ForgotPasswordModal";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    useEffect(() => {
        // If already logged in, redirect to dashboard
        const token = localStorage.getItem("admin_token");
        if (token) {
            navigate("/admin/dashboard");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.login(email, password);
            toast.success("Welcome back! Login successful.");
            navigate("/admin/dashboard");
        } catch (err) {
            console.error("Login failure:", err);
            toast.error(err.response?.data?.message || "Invalid Email or Password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-backdrop"></div>
            <div className="login-card-container">
                <div className="login-card-header">
                    <h2>APEX SHOWROOM</h2>
                    <span>Administration Login</span>
                </div>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="login-field-group">
                        <FiMail className="login-field-icon" />
                        <input 
                            type="email" 
                            placeholder="Admin Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="login-field-group">
                        <FiLock className="login-field-icon" />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="forgot-password-link-container">
                        <button 
                            type="button" 
                            className="forgot-password-trigger"
                            onClick={() => setShowForgotModal(true)}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? "Authenticating..." : "Login to Control Panel"}
                    </button>
                </form>

                <div className="login-card-footer">
                    <a href="/">&larr; Return to Main Showroom Website</a>
                </div>
            </div>

            <ForgotPasswordModal 
                isOpen={showForgotModal} 
                onClose={() => setShowForgotModal(false)} 
            />
        </div>
    );
}

export default Login;
