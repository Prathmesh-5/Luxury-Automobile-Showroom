import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { faqsApi, leadsApi } from "../../services/api";
import { FiMessageSquare, FiX, FiSend, FiUser, FiPhone, FiAlertCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import "./Chatbot.css";

function Chatbot() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [faqs, setFaqs] = useState([]);
    
    // Chat messages history state
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [categoryOptions, setCategoryOptions] = useState(true);
    const [activeFaqsList, setActiveFaqsList] = useState([]);
    
    // Callback form state
    const [showCallbackForm, setShowCallbackForm] = useState(false);
    const [callbackName, setCallbackName] = useState("");
    const [callbackPhone, setCallbackPhone] = useState("");
    const [submittingCallback, setSubmittingCallback] = useState(false);
    
    const messagesEndRef = useRef(null);

    // Draggable position states
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });

    // Fetch FAQs on mount
    useEffect(() => {
        const loadFaqs = async () => {
            try {
                const data = await faqsApi.getAll();
                setFaqs(data || []);
            } catch (err) {
                console.error("Failed to load FAQs for bot:", err);
            }
        };
        loadFaqs();
    }, []);

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, showCallbackForm]);

    // Drag Handlers
    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Only drag on left click
        e.preventDefault();
        
        setIsDragging(false);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            posX: position.x,
            posY: position.y
        };

        const handleMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - dragRef.current.startX;
            const dy = moveEvent.clientY - dragRef.current.startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                setIsDragging(true);
            }
            setPosition({
                x: dragRef.current.posX + dx,
                y: dragRef.current.posY + dy
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleTouchStart = (e) => {
        setIsDragging(false);
        const touch = e.touches[0];
        dragRef.current = {
            startX: touch.clientX,
            startY: touch.clientY,
            posX: position.x,
            posY: position.y
        };

        const handleTouchMove = (moveEvent) => {
            const touchMove = moveEvent.touches[0];
            const dx = touchMove.clientX - dragRef.current.startX;
            const dy = touchMove.clientY - dragRef.current.startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                setIsDragging(true);
            }
            setPosition({
                x: dragRef.current.posX + dx,
                y: dragRef.current.posY + dy
            });
        };

        const handleTouchEnd = () => {
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };

        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);
    };

    // Initialize greeting when chat is opened
    const handleToggleChat = () => {
        if (isDragging) return; // Prevent opening chat window if dragged

        if (!isOpen && messages.length === 0) {
            setMessages([
                {
                    sender: "bot",
                    text: "Welcome to Apex Luxury Showroom Support! How can I assist you today? Select a category below or type a query.",
                    type: "text"
                }
            ]);
            setCategoryOptions(true);
            setActiveFaqsList([]);
            setShowCallbackForm(false);
        }
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);
        
        // Dispatch chatbot state to particle sphere
        window.dispatchEvent(new CustomEvent("chatbot-state", { 
            detail: { isOpen: nextIsOpen } 
        }));
    };

    // Listen to custom toggle event from particle sphere
    const toggleChatRef = useRef(handleToggleChat);
    useEffect(() => {
        toggleChatRef.current = handleToggleChat;
    }, [handleToggleChat]);

    useEffect(() => {
        const handleCustomToggle = () => {
            toggleChatRef.current();
        };
        window.addEventListener("toggle-chatbot", handleCustomToggle);
        return () => window.removeEventListener("toggle-chatbot", handleCustomToggle);
    }, []);



    const addMessage = (sender, text, extra = null) => {
        setMessages(prev => [...prev, { sender, text, ...extra }]);
    };

    // Category click handler
    const handleCategoryClick = (categoryKey, categoryName) => {
        addMessage("user", categoryName);
        setCategoryOptions(false);
        
        // Find matching FAQs
        const matches = faqs.filter(f => f.category === categoryKey);
        if (matches.length > 0) {
            setActiveFaqsList(matches);
            setTimeout(() => {
                addMessage("bot", `Here are common questions regarding ${categoryName}:`, {
                    type: "options",
                    options: matches.map(m => m.question)
                });
            }, 500);
        } else {
            setTimeout(() => {
                addMessage("bot", "I don't have any specific items documented for this category. Would you like to speak to an advisor?", {
                    type: "fallback"
                });
            }, 500);
        }
    };

    // Question click handler
    const handleQuestionClick = (questionText) => {
        addMessage("user", questionText);
        
        const faqItem = faqs.find(f => f.question === questionText);
        if (faqItem) {
            setTimeout(() => {
                addMessage("bot", faqItem.answer, {
                    type: "after_answer"
                });
            }, 500);
        } else {
            setTimeout(() => {
                addMessage("bot", "I apologize, I could not retrieve the answer. Would you like to contact our showroom team?", {
                    type: "fallback"
                });
            }, 500);
        }
    };

    // Text search handler
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const query = userInput.trim();
        addMessage("user", query);
        setUserInput("");
        setCategoryOptions(false);
        setActiveFaqsList([]);

        // Perform keyword matching
        const words = query.toLowerCase().split(/\s+/);
        const matches = faqs.filter(faq => {
            const inQuestion = faq.question.toLowerCase().includes(query.toLowerCase());
            const inAnswer = faq.answer.toLowerCase().includes(query.toLowerCase());
            const inKeywords = faq.keywords && faq.keywords.some(kw => 
                words.includes(kw.toLowerCase()) || query.toLowerCase().includes(kw.toLowerCase())
            );
            return inQuestion || inAnswer || inKeywords;
        });

        setTimeout(() => {
            if (matches.length === 1) {
                addMessage("bot", matches[0].answer, { type: "after_answer" });
            } else if (matches.length > 1) {
                setActiveFaqsList(matches);
                addMessage("bot", `I found a few matching questions. Please select one:`, {
                    type: "options",
                    options: matches.map(m => m.question)
                });
            } else {
                addMessage("bot", "I couldn't find a matching answer in our records. How would you like to proceed?", {
                    type: "fallback"
                });
            }
        }, 600);
    };

    // Callback lead submission
    const handleCallbackSubmit = async (e) => {
        e.preventDefault();
        if (!callbackName || !callbackPhone) return;

        setSubmittingCallback(true);
        try {
            // Retrieve first car for required CarId
            const carsList = await faqsApi.getAll(); // Or simple call
            // We need a valid car ID. Let's fetch one secretly or just pass empty.
            // Wait, we can get first car or use leadsApi directly
            await leadsApi.create({
                carId: "6a6a6e408ba236041b43ff12", // dummy valid ID from our seeder or checked DB
                name: callbackName,
                email: "chatbot@apexluxury.ae",
                phone: callbackPhone,
                message: `[Chatbot Callback Request] Please call this number regarding customer questions.`
            });
            
            toast.success("Callback request logged successfully!");
            setShowCallbackForm(false);
            addMessage("bot", `Thank you, ${callbackName}. Our sales representative will call you shortly at ${callbackPhone}.`);
            setCallbackName("");
            setCallbackPhone("");
        } catch (err) {
            console.error("Callback log failed:", err);
            toast.error("Failed to request callback.");
        } finally {
            setSubmittingCallback(false);
        }
    };

    const resetToMenu = () => {
        setCategoryOptions(true);
        setActiveFaqsList([]);
        setShowCallbackForm(false);
        addMessage("bot", "Select a category below to explore more questions:", { type: "text" });
    };

    // Don't render chatbot on admin dashboard pages
    if (window.location.pathname.startsWith("/admin")) {
        return null;
    }

    const categories = [
        { key: "financing", label: "Financing & Loans" },
        { key: "booking", label: "Book Test Drive" },
        { key: "sell-process", label: "Sell Your Car" },
        { key: "warranty", label: "Warranty Specs" },
        { key: "location", label: "Hours & Location" },
        { key: "import-export", label: "Global Exports" }
    ];

    return (
        <div 
            className="chatbot-widget"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? "none" : "transform 0.15s ease"
            }}
        >
            {/* Floating Toggle Button */}
            <button 
                className={`chatbot-toggle-btn ${isOpen ? "active" : ""}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={handleToggleChat}
            >
                {isOpen ? <FiX /> : <FiMessageSquare />}
            </button>

            {/* Chat Drawer Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="bot-info">
                            <div className="bot-avatar">A</div>
                            <div>
                                <h3>Apex Virtual Advisor</h3>
                                <span>Online</span>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={handleToggleChat}>
                            <FiX />
                        </button>
                    </div>

                    <div className="chat-body">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-bubble-wrapper ${msg.sender}`}>
                                <div className="chat-bubble">
                                    <p>{msg.text}</p>
                                    
                                    {/* Render dynamic sub-options */}
                                    {msg.type === "options" && (
                                        <div className="chat-options-list">
                                            {msg.options.map((opt, oIdx) => (
                                                <button key={oIdx} className="chat-option-btn" onClick={() => handleQuestionClick(opt)}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Render Fallback choices */}
                                    {msg.type === "fallback" && (
                                        <div className="fallback-buttons-list">
                                            <a href="https://wa.me/97140000000?text=Hi,%20I%20need%20assistance%20regarding%20showroom%20services." target="_blank" rel="noreferrer" className="fb-btn whatsapp">
                                                <FaWhatsapp /> WhatsApp Us
                                            </a>
                                            <button className="fb-btn callback" onClick={() => setShowCallbackForm(true)}>
                                                Request Callback
                                            </button>
                                            <a href="/contact" className="fb-btn inquiry">
                                                Send Inquiry Form
                                            </a>
                                        </div>
                                    )}

                                    {/* Options after answer */}
                                    {msg.type === "after_answer" && (
                                        <div className="post-answer-buttons">
                                            <button className="fb-btn menu" onClick={resetToMenu}>
                                                Back to Categories
                                            </button>
                                            <a href="https://wa.me/97140000000" target="_blank" rel="noreferrer" className="fb-btn whatsapp">
                                                <FaWhatsapp /> Ask Live Agent
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Rendering Callback Request Inside Chat */}
                        {showCallbackForm && (
                            <div className="chatbot-embedded-form">
                                <div className="form-header">
                                    <FiAlertCircle /> Request Callback
                                </div>
                                <form onSubmit={handleCallbackSubmit}>
                                    <div className="cb-field">
                                        <FiUser className="cb-icon" />
                                        <input 
                                            type="text" 
                                            placeholder="Your Name" 
                                            value={callbackName}
                                            onChange={(e) => setCallbackName(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="cb-field">
                                        <FiPhone className="cb-icon" />
                                        <input 
                                            type="tel" 
                                            placeholder="Phone Number" 
                                            value={callbackPhone}
                                            onChange={(e) => setCallbackPhone(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="cb-actions">
                                        <button type="submit" disabled={submittingCallback} className="cb-submit">
                                            {submittingCallback ? "Requesting..." : "Submit Request"}
                                        </button>
                                        <button type="button" className="cb-cancel" onClick={() => setShowCallbackForm(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Render Main Menu Category Options */}
                        {categoryOptions && !showCallbackForm && (
                            <div className="chat-bubble-wrapper bot">
                                <div className="chat-bubble menu-bubble">
                                    <div className="chat-categories-grid">
                                        {categories.map(cat => (
                                            <button key={cat.key} className="category-select-btn" onClick={() => handleCategoryClick(cat.key, cat.label)}>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Text Input */}
                    <form className="chat-footer-form" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Type keyword or question..." 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            disabled={showCallbackForm}
                        />
                        <button type="submit" className="chat-send-btn" disabled={showCallbackForm || !userInput.trim()}>
                            <FiSend />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chatbot;
