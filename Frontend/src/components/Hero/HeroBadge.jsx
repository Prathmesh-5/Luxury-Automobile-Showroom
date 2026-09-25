import "./HeroBadge.css";

function HeroBadge({ badgeText }) {
    return (
        <div className="hero-badge">
            {badgeText || "★ Trusted Since 2003"}
        </div>
    );
}

export default HeroBadge;