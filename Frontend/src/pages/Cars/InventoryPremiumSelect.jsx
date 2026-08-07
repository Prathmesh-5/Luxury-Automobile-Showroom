import React, { useState, useEffect, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";
import "./InventoryPremiumSelect.css";

function InventoryPremiumSelect({ id, value, onChange, options = [], className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const selectedOption = options.find((opt) => String(opt.value) === String(value)) || options[0] || { label: "", value: "" };

    const handleOptionClick = (optValue) => {
        onChange({ target: { value: optValue } });
        setIsOpen(false);
    };

    return (
        <div className={`inventory-ps-container ${className}`} ref={containerRef} id={id}>
            <button
                type="button"
                className={`inventory-ps-trigger ${isOpen ? "active" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="selected-label">{selectedOption.label}</span>
                <FiChevronDown className="chevron-icon" />
            </button>

            {isOpen && (
                <div className="inventory-ps-dropdown" role="listbox">
                    <div className="dropdown-pointer"></div>
                    <div className="dropdown-list-container">
                        {options.map((opt) => {
                            const isSelected = String(opt.value) === String(value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`dropdown-item ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleOptionClick(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default InventoryPremiumSelect;
