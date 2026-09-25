import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { newsletterApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { 
    FiArrowLeft, FiSave, FiEye, FiMail, FiSend, FiUsers, FiCheckCircle 
} from "react-icons/fi";
import "./AdminCommon.css";
import "./CreateCampaign.css";

function CreateCampaign() {
    const navigate = useNavigate();
    const { id } = useParams(); // If editing an existing draft

    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [recipientType, setRecipientType] = useState("all_active");
    const [selectedSubscriberIds, setSelectedSubscriberIds] = useState([]);
    
    const [activeSubscriberCount, setActiveSubscriberCount] = useState(0);
    const [availableSubscribers, setAvailableSubscribers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Modals
    const [previewModal, setPreviewModal] = useState(false);
    const [testEmailModal, setTestEmailModal] = useState(false);
    const [sendConfirmModal, setSendConfirmModal] = useState(false);

    const [testEmail, setTestEmail] = useState("");
    const [createdCampaignId, setCreatedCampaignId] = useState(id || null);

    useEffect(() => {
        loadActiveSubscribersCount();
        if (id) {
            loadCampaignDraft(id);
        }
    }, [id]);

    const loadActiveSubscribersCount = async () => {
        try {
            const res = await newsletterApi.getSubscribers({ limit: 100, status: "Active" });
            if (res.data) {
                if (res.data.stats) {
                    setActiveSubscriberCount(res.data.stats.activeSubscribers || 0);
                }
                if (res.data.subscribers) {
                    setAvailableSubscribers(res.data.subscribers);
                }
            }
        } catch (err) {
            console.error("Error loading subscribers count:", err);
        }
    };

    const loadCampaignDraft = async (campaignId) => {
        try {
            setLoading(true);
            const res = await newsletterApi.getCampaignById(campaignId);
            if (res.data) {
                setSubject(res.data.subject || "");
                setContent(res.data.content || "");
                setRecipientType(res.data.recipientType || "all_active");
                if (res.data.selectedSubscriberIds) {
                    setSelectedSubscriberIds(res.data.selectedSubscriberIds.map(s => s._id || s));
                }
                setCreatedCampaignId(res.data._id);
            }
        } catch (err) {
            console.error("Error loading draft:", err);
            toast.error("Failed to load campaign draft.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!subject.trim()) {
            toast.error("Please enter a campaign subject.");
            return;
        }

        if (!content.trim()) {
            toast.error("Please enter campaign content.");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                subject: subject.trim(),
                content,
                recipientType,
                selectedSubscriberIds: recipientType === "selected" ? selectedSubscriberIds : []
            };

            let res;
            if (createdCampaignId) {
                res = await newsletterApi.updateCampaign(createdCampaignId, payload);
                toast.success("Campaign draft updated.");
            } else {
                res = await newsletterApi.createCampaign(payload);
                if (res.data) {
                    setCreatedCampaignId(res.data._id);
                }
                toast.success("Campaign draft saved.");
            }
        } catch (err) {
            console.error("Save draft error:", err);
            toast.error(err.response?.data?.message || "Failed to save campaign draft.");
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!testEmail || !testEmail.trim()) {
            toast.error("Please enter a valid test email address.");
            return;
        }

        if (!subject.trim() || !content.trim()) {
            toast.error("Please provide both subject and content before testing.");
            return;
        }

        try {
            setSaving(true);
            // Save or get campaign ID
            let targetId = createdCampaignId;
            if (!targetId) {
                const res = await newsletterApi.createCampaign({
                    subject: subject.trim(),
                    content,
                    recipientType,
                    selectedSubscriberIds
                });
                targetId = res.data._id;
                setCreatedCampaignId(targetId);
            }

            const res = await newsletterApi.sendTestEmail(targetId, {
                testEmail: testEmail.trim(),
                subject: subject.trim(),
                content
            });

            toast.success(res.message || `Test email sent to ${testEmail.trim()}`);
            setTestEmailModal(false);
            setTestEmail("");
        } catch (err) {
            console.error("Test email error:", err);
            toast.error(err.response?.data?.message || "Failed to send test email.");
        } finally {
            setSaving(false);
        }
    };

    const handleSendNewsletter = async () => {
        try {
            setSaving(true);
            let targetId = createdCampaignId;
            if (!targetId) {
                const draftRes = await newsletterApi.createCampaign({
                    subject: subject.trim(),
                    content,
                    recipientType,
                    selectedSubscriberIds
                });
                targetId = draftRes.data._id;
            }

            const sendRes = await newsletterApi.sendCampaign(targetId);
            toast.success(sendRes.message || "Campaign sent successfully.");
            setSendConfirmModal(false);
            navigate("/admin/newsletter-campaigns");
        } catch (err) {
            console.error("Send newsletter error:", err);
            toast.error(err.response?.data?.message || "Failed to send newsletter campaign.");
            setSendConfirmModal(false);
        } finally {
            setSaving(false);
        }
    };

    const targetRecipientCount = recipientType === "all_active" 
        ? activeSubscriberCount 
        : selectedSubscriberIds.length;

    if (loading) {
        return (
            <div className="admin-crud-panel">
                <p style={{ color: "#a1a1aa", textAlign: "center", padding: "60px" }}>Loading Campaign Editor...</p>
            </div>
        );
    }

    return (
        <div className="admin-crud-panel">
            <div className="crud-header">
                <button type="button" className="campaign-btn-outline" onClick={() => navigate("/admin/newsletter-campaigns")}>
                    <FiArrowLeft /> Back to Campaigns
                </button>
                <h1 style={{ marginTop: "10px" }}>{createdCampaignId ? "Edit Campaign Draft" : "Create Newsletter Campaign"}</h1>
            </div>

            <div className="create-campaign-container">
                <div className="create-campaign-card">
                    <div className="campaign-form-section">
                        {/* Subject */}
                        <div className="modal-form-group">
                            <label>Campaign Subject</label>
                            <input
                                type="text"
                                placeholder="e.g. New Lamborghini Collection Has Arrived"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        {/* Recipient Selection */}
                        <div className="modal-form-group">
                            <label>Recipient Selection</label>
                            <div className="recipient-option-box">
                                <div
                                    className={`recipient-option-btn ${recipientType === "all_active" ? "active" : ""}`}
                                    onClick={() => setRecipientType("all_active")}
                                >
                                    <h4>All Active Subscribers</h4>
                                    <p>Send to all active newsletter subscribers in your showroom database.</p>
                                </div>

                                <div
                                    className={`recipient-option-btn ${recipientType === "selected" ? "active" : ""}`}
                                    onClick={() => setRecipientType("selected")}
                                >
                                    <h4>Selected Subscribers ({selectedSubscriberIds.length})</h4>
                                    <p>Manually choose specific active subscribers for targeted delivery.</p>
                                </div>
                            </div>

                            {/* Live MongoDB Count Badge */}
                            <div className="live-count-badge">
                                <FiUsers /> Target Recipients: <strong>{targetRecipientCount} Active Subscribers</strong> (Live MongoDB Snapshot)
                            </div>
                        </div>

                        {/* Subscriber Checkbox List if "selected" */}
                        {recipientType === "selected" && (
                            <div className="modal-form-group">
                                <label>Choose Target Active Subscribers</label>
                                <div style={{ maxHeight: "180px", overflowY: "auto", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                                    {availableSubscribers.filter(s => s.status === "active").length === 0 ? (
                                        <p style={{ color: "#8a8a93", fontSize: "12px", margin: 0 }}>No active subscribers found.</p>
                                    ) : (
                                        availableSubscribers.filter(s => s.status === "active").map((sub) => (
                                            <label key={sub._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSubscriberIds.includes(sub._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedSubscriberIds([...selectedSubscriberIds, sub._id]);
                                                        } else {
                                                            setSelectedSubscriberIds(selectedSubscriberIds.filter(id => id !== sub._id));
                                                        }
                                                    }}
                                                    accentColor="#d4af37"
                                                />
                                                {sub.email}
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="modal-form-group">
                            <label>Newsletter Content (Supports HTML Formatting)</label>
                            <textarea
                                rows={10}
                                placeholder="Write your newsletter announcement HTML or plain text here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ lineHeight: "1.6" }}
                            />
                        </div>

                        {/* Actions Bar */}
                        <div className="campaign-actions-bar">
                            <button type="button" className="campaign-btn-outline" onClick={handleSaveDraft} disabled={saving}>
                                <FiSave /> {saving ? "Saving..." : "Save Draft"}
                            </button>

                            <div className="action-bar-right">
                                <button type="button" className="campaign-btn-outline" onClick={() => setPreviewModal(true)}>
                                    <FiEye /> Preview HTML
                                </button>

                                <button type="button" className="campaign-btn-outline" onClick={() => setTestEmailModal(true)}>
                                    <FiMail /> Send Test Email
                                </button>

                                <button type="button" className="campaign-btn-gold" onClick={() => setSendConfirmModal(true)}>
                                    <FiSend /> Send Newsletter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewModal && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card large">
                        <div className="modal-header">
                            <h3>Campaign HTML Preview</h3>
                            <button type="button" className="modal-close" onClick={() => setPreviewModal(false)}>&times;</button>
                        </div>
                        <div className="modal-form">
                            <div>
                                <label style={{ fontSize: "11px", color: "#8a8a93" }}>Subject</label>
                                <h3 style={{ color: "#d4af37", margin: "4px 0 15px 0" }}>{subject || "Untitled Campaign"}</h3>
                            </div>
                            <div className="preview-body-box" dangerouslySetInnerHTML={{ __html: content || "<p>No content written yet.</p>" }} />
                            <div className="modal-actions-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setPreviewModal(false)}>Close Preview</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Test Email Modal */}
            {testEmailModal && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card">
                        <div className="modal-header">
                            <h3>Send Test Email</h3>
                            <button type="button" className="modal-close" onClick={() => setTestEmailModal(false)}>&times;</button>
                        </div>
                        <div className="modal-form">
                            <p style={{ color: "#d1d5db", fontSize: "13px", margin: 0 }}>
                                Send a preview of <strong>"{subject || "Untitled"}"</strong> to your personal test inbox using configured SMTP credentials.
                            </p>
                            <div className="modal-form-group">
                                <label>Test Email Address</label>
                                <input
                                    type="email"
                                    placeholder="Enter test email address..."
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                />
                            </div>
                            <div className="modal-actions-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setTestEmailModal(false)} disabled={saving}>Cancel</button>
                                <button type="button" className="submit-btn" onClick={handleSendTestEmail} disabled={saving}>
                                    {saving ? "Sending Test..." : "Send Test Email"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Newsletter Confirmation Modal */}
            {sendConfirmModal && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card">
                        <div className="modal-header">
                            <h3>Confirm Newsletter Dispatch</h3>
                            <button type="button" className="modal-close" onClick={() => setSendConfirmModal(false)}>&times;</button>
                        </div>
                        <div className="modal-form">
                            <p style={{ color: "#d1d5db", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                                Are you sure you want to dispatch <strong>"{subject || "Untitled Campaign"}"</strong>?
                            </p>
                            <div style={{ background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.2)", padding: "14px", borderRadius: "10px", color: "#d4af37", fontSize: "13px" }}>
                                <strong>Target Recipients:</strong> {targetRecipientCount} active subscribers.
                            </div>
                            <span style={{ fontSize: "12px", color: "#71717a" }}>
                                Note: If SMTP settings are unconfigured, sending will cleanly fail and report a configuration error without producing fake sent metrics.
                            </span>
                            <div className="modal-actions-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setSendConfirmModal(false)} disabled={saving}>Cancel</button>
                                <button type="button" className="submit-btn" onClick={handleSendNewsletter} disabled={saving}>
                                    {saving ? "Dispatching..." : "Send Newsletter"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateCampaign;
