import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { faqsApi } from "../../services/api";
import { FiPlus, FiMinus, FiHelpCircle } from "react-icons/fi";
import "./FAQPage.css";

function FAQPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        const loadFaqs = async () => {
            try {
                const data = await faqsApi.getAll();
                setFaqs(data || []);
            } catch (err) {
                console.error("Failed to load FAQs:", err);
            } finally {
                setLoading(false);
            }
        };
        loadFaqs();
    }, []);

    const toggleAccordion = (index) => {
        if (activeIndex === index) {
            setActiveIndex(null);
        } else {
            setActiveIndex(index);
        }
    };

    const getCategoryName = (cat) => {
        switch (cat) {
            case "financing": return "Financing & Leasing";
            case "booking": return "Viewing & Test Drives";
            case "sell-process": return "Selling & Valuation";
            case "warranty": return "Certification & Warranty";
            case "location": return "Showroom Location & Hours";
            case "import-export": return "Global Export Services";
            default: return cat;
        }
    };

    // Group FAQs by category
    const groupedFaqs = faqs.reduce((acc, faq) => {
        const cat = faq.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(faq);
        return acc;
    }, {});

    return (
        <div className="faq-page">
            <Navbar />
            
            {/* Banner */}
            <div className="faq-banner">
                <div className="banner-overlay"></div>
                <div className="banner-content">
                    <h1>Frequently Asked Questions</h1>
                    <p>Find instant answers to common questions about our premier showroom services</p>
                </div>
            </div>

            {/* Core Accordions */}
            <section className="faq-content-section">
                <div className="faq-container">
                    {loading ? (
                        <div className="catalog-loading">
                            <div className="spinner"></div>
                            <p>Loading FAQ Database...</p>
                        </div>
                    ) : faqs.length === 0 ? (
                        <div className="no-faqs-state">
                            <FiHelpCircle className="help-icon" />
                            <h3>No FAQs available at this moment.</h3>
                        </div>
                    ) : (
                        <div className="faq-groups-list">
                            {Object.entries(groupedFaqs).map(([categoryKey, items]) => (
                                <div className="faq-category-group" key={categoryKey}>
                                    <h2 className="category-title">
                                        {getCategoryName(categoryKey)}
                                    </h2>
                                    
                                    <div className="accordion-list">
                                        {items.map((item, index) => {
                                            const uniqueIndex = `${categoryKey}-${index}`;
                                            const isOpen = activeIndex === uniqueIndex;
                                            
                                            return (
                                                <div 
                                                    className={`accordion-item ${isOpen ? "open" : ""}`} 
                                                    key={item._id}
                                                >
                                                    <button 
                                                        className="accordion-header"
                                                        onClick={() => toggleAccordion(uniqueIndex)}
                                                    >
                                                        <span>{item.question}</span>
                                                        <div className="accordion-icon">
                                                            {isOpen ? <FiMinus /> : <FiPlus />}
                                                        </div>
                                                    </button>
                                                    
                                                    <div className="accordion-collapse">
                                                        <div className="accordion-body">
                                                            {item.answer}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default FAQPage;
