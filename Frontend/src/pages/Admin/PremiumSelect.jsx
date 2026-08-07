/**
 * PremiumSelect — Custom luxury dropdown for Admin Manage Cars filters.
 *
 * Props mirror a native <select>:
 *   id        – HTML id for the trigger button
 *   value     – currently selected value  (controlled)
 *   onChange  – called with a synthetic-select-like event { target: { value } }
 *   options   – [ { value, label } ]
 *   className – extra class on the wrapper
 *
 * All filtering / state logic in Cars.jsx remains 100% untouched.
 */

import { useState, useEffect, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";
import "./PremiumSelect.css";

function PremiumSelect({
    id,
    value,
    onChange,
    options = [],
    className = "",
    icon = null,
}) {
    const [open, setOpen]       = useState(false);
    const wrapperRef            = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const selected = options.find(o => o.value === value) || options[0] || { label: "—" };

    const handleSelect = (optValue) => {
        // Emulate a native select onChange event shape so Cars.jsx works unchanged
        onChange({ target: { value: optValue } });
        setOpen(false);
    };

    return (
        <div
            ref={wrapperRef}
            className={`ps-wrapper ${className} ${open ? "ps-open" : ""}`}
        >
            {/* ── Trigger button ── */}
            <button
                id={id}
                type="button"
                className={`ps-trigger ${value ? "ps-has-value" : ""}`}
                onClick={() => setOpen(prev => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {icon && <span className="ps-icon">{icon}</span>}

<span className="ps-label">
    {selected.label}
</span>

<FiChevronDown className="ps-chevron" />
            </button>

            {/* ── Dropdown panel ── */}
            {open && (
                <div className="ps-menu" role="listbox" aria-label={id}>
                    {/* top pointer triangle */}
                    <div className="ps-pointer" />

                    <div className="ps-items-scroll">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={opt.value === value}
                                className={`ps-item ${opt.value === value ? "ps-item-active" : ""}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.value === value && <span className="ps-active-dot" />}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PremiumSelect;
