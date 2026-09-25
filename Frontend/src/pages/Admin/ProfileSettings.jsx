import { useState, useEffect, useRef } from "react";
import { authApi, uploadApi } from "../../services/api";
import { 
    FiUser, FiMail, FiLock, FiCamera, FiTrash2, 
    FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff, FiSave, FiLink, FiUpload 
} from "react-icons/fi";
import "./ProfileSettings.css";

function ProfileSettings() {
    // ── Profile Information State ──
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const fileInputRef = useRef(null);

    // ── Change Email State ──
    const [newEmail, setNewEmail] = useState("");
    const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
    const [showEmailCurrentPass, setShowEmailCurrentPass] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);

    // ── Change Password State ──
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // ── Notification Banners State ──
    const [profileFeedback, setProfileFeedback] = useState(null);
    const [emailFeedback, setEmailFeedback] = useState(null);
    const [passwordFeedback, setPasswordFeedback] = useState(null);

    // Helper to format full image URL
    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${path}`;
    };

    // Load logged-in admin details on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authApi.getProfile();
                if (res?.data) {
                    setName(res.data.name || "");
                    setEmail(res.data.email || "");
                    setProfileImage(res.data.profileImage || res.data.avatar || "");
                }
            } catch (err) {
                const localUser = authApi.getCurrentUser();
                if (localUser) {
                    setName(localUser.name || "");
                    setEmail(localUser.email || "");
                    setProfileImage(localUser.profileImage || localUser.avatar || "");
                }
            }
        };

        fetchProfile();
    }, []);

    // ── Handle Avatar Image File Upload ──
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setProfileFeedback(null);
            const uploadedPaths = await uploadApi.uploadImages([file]);
            if (uploadedPaths && uploadedPaths.length > 0) {
                setProfileImage(uploadedPaths[0]);
                setProfileFeedback({ type: "success", text: "Image uploaded! Click 'Save Profile Changes' to apply." });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to upload image.";
            setProfileFeedback({ type: "error", text: errorMsg });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // ── Handle Avatar Image URL Apply ──
    const handleApplyImageUrl = () => {
        if (!imageUrlInput.trim()) return;
        setProfileImage(imageUrlInput.trim());
        setShowUrlInput(false);
        setImageUrlInput("");
        setProfileFeedback({ type: "success", text: "Image URL applied! Click 'Save Profile Changes' to save." });
    };

    // ── Handle Reset / Remove Avatar ──
    const handleRemoveAvatar = () => {
        setProfileImage("");
        setProfileFeedback({ type: "success", text: "Profile picture removed. Click 'Save Profile Changes' to save." });
    };

    // ── Save Profile Information (Name, Avatar) ──
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileFeedback(null);

        if (!name.trim()) {
            setProfileFeedback({ type: "error", text: "Admin Name is required." });
            return;
        }

        try {
            setSavingProfile(true);
            const res = await authApi.updateProfile({
                name: name.trim(),
                profileImage
            });

            if (res.success) {
                setProfileFeedback({ type: "success", text: "Profile updated successfully." });
                window.dispatchEvent(new Event("admin_user_updated"));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to update profile.";
            setProfileFeedback({ type: "error", text: errorMsg });
        } finally {
            setSavingProfile(false);
        }
    };

    // ── Save Change Email ──
    const handleSaveEmail = async (e) => {
        e.preventDefault();
        setEmailFeedback(null);

        if (!newEmail.trim()) {
            setEmailFeedback({ type: "error", text: "Please enter a valid new email address." });
            return;
        }

        if (!emailCurrentPassword) {
            setEmailFeedback({ type: "error", text: "Current password is required to change email." });
            return;
        }

        try {
            setSavingEmail(true);
            const res = await authApi.updateEmail({
                newEmail: newEmail.trim(),
                currentPassword: emailCurrentPassword
            });

            if (res.success) {
                setEmail(res.data.email);
                setNewEmail("");
                setEmailCurrentPassword("");
                setEmailFeedback({ type: "success", text: "Email updated successfully." });
                window.dispatchEvent(new Event("admin_user_updated"));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to update email.";
            setEmailFeedback({ type: "error", text: errorMsg });
        } finally {
            setSavingEmail(false);
        }
    };

    // ── Save Change Password ──
    const handleSavePassword = async (e) => {
        e.preventDefault();
        setPasswordFeedback(null);

        if (!currentPassword) {
            setPasswordFeedback({ type: "error", text: "Current password is required." });
            return;
        }

        if (!newPassword) {
            setPasswordFeedback({ type: "error", text: "New password is required." });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordFeedback({ type: "error", text: "New password must be at least 6 characters long." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordFeedback({ type: "error", text: "New password and confirmation must match." });
            return;
        }

        try {
            setSavingPassword(true);
            const res = await authApi.updatePassword({
                currentPassword,
                newPassword,
                confirmPassword
            });

            if (res.success) {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPasswordFeedback({ type: "success", text: "Password changed successfully." });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to change password.";
            setPasswordFeedback({ type: "error", text: errorMsg });
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="profile-settings-container">
            {/* Header */}
            <div className="profile-settings-header">
                <h1>Profile Settings</h1>
                <p>Manage your luxury administrator profile, email preferences, and account security credentials.</p>
            </div>

            <div className="profile-settings-grid">
                
                {/* ═════════════════════════════════════════════════════ */}
                {/* 1. PROFILE INFORMATION CARD                           */}
                {/* ═════════════════════════════════════════════════════ */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon">
                            <FiUser />
                        </div>
                        <div>
                            <h2>Profile Information</h2>
                            <p>Update your admin profile picture and display name.</p>
                        </div>
                    </div>

                    {profileFeedback && (
                        <div className={`profile-alert ${profileFeedback.type}`}>
                            {profileFeedback.type === "success" ? (
                                <FiCheckCircle className="alert-icon" />
                            ) : (
                                <FiAlertCircle className="alert-icon" />
                            )}
                            <span>{profileFeedback.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile}>
                        {/* Profile Picture Management */}
                        <div className="avatar-management-wrapper">
                            <div className="profile-avatar-preview">
                                {profileImage ? (
                                    <img src={getAvatarUrl(profileImage)} alt="Admin Avatar" />
                                ) : (
                                    name ? name.charAt(0).toUpperCase() : "A"
                                )}
                            </div>

                            <div className="avatar-actions-container">
                                <div className="avatar-buttons-group">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileUpload} 
                                        accept="image/*" 
                                        style={{ display: "none" }} 
                                    />
                                    <button 
                                        type="button" 
                                        className="btn-upload-avatar" 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        <FiUpload /> {uploading ? "Uploading..." : "Upload Picture"}
                                    </button>

                                    <button 
                                        type="button" 
                                        className="btn-url-avatar"
                                        onClick={() => setShowUrlInput(!showUrlInput)}
                                    >
                                        <FiLink /> Image URL
                                    </button>

                                    {profileImage && (
                                        <button 
                                            type="button" 
                                            className="btn-remove-avatar"
                                            onClick={handleRemoveAvatar}
                                        >
                                            <FiTrash2 /> Remove
                                        </button>
                                    )}
                                </div>

                                {showUrlInput && (
                                    <div className="url-input-box">
                                        <input 
                                            type="text" 
                                            placeholder="https://example.com/avatar.jpg" 
                                            value={imageUrlInput}
                                            onChange={(e) => setImageUrlInput(e.target.value)}
                                        />
                                        <button 
                                            type="button" 
                                            className="btn-upload-avatar"
                                            onClick={handleApplyImageUrl}
                                        >
                                            Apply URL
                                        </button>
                                    </div>
                                )}

                                <p className="avatar-hint">
                                    Supports JPG, PNG, WEBP files or direct image URL links.
                                </p>
                            </div>
                        </div>

                        {/* Form Inputs */}
                        <div className="form-grid-2">
                            <div className="form-group-custom">
                                <label>Admin Name</label>
                                <div className="input-with-icon">
                                    <FiUser className="input-field-icon" />
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        placeholder="Showroom Admin"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-custom">
                                <label>Current Email Address</label>
                                <div className="input-with-icon">
                                    <FiMail className="input-field-icon" />
                                    <input 
                                        type="email" 
                                        value={email} 
                                        disabled
                                        title="Use Change Email section below to update email address"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="card-action-btn"
                            disabled={savingProfile}
                        >
                            <FiSave /> {savingProfile ? "Saving..." : "Save Profile Changes"}
                        </button>
                    </form>
                </div>

                {/* ═════════════════════════════════════════════════════ */}
                {/* 2. CHANGE EMAIL CARD                                 */}
                {/* ═════════════════════════════════════════════════════ */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon">
                            <FiMail />
                        </div>
                        <div>
                            <h2>Change Email Address</h2>
                            <p>Update your primary login email address. Current password is required.</p>
                        </div>
                    </div>

                    {emailFeedback && (
                        <div className={`profile-alert ${emailFeedback.type}`}>
                            {emailFeedback.type === "success" ? (
                                <FiCheckCircle className="alert-icon" />
                            ) : (
                                <FiAlertCircle className="alert-icon" />
                            )}
                            <span>{emailFeedback.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveEmail}>
                        <div className="form-grid-2">
                            <div className="form-group-custom">
                                <label>Current Email</label>
                                <div className="input-with-icon">
                                    <FiMail className="input-field-icon" />
                                    <input 
                                        type="email" 
                                        value={email} 
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="form-group-custom">
                                <label>New Email Address</label>
                                <div className="input-with-icon">
                                    <FiMail className="input-field-icon" />
                                    <input 
                                        type="email" 
                                        value={newEmail} 
                                        onChange={(e) => setNewEmail(e.target.value)} 
                                        placeholder="admin@mail.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-custom" style={{ gridColumn: "1 / -1" }}>
                                <label>Current Password (for Verification)</label>
                                <div className="input-with-icon">
                                    <FiLock className="input-field-icon" />
                                    <input 
                                        type={showEmailCurrentPass ? "text" : "password"} 
                                        value={emailCurrentPassword} 
                                        onChange={(e) => setEmailCurrentPassword(e.target.value)} 
                                        placeholder="Enter current password to confirm"
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setShowEmailCurrentPass(!showEmailCurrentPass)}
                                    >
                                        {showEmailCurrentPass ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="card-action-btn"
                            disabled={savingEmail}
                        >
                            <FiSave /> {savingEmail ? "Updating Email..." : "Update Email Address"}
                        </button>
                    </form>
                </div>

                {/* ═════════════════════════════════════════════════════ */}
                {/* 3. CHANGE PASSWORD CARD                             */}
                {/* ═════════════════════════════════════════════════════ */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon">
                            <FiLock />
                        </div>
                        <div>
                            <h2>Change Password</h2>
                            <p>Ensure your account is using a strong password. Verification of current password is required.</p>
                        </div>
                    </div>

                    {passwordFeedback && (
                        <div className={`profile-alert ${passwordFeedback.type}`}>
                            {passwordFeedback.type === "success" ? (
                                <FiCheckCircle className="alert-icon" />
                            ) : (
                                <FiAlertCircle className="alert-icon" />
                            )}
                            <span>{passwordFeedback.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSavePassword}>
                        <div className="form-group-custom">
                            <label>Current Password</label>
                            <div className="input-with-icon">
                                <FiLock className="input-field-icon" />
                                <input 
                                    type={showCurrentPass ? "text" : "password"} 
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    placeholder="Enter current password"
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle-btn"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                >
                                    {showCurrentPass ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group-custom">
                                <label>New Password</label>
                                <div className="input-with-icon">
                                    <FiLock className="input-field-icon" />
                                    <input 
                                        type={showNewPass ? "text" : "password"} 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        placeholder="Enter new password (min. 6 chars)"
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setShowNewPass(!showNewPass)}
                                    >
                                        {showNewPass ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group-custom">
                                <label>Confirm New Password</label>
                                <div className="input-with-icon">
                                    <FiLock className="input-field-icon" />
                                    <input 
                                        type={showConfirmPass ? "text" : "password"} 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="password-toggle-btn"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    >
                                        {showConfirmPass ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="card-action-btn"
                            disabled={savingPassword}
                        >
                            <FiSave /> {savingPassword ? "Updating Password..." : "Change Password"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

export default ProfileSettings;
