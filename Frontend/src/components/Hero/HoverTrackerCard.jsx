import { useRef } from "react";
import "./HoverTrackerCard.css";

export function HoverTrackerCard({ children, variant = "stats" }) {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Bind dynamic coordinates to CSS variables
        cardRef.current.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current.style.setProperty("--mouse-y", `${y}px`);

        // Compute 3D tilt orientation values (6 degrees max for cars, 10 degrees for stats)
        const maxTilt = variant === "car" ? 6 : 10;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((centerY - y) / centerY) * maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        cardRef.current.style.setProperty("--tilt-x", `${rotateX}deg`);
        cardRef.current.style.setProperty("--tilt-y", `${rotateY}deg`);
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.setProperty("--tilt-x", "0deg");
        cardRef.current.style.setProperty("--tilt-y", "0deg");
    };

    return (
        <div 
            ref={cardRef}
            className={`hover-tracker-card tracker-variant-${variant}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {variant === "stats" && (
                <>
                    {/* Dynamic Spotlight Glow Overlay */}
                    <div className="hover-tracker-card-glow" />

                    {/* Rotating Border Beam Indicator Overlay */}
                    <div className="border-beam-container">
                        <div className="border-beam-indicator" />
                    </div>
                </>
            )}

            {/* Inner Content Wrapper */}
            <div className="card-inner-content">
                {children}
            </div>
        </div>
    );
}

export default HoverTrackerCard;
