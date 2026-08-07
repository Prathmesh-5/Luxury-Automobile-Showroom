import { useState, useEffect, useRef } from "react";
import { brandsApi } from "../../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./Brands.css";
import BrandShowcase from "./BrandShowcase";

function Brands() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedBrand, setSelectedBrand] = useState(null);
    const showcaseRef = useRef(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const list = await brandsApi.getAll();
                setBrands(list.filter((b) => b.isActive));
            } catch (err) {
                console.error("Error fetching brands:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    const getLogoUrl = (brand) => {
        if (!brand.logo) return null;
        if (brand.logo.startsWith("http")) return brand.logo;

        const base =
            import.meta.env.VITE_IMAGE_BASE_URL ||
            "http://localhost:5000";

        return `${base}${brand.logo}`;
    };

    const handleBrandClick = (brand) => {
        setSelectedBrand(brand);

        setTimeout(() => {
            showcaseRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);
    };

    if (loading || brands.length === 0) {
        return null;
    }

    return (
        <section className="brands-section">
            <p className="brands-subtitle">
                WORLD'S FINEST AUTOMOBILE BRANDS
            </p>

            <h2>Luxury Brands</h2>

            <Swiper
                modules={[Autoplay]}
                slidesPerView={5}
                spaceBetween={50}
                loop={true}
                speed={3000}
                autoplay={{
                    delay: 1000,
                    disableOnInteraction: false,
                }}
                breakpoints={{
                    320: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                    },
                    1024: {
                        slidesPerView: 5,
                        spaceBetween: 50,
                    },
                }}
            >
                {brands.map((brand) => (
                    <SwiperSlide key={brand._id}>
                        <div
                            className={`brand-card ${
                                selectedBrand?._id === brand._id
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                handleBrandClick(brand)
                            }
                        >
                            {getLogoUrl(brand) ? (
                                <img
                                    src={getLogoUrl(brand)}
                                    alt={brand.name}
                                    title={brand.name}
                                />
                            ) : (
                                <div className="brand-text-logo">
                                    {brand.name}
                                </div>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {selectedBrand && (
                <div ref={showcaseRef}>
                    <BrandShowcase
                        brand={selectedBrand}
                    />
                </div>
            )}
        </section>
    );
}

export default Brands;