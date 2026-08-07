import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { authApi } from "../../services/api";
import { toast } from "react-hot-toast";
import "./ResetPassword.css";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [verifying, setVerifying] = useState(true);
    const [tokenError, setTokenError] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Live validation states
    const [rules, setRules] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });
    const [strength, setStrength] = useState({ score: 0, text: "Very Weak", color: "#ef4444" });

    // Verify token on load
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setTokenError("Invalid password reset link.");
                setVerifying(false);
                return;
            }
            try {
                await authApi.validateResetToken(token);
                setVerifying(false);
            } catch (err) {
                console.error("Token verification failed:", err);
                const errMsg = err.response?.data?.message || "Invalid password reset link.";
                setTokenError(errMsg);
                setVerifying(false);
            }
        };
        verifyToken();
    }, [token]);

    useEffect(() => {
        // Enforce live rules verification
        const length = password.length >= 8;
        const uppercase = /[A-Z]/.test(password);
        const lowercase = /[a-z]/.test(password);
        const number = /[0-9]/.test(password);
        const special = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password);

        setRules({ length, uppercase, lowercase, number, special });

        // Calculate password strength score (0 to 5)
        let score = 0;
        if (password.length > 0) {
            if (length) score += 1;
            if (uppercase) score += 1;
            if (lowercase) score += 1;
            if (number) score += 1;
            if (special) score += 1;
        }

        let text = "Too Short";
        let color = "#ef4444"; // Red

        if (password.length > 0) {
            if (score <= 2) {
                text = "Weak";
                color = "#f97316"; // Orange
            } else if (score === 3 || score === 4) {
                text = "Fair";
                color = "#eab308"; // Yellow
            } else if (score === 5) {
                text = "Strong";
                color = "#10b981"; // Green
            }
        }

        setStrength({ score, text, color });
    }, [password]);

    // Redirection effect after success
    useEffect(() => {
        if (success) {
            const timeoutId = setTimeout(() => {
                navigate("/admin/login");
            }, 3000); // Redirect after 3 seconds
            return () => clearTimeout(timeoutId);
        }
    }, [success, navigate]);

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        // Check if all rules are satisfied
        const allRulesMet = Object.values(rules).every((val) => val === true);
        if (!allRulesMet) {
            toast.error("Please satisfy all password strength requirements.");
            setSubmitError("Please satisfy all password strength requirements.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            setSubmitError("Passwords do not match.");
            return;
        }

        if (!token) {
            toast.error("Reset token is missing.");
            setSubmitError("Reset token is missing from the link. Please request a new link.");
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword(token, password);
            toast.success("Password updated successfully!");
            setSuccess(true);
        } catch (err) {
            console.error("Reset password submission failure:", err);
            const errMsg = err.response?.data?.message || "Invalid or expired token. Please request a new reset email.";
            toast.error(errMsg);
            setSubmitError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", duration: 0.6, bounce: 0.1 }
        }
    };

    if (verifying) {
        return (
            <div className="reset-password-page">
                <div className="reset-backdrop"></div>
                <div className="reset-card-container verification-loading">
                    <div className="reset-loading-spinner"></div>
                    <p>Securing connection & verifying link...</p>
                </div>
            </div>
        );
    }

    if (tokenError) {
        return (
            <div className="reset-password-page">
                <div className="reset-backdrop"></div>
                <motion.div 
                    className="reset-card-container"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="reset-success-screen token-error-screen">
                        <div className="error-icon-container">
                            <FiAlertTriangle className="error-box-icon token-error-icon" />
                        </div>
                        <h2>Reset Failed</h2>
                        <p className="token-error-message">{tokenError}</p>
                        
                        <button 
                            type="button" 
                            className="reset-success-btn error-btn"
                            onClick={() => navigate("/admin/login")}
                        >
                            Request New Link
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="reset-password-page">
            <div className="reset-backdrop"></div>
            
            <motion.div 
                className="reset-card-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {!success ? (
                    <>
                        <div className="reset-card-header">
                            <h2>APEX SHOWROOM</h2>
                            <span>Setup New Password</span>
                        </div>

                        {submitError && (
                            <div className="reset-error-box" role="alert">
                                <FiAlertTriangle className="error-box-icon" />
                                <span>{submitError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="reset-form">
                            {/* New Password field */}
                            <div className="reset-field-wrapper">
                                <label className="reset-label">New Password</label>
                                <div className="reset-field-group">
                                    <FiLock className="reset-field-icon" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="New Password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        disabled={loading}
                                    />
                                    <button 
                                        type="button" 
                                        className="reset-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Strength Meter */}
                            {password.length > 0 && (
                                <div className="strength-meter-container">
                                    <div className="strength-meter-header">
                                        <span>Strength: <strong>{strength.text}</strong></span>
                                    </div>
                                    <div className="strength-bar-wrapper">
                                        {[1, 2, 3, 4, 5].map((index) => (
                                            <div 
                                                key={index} 
                                                className="strength-bar-segment"
                                                style={{
                                                    backgroundColor: index <= strength.score ? strength.color : "rgba(255, 255, 255, 0.08)"
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Live Requirements List */}
                            <div className="requirements-list">
                                <div className={`requirement-item ${rules.length ? "met" : ""}`}>
                                    {rules.length ? <FiCheck className="req-icon text-success" /> : <FiX className="req-icon text-error" />}
                                    <span>At least 8 characters</span>
                                </div>
                                <div className={`requirement-item ${rules.uppercase ? "met" : ""}`}>
                                    {rules.uppercase ? <FiCheck className="req-icon text-success" /> : <FiX className="req-icon text-error" />}
                                    <span>One uppercase letter (A-Z)</span>
                                </div>
                                <div className={`requirement-item ${rules.lowercase ? "met" : ""}`}>
                                    {rules.lowercase ? <FiCheck className="req-icon text-success" /> : <FiX className="req-icon text-error" />}
                                    <span>One lowercase letter (a-z)</span>
                                </div>
                                <div className={`requirement-item ${rules.number ? "met" : ""}`}>
                                    {rules.number ? <FiCheck className="req-icon text-success" /> : <FiX className="req-icon text-error" />}
                                    <span>One number (0-9)</span>
                                </div>
                                <div className={`requirement-item ${rules.special ? "met" : ""}`}>
                                    {rules.special ? <FiCheck className="req-icon text-success" /> : <FiX className="req-icon text-error" />}
                                    <span>One special character (e.g. !@#$)</span>
                                </div>
                            </div>

                            {/* Confirm Password field */}
                            <div className="reset-field-wrapper">
                                <label className="reset-label">Confirm Password</label>
                                <div className="reset-field-group">
                                    <FiLock className="reset-field-icon" />
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        placeholder="Confirm Password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required 
                                        disabled={loading}
                                    />
                                    <button 
                                        type="button" 
                                        className="reset-eye-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && (
                                    <span className={`live-match-feedback ${passwordsMatch ? "text-success" : "text-error"}`}>
                                        {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                                    </span>
                                )}
                            </div>

                            <button type="submit" className="reset-submit-btn" disabled={loading}>
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>

                        <div className="reset-card-footer">
                            <a href="/admin/login">&larr; Back to Login Screen</a>
                        </div>
                    </>
                ) : (
                    <motion.div 
                        className="reset-success-screen"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="success-icon-container">
                            <FiCheckCircle className="success-check-icon" />
                        </div>
                        <h2>Password Updated Successfully</h2>
                        <p>Your administrator password has been changed securely. Redirecting to login...</p>
                        
                        <button 
                            type="button" 
                            className="reset-success-btn"
                            onClick={() => navigate("/admin/login")}
                        >
                            Go to Login
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default ResetPassword;
