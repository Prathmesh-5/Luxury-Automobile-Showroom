import { useState, useEffect } from "react";
import { brandsApi, carsApi } from "../../services/api";
import HoverTrackerCard from "./HoverTrackerCard";
import "./HeroStats.css";

function HeroStats({ establishedYear = 2003 }) {
    const [carCount, setCarCount] = useState(0);
    const [brandCount, setBrandCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [brandsList, carsRes] = await Promise.all([
                    brandsApi.getAll(),
                    carsApi.getAll({ limit: 1 })
                ]);
                setCarCount(carsRes.totalCars || 0);
                setBrandCount(brandsList ? brandsList.length : 0);
            } catch (err) {
                console.error("Failed to load hero stats counts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCounts();
    }, []);

    const currentYear = new Date().getFullYear();
    const expYears = Math.max(0, currentYear - Number(establishedYear || 2003));

    const stats = [
        {
            number: loading ? "..." : `${carCount}+`,
            title: "Luxury Cars"
        },
        {
            number: loading ? "..." : `${brandCount}+`,
            title: "Brands"
        },
        {
            number: `${expYears}+`,
            title: "Years Experience"
        }
    ];

    return (
        <div className="hero-stats">
            {stats.map((item, index) => (
                <HoverTrackerCard key={index}>
                    <h2>{item.number}</h2>
                    <p>{item.title}</p>
                </HoverTrackerCard>
            ))}
        </div>
    );
}

export default HeroStats;