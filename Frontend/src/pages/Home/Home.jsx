import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import FeaturedCars from "../../components/FeaturedCars/FeaturedCars";
import Brands from "../../components/Brands/Brands";
import Footer from "../../components/Footer/Footer";
import { brandsApi } from "../../services/api";
import { FiSearch, FiSliders } from "react-icons/fi";
import "./Home.css";
import PremiumSelect from "../Admin/PremiumSelect";

function Home() {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedCondition, setSelectedCondition] = useState("");

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const list = await brandsApi.getAll();
                setBrands(list || []);
            } catch (err) {
                console.error("Error loading brands for search:", err);
            }
        };
        loadBrands();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append("search", searchQuery);
        if (selectedBrand) queryParams.append("brandId", selectedBrand);
        if (selectedCondition) queryParams.append("condition", selectedCondition);
        
        navigate(`/cars?${queryParams.toString()}`);
    };

    return (
        <div className="home-page-container">
            <Navbar />
            <Hero />
            
            {/* Quick Search Widget */}
            <section className="search-widget-section">
                <div className="search-widget-container">
                    <form className="quick-search-form" onSubmit={handleSearchSubmit}>
                        <div className="search-input-group keyword-search">
                            <label>Search Keyword</label>
                            <div className="input-with-icon">
                                <FiSearch className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="e.g. SF90, Phantom..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="search-input-group dropdown-search">
                            <label>Brand</label>

                            <PremiumSelect
                            id="home-brand"
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            options={[
                                { value: "", label: "Any Brand" },
                                ...brands.map((b) => ({
                                    value: b._id,
                                    label: b.name,
                                })),
                                ]}
                                />
                        </div>

                        <div className="search-input-group dropdown-search">
                            <label>Condition</label>
                            
                            <PremiumSelect
                            id="home-condition"
                            value={selectedCondition}
                            onChange={(e) => setSelectedCondition(e.target.value)}
                            options={[
                                { value: "", label: "All Vehicles" },
                                { value: "New", label: "New Models" },
                                { value: "Used", label: "Pre-Owned" },
                                ]}
                                />

                        </div>

                        <button type="submit" className="gold-search-btn">
                            <FiSearch className="btn-icon" /> Find Car
                        </button>
                    </form>
                </div>
            </section>

            <FeaturedCars />
            <Brands />
            <Footer />
        </div>
    );
}

export default Home;