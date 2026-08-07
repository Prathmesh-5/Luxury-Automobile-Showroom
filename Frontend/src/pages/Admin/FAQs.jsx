import { useState, useEffect } from "react";
import { faqsApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiPlus, FiEdit, FiTrash, FiBookOpen } from "react-icons/fi";
import "./AdminCommon.css";

function AdminFAQs() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedFaqId, setSelectedFaqId] = useState(null);

    // Form inputs
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [category, setCategory] = useState("financing");
    const [keywordsInput, setKeywordsInput] = useState("");
    
    const [submitting, setSubmitting] = useState(false);

    const loadFaqs = async () => {
        setLoading(true);
        try {
            const list = await faqsApi.getAll();
            setFaqs(list || []);
        } catch (err) {
            console.error("Failed to load FAQs:", err);
            toast.error("FAQs failed to load.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFaqs();
    }, []);

    const openAddModal = () => {
        setEditMode(false);
        setQuestion("");
        setAnswer("");
        setCategory("financing");
        setKeywordsInput("");
        setShowModal(true);
    };

    const openEditModal = (faq) => {
        setEditMode(true);
        setSelectedFaqId(faq._id);
        setQuestion(faq.question);
        setAnswer(faq.answer);
        setCategory(faq.category);
        setKeywordsInput(faq.keywords ? faq.keywords.join(", ") : "");
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const keywords = keywordsInput
            .split(",")
            .map(kw => kw.trim())
            .filter(kw => kw);
        
        const payload = { question, answer, category, keywords };

        try {
            if (editMode) {
                await faqsApi.update(selectedFaqId, payload);
                toast.success("FAQ updated successfully!");
            } else {
                await faqsApi.create(payload);
                toast.success("FAQ created successfully!");
            }
            setShowModal(false);
            loadFaqs();
        } catch (err) {
            console.error("FAQ save error:", err);
            toast.error(err.response?.data?.message || "Operation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this FAQ? It will no longer be available in the chatbot.")) return;
        
        try {
            await faqsApi.delete(id);
            toast.success("FAQ deleted successfully.");
            loadFaqs();
        } catch (err) {
            console.error("Failed to delete FAQ:", err);
            toast.error("Could not delete FAQ.");
        }
    };

    const getCategoryLabel = (cat) => {
        switch (cat) {
            case "financing": return "Financing & Loans";
            case "booking": return "Viewing & Bookings";
            case "sell-process": return "Selling & Valuation";
            case "warranty": return "Certification & Warranty";
            case "location": return "Location & Hours";
            case "import-export": return "Global Exports";
            default: return cat;
        }
    };

    return (
        <div className="admin-crud-panel">
            <div className="crud-header">
                <div>
                    <h1>Chatbot FAQs Directory</h1>
                    <p>Configure rule-based questions and answers for the chatbot database.</p>
                </div>
                <button className="add-record-btn" onClick={openAddModal}>
                    <FiPlus /> Add FAQ
                </button>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Loading FAQs index...</p>
                </div>
            ) : faqs.length === 0 ? (
                <div className="empty-crud-state">
                    <h3>No FAQs Configured</h3>
                    <p>Click "Add FAQ" to register the first chatbot scripted answer.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Question</th>
                                <th>Matching Keywords</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faqs.map((faq) => (
                                <tr key={faq._id}>
                                    <td>
                                        <span className="faq-cat-badge">
                                            <FiBookOpen /> {getCategoryLabel(faq.category)}
                                        </span>
                                    </td>
                                    <td>
                                        <strong className="faq-question-text">{faq.question}</strong>
                                    </td>
                                    <td>
                                        <div className="keywords-tags-stack">
                                            {faq.keywords && faq.keywords.length > 0 ? (
                                                faq.keywords.map((kw, i) => (
                                                    <span className="kw-tag" key={i}>{kw}</span>
                                                ))
                                            ) : (
                                                <span className="kw-tag empty">None</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-right actions-cell">
                                        <button className="edit-btn" onClick={() => openEditModal(faq)} title="Edit FAQ">
                                            <FiEdit />
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(faq._id)} title="Delete FAQ">
                                            <FiTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Overlay Form */}
            {showModal && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card">
                        <div className="modal-header">
                            <h3>{editMode ? "Edit FAQ Script" : "Add FAQ Script"}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <div className="modal-form-group">
                                <label>Category Select</label>
                                <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="financing">Financing & Leasing</option>
                                    <option value="booking">Viewing & Test Drives</option>
                                    <option value="sell-process">Selling & Valuation</option>
                                    <option value="warranty">Certification & Warranty</option>
                                    <option value="location">Showroom Location & Hours</option>
                                    <option value="import-export">Global Export Services</option>
                                </select>
                            </div>

                            <div className="modal-form-group">
                                <label>Question Text</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Do you support global export?" 
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    required 
                                />
                            </div>

                            <div className="modal-form-group">
                                <label>Answer Script</label>
                                <textarea 
                                    placeholder="Provide the exact pre-written response for the chatbot..." 
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    rows="5"
                                    required
                                ></textarea>
                            </div>

                            <div className="modal-form-group">
                                <label>Matching Keywords (Comma separated)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. export, shipping, globally, international" 
                                    value={keywordsInput}
                                    onChange={(e) => setKeywordsInput(e.target.value)}
                                />
                                <span className="field-tip">
                                    Chatbot text-queries containing these keywords will map to this FAQ script.
                                </span>
                            </div>

                            <div className="modal-actions-buttons">
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? "Saving Script..." : "Save FAQ"}
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminFAQs;
