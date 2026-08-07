import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiCheckCircle, FiAlertTriangle, FiX } from "react-icons/fi";
import { authApi } from "../../services/api";
import "./ForgotPasswordModal.css";

function ForgotPasswordModal({ isOpen, onClose }) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [shake, setShake] = useState(false);
    
    const modalRef = useRef(null);

    // Reset modal state when closed
    useEffect(() => {
        if (!isOpen) {
            setEmail("");
            setEmailError("");
            setSubmitError("");
            setLoading(false);
            setSuccess(false);
            setShake(false);
        }
    }, [isOpen]);

    // Focus Trap & ESC key close handler
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
            if (e.key === "Tab" && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length === 0) return;
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        const previousActiveElement = document.activeElement;

        // Auto-focus on input once modal transitions in
        const timeoutId = setTimeout(() => {
            const input = modalRef.current?.querySelector("input");
            if (input) {
                input.focus();
            }
        }, 300);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            clearTimeout(timeoutId);
            if (previousActiveElement && previousActiveElement.focus) {
                previousActiveElement.focus();
            }
        };
    }, [isOpen, onClose]);

    const validateEmail = (val) => {
        const trimmed = val.trim();
        if (!trimmed) {
            return "Email address is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            return "Please enter a valid email address";
        }
        return "";
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (emailError) {
            setEmailError(validateEmail(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        
        const err = validateEmail(email);
        if (err) {
            setEmailError(err);
            triggerShake();
            return;
        }

        setLoading(true);
        try {
            await authApi.forgotPassword(email.trim());
            setSuccess(true);
        } catch (err) {
            console.error("Forgot password error:", err);
            const errMsg = err.response?.data?.message || "Something went wrong. Please try again.";
            setSubmitError(errMsg);
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: "spring", duration: 0.5, bounce: 0.15 }
        },
        exit: { 
            opacity: 0, 
            scale: 0.95, 
            y: 15, 
            transition: { duration: 0.3 } 
        }
    };

    const shakeVariants = {
        shake: {
            x: [0, -10, 10, -10, 10, -5, 5, 0],
            transition: { duration: 0.4 }
        },
        idle: { x: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={handleOutsideClick}
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div 
                        className={`modal-card-wrapper ${shake ? "shaking" : ""}`}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        ref={modalRef}
                    >
                        <button 
                            className="modal-close-btn" 
                            onClick={onClose} 
                            aria-label="Close modal"
                        >
                            <FiX />
                        </button>

                        {!success ? (
                            <motion.div 
                                className="modal-content-form"
                                animate={shake ? "shake" : "idle"}
                                variants={shakeVariants}
                            >
                                <h3 className="modal-title">Reset Password</h3>
                                <p className="modal-subtitle">
                                    Enter your registered admin email. We will send a secure password reset link.
                                </p>

                                {submitError && (
                                    <div className="modal-error-box" role="alert">
                                        <FiAlertTriangle className="error-box-icon" />
                                        <span>{submitError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="modal-form">
                                    <div className={`modal-field-group ${emailError ? "has-error" : ""}`}>
                                        <FiMail className="modal-field-icon" />
                                        <input 
                                            type="text" 
                                            placeholder="Admin Email" 
                                            value={email}
                                            onChange={handleEmailChange}
                                            aria-invalid={!!emailError}
                                            aria-describedby={emailError ? "email-error-msg" : undefined}
                                            disabled={loading}
                                        />
                                    </div>
                                    {emailError && (
                                        <span id="email-error-msg" className="modal-validation-error">
                                            {emailError}
                                        </span>
                                    )}

                                    <div className="modal-buttons">
                                        <button 
                                            type="submit" 
                                            className="modal-primary-btn" 
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="btn-loading-content">
                                                    <span className="spinner"></span>
                                                    <span>Sending...</span>
                                                </div>
                                            ) : (
                                                "Send Reset Link"
                                            )}
                                        </button>

                                        <button 
                                            type="button" 
                                            className="modal-secondary-btn" 
                                            onClick={onClose}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div 
                                className="modal-content-success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="success-icon-wrapper">
                                    <FiCheckCircle className="success-icon" />
                                </div>
                                <h3 className="modal-title success-title">✓ Reset Link Sent</h3>
                                <p className="modal-subtitle">
                                    If an account exists with this email, we have sent a secure password reset link to:
                                </p>
                                <div className="success-email-display">{email.trim()}</div>
                                <p className="success-instruction">
                                    Check your inbox and spam folder.
                                </p>

                                <div className="modal-buttons vertical-buttons">
                                    <button 
                                        type="button" 
                                        className="modal-secondary-btn resend-btn" 
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? "Sending..." : "Resend Email"}
                                    </button>
                                    
                                    <button 
                                        type="button" 
                                        className="modal-primary-btn back-login-btn" 
                                        onClick={onClose}
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ForgotPasswordModal;
