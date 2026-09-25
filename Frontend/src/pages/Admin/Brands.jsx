import { useState, useEffect } from "react";
import { brandsApi, uploadApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiPlus, FiEdit, FiTrash, FiGlobe, FiEye, FiEyeOff, FiCamera, FiSearch, FiX } from "react-icons/fi";
import PremiumSelect from "./PremiumSelect";
import "./AdminCommon.css";

const getCountryCode = (countryName) => {
    if (!countryName) return null;
    const cleanName = countryName.trim().toLowerCase();
    
    // Dynamic generation cache
    if (!window._countryToCodeCache) {
        const cache = {};
        // Hardcoded common abbreviations fallback
        const extraMapping = {
            "united kingdom": "GB",
            "france": "FR",
            "usa": "US",
            "u.s.a.": "US",
            "uk": "GB",
            "u.k.": "GB",
            "great britain": "GB",
            "uae": "AE",
            "u.a.e.": "AE"
        };
        
        try {
            const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
            for (let i = 65; i <= 90; i++) {
                for (let j = 65; j <= 90; j++) {
                    const code = String.fromCharCode(i, j);
                    try {
                        const name = regionNames.of(code);
                        if (name && name !== code) {
                            cache[name.toLowerCase()] = code;
                        }
                    } catch (e) {
                        // Ignore invalid ISO codes
                    }
                }
            }
        } catch (e) {
            console.error("Intl.DisplayNames not supported:", e);
        }
        
        window._countryToCodeCache = { ...cache, ...extraMapping };
    }
    
    return window._countryToCodeCache[cleanName] || null;
};

const getCountryFlag = (countryName) => {
    const code = getCountryCode(countryName);
    if (!code) return null;
    try {
        const codePoints = code
            .toUpperCase()
            .split("")
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    } catch (e) {
        console.error("Failed to generate flag for country code:", code, e);
        return null;
    }
};

function AdminBrands() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // ── Pagination state ──
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize]       = useState("10");

    const filteredBrands = brands.filter((brand) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.trim().toLowerCase();
        const matchesName = brand.name && brand.name.toLowerCase().includes(query);
        const matchesCountry = brand.country && brand.country.toLowerCase().includes(query);
        return matchesName || matchesCountry;
    });

    // ── Reset pagination on search query change ──
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // ── Pagination calculations ──
    const limit = pageSize === "all" ? (filteredBrands.length || 1) : Number(pageSize);
    const totalPages = Math.ceil(filteredBrands.length / limit) || 1;
    const validPage = Math.min(Math.max(1, currentPage), totalPages);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [pageSize, filteredBrands.length, totalPages, currentPage]);

    const startIndex = (validPage - 1) * limit;
    const endIndex   = pageSize === "all" ? filteredBrands.length : Math.min(startIndex + limit, filteredBrands.length);
    const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

    const getPageRange = () => {
        const total = totalPages || 1;
        const current = validPage;
        const range = [];
        const maxVisible = 5;
        let start = Math.max(1, current - Math.floor(maxVisible / 2));
        let end = Math.min(total, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    };
    const pageNumbers = getPageRange();
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState(null);

    // Form inputs
    const [name, setName] = useState("");
    const [country, setCountry] = useState("");
    const [logo, setLogo] = useState(""); // Stores path
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Extended fields
    const [heroCar, setHeroCar] = useState("");
    const [foundedYear, setFoundedYear] = useState("");
    const [overview, setOverview] = useState("");
    const [whyChooseInput, setWhyChooseInput] = useState("");
    const [whyChoose, setWhyChoose] = useState([]);
    const [popularModelsInput, setPopularModelsInput] = useState("");
    const [popularModels, setPopularModels] = useState([]);
    
    // Performance
    const [speed, setSpeed] = useState("");
    const [zero, setZero] = useState("");
    const [hp, setHp] = useState("");
    const [engine, setEngine] = useState("");
    
    // File upload states
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [heroFile, setHeroFile] = useState(null);
    const [heroPreview, setHeroPreview] = useState("");
    
    const [submitting, setSubmitting] = useState(false);

    const loadBrands = async () => {
        setLoading(true);
        try {
            const list = await brandsApi.getAll();
            setBrands(list || []);
        } catch (err) {
            console.error("Failed to load brands:", err);
            toast.error("Brands failed to load.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBrands();
    }, []);

    const openAddModal = () => {
        setEditMode(false);
        setName("");
        setCountry("");
        setLogo("");
        setLogoFile(null);
        setLogoPreview("");
        setDescription("");
        
        // Reset dynamic showcase fields
        setHeroCar("");
        setHeroFile(null);
        setHeroPreview("");
        setFoundedYear("");
        setOverview("");
        setWhyChoose([]);
        setWhyChooseInput("");
        setPopularModels([]);
        setPopularModelsInput("");
        setSpeed("");
        setZero("");
        setHp("");
        setEngine("");
        
        setIsActive(true);
        setShowModal(true);
    };

    const openEditModal = (brand) => {
        setEditMode(true);
        setSelectedBrandId(brand._id);
        setName(brand.name);
        setCountry(brand.country || "");
        setLogo(brand.logo || "");
        setLogoFile(null);
        setLogoPreview(getLogoUrl(brand.logo));
        setDescription(brand.description || "");
        setIsActive(brand.isActive);

        // Populate dynamic showcase fields
        setHeroCar(brand.heroCar || "");
        setHeroFile(null);
        setHeroPreview(brand.heroCar ? getLogoUrl(brand.heroCar) : "");
        setFoundedYear(brand.foundedYear || "");
        setOverview(brand.overview || "");
        setWhyChoose(brand.whyChoose || []);
        setWhyChooseInput("");
        setPopularModels(brand.popularModels || []);
        setPopularModelsInput("");
        
        // Performance
        setSpeed(brand.performance?.speed || "");
        setZero(brand.performance?.zero || "");
        setHp(brand.performance?.hp || "");
        setEngine(brand.performance?.engine || "");

        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleHeroFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHeroFile(file);
            setHeroPreview(URL.createObjectURL(file));
        }
    };

    const handleAddWhyChoose = () => {
        if (whyChooseInput.trim()) {
            setWhyChoose([...whyChoose, whyChooseInput.trim()]);
            setWhyChooseInput("");
        }
    };

    const handleRemoveWhyChoose = (index) => {
        setWhyChoose(whyChoose.filter((_, i) => i !== index));
    };

    const handleAddPopularModel = () => {
        if (popularModelsInput.trim()) {
            setPopularModels([...popularModels, popularModelsInput.trim()]);
            setPopularModelsInput("");
        }
    };

    const handleRemovePopularModel = (index) => {
        setPopularModels(popularModels.filter((_, i) => i !== index));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        // Auto-generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        try {
            let finalLogoPath = logo;
            let finalHeroPath = heroCar;

            // 1. Upload logo if file is selected
            if (logoFile) {
                toast.loading("Uploading brand logo...", { id: "brand-upload" });
                const uploadedUrls = await uploadApi.uploadImages([logoFile]);
                if (uploadedUrls && uploadedUrls.length > 0) {
                    finalLogoPath = uploadedUrls[0];
                    toast.success("Logo uploaded!", { id: "brand-upload" });
                }
            }

            // 2. Upload hero image if file is selected
            if (heroFile) {
                toast.loading("Uploading hero car image...", { id: "hero-upload" });
                const uploadedUrls = await uploadApi.uploadImages([heroFile]);
                if (uploadedUrls && uploadedUrls.length > 0) {
                    finalHeroPath = uploadedUrls[0];
                    toast.success("Hero image uploaded!", { id: "hero-upload" });
                }
            }

            if (!finalLogoPath) {
                toast.error("Please select or upload a brand logo image.");
                setSubmitting(false);
                return;
            }

            const payload = { 
                name, 
                slug, 
                country, 
                logo: finalLogoPath, 
                description, 
                isActive,
                heroCar: finalHeroPath,
                foundedYear,
                overview,
                whyChoose,
                popularModels,
                performance: {
                    speed,
                    zero,
                    hp,
                    engine
                }
            };

            if (editMode) {
                await brandsApi.update(selectedBrandId, payload);
                toast.success("Brand updated successfully!", { id: "brand-save-status" });
            } else {
                await brandsApi.create(payload);
                toast.success("Brand added successfully!", { id: "brand-save-status" });
            }
            setShowModal(false);
            loadBrands();
        } catch (err) {
            console.error("Brand save error:", err);
            toast.error(err.response?.data?.message || "Operation failed.", { id: "brand-save-status" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this brand? This will break references for associated vehicles!")) return;
        
        try {
            await brandsApi.delete(id);
            toast.success("Brand deleted successfully.");
            loadBrands();
        } catch (err) {
            console.error("Failed to delete brand:", err);
            toast.error("Could not delete brand.");
        }
    };

    const getLogoUrl = (logoPath) => {
        if (!logoPath) return "";
        if (logoPath.startsWith("http")) return logoPath;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${logoPath}`;
    };

    return (
        <div className="admin-crud-panel">
            <div className="crud-header">
                <div>
                    <h1>Manage Brands</h1>
                    <p>Add, edit, or configure luxury car brands.</p>
                </div>
                <button className="add-record-btn" onClick={openAddModal}>
                    <FiPlus /> Add Brand
                </button>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Loading brands index...</p>
                </div>
            ) : (
                <>
                    {brands.length > 0 && (
                        <div className="brand-search-container">
                            <div className="brand-search-wrapper">
                                <FiSearch className="brand-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search brands by name or country..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="brand-search-input"
                                />
                                {searchQuery && (
                                    <button 
                                        type="button" 
                                        className="brand-search-clear"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <FiX />
                                    </button>
                                )}
                            </div>
                            <div className="brand-count-badge">
                                <span>
                                    {filteredBrands.length} {filteredBrands.length === 1 ? "Brand" : "Brands"}
                                </span>
                            </div>
                        </div>
                    )}

                    {brands.length === 0 ? (
                        <div className="empty-crud-state">
                            <h3>No Brands Seeded</h3>
                            <p>Click "Add Brand" to seed the first automobile manufacturer.</p>
                        </div>
                    ) : filteredBrands.length === 0 ? (
                        <div className="no-search-results">
                            <h3>No Matching Brands Found</h3>
                            <p>No brands match your search query "{searchQuery}".</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Logo</th>
                                            <th>Brand Name</th>
                                            <th>Origin Country</th>
                                            <th>Active Status</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedBrands.map((brand) => (
                                            <tr key={brand._id}>
                                                <td className="logo-cell">
                                                    <img src={getLogoUrl(brand.logo)} alt={brand.name} />
                                                </td>
                                                <td>
                                                    <strong>{brand.name}</strong>
                                                </td>
                                                <td>
                                                    <span className="country-badge">
                                                        {getCountryFlag(brand.country) ? (
                                                            <span className="country-flag-emoji" style={{ fontSize: "16px", lineHeight: 1 }}>
                                                                {getCountryFlag(brand.country)}
                                                            </span>
                                                        ) : (
                                                            <FiGlobe />
                                                        )}
                                                        {brand.country || "Unknown"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {brand.isActive ? (
                                                        <span className="badge-status success"><FiEye /> Active</span>
                                                    ) : (
                                                        <span className="badge-status danger"><FiEyeOff /> Suspended</span>
                                                    )}
                                                </td>
                                                <td className="text-right actions-cell">
                                                    <button className="edit-btn" onClick={() => openEditModal(brand)} title="Edit Brand">
                                                        <FiEdit />
                                                    </button>
                                                    <button className="delete-btn" onClick={() => handleDelete(brand._id)} title="Delete Brand">
                                                        <FiTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Pagination Footer (PAGE SIZE + Pagination Controls) ── */}
                            <div className="cars-pagination-footer">
                                <div className="cars-pagesize-group">
                                    <label htmlFor="brands-pagesize-select" className="cars-pagesize-label">PAGE SIZE</label>
                                    <PremiumSelect
                                        id="brands-pagesize-select"
                                        value={pageSize}
                                        onChange={(e) => setPageSize(e.target.value)}
                                        options={[
                                            { value: "5",  label: "5 / Page" },
                                            { value: "10", label: "10 / Page" },
                                            { value: "20", label: "20 / Page" },
                                            { value: "50", label: "50 / Page" },
                                            { value: "all", label: "All" }
                                        ]}
                                        dropUp={true}
                                    />
                                </div>

                                {totalPages > 1 && (
                                    <div className="cars-pagination-controls">
                                        <button
                                            className="cars-pagination-btn"
                                            disabled={validPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            Previous
                                        </button>

                                        {pageNumbers.map(num => (
                                            <button
                                                key={num}
                                                className={`cars-pagination-btn ${validPage === num ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(num)}
                                            >
                                                {num}
                                            </button>
                                        ))}

                                        <button
                                            className="cars-pagination-btn"
                                            disabled={validPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Modal Overlay Form */}
            {showModal && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card large">
                        <div className="modal-header">
                            <h3>{editMode ? "Edit Luxury Brand" : "Add Luxury Brand"}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="modal-form">
                            {/* Section: Basic Brand Details */}
                            <span className="modal-section-title">Basic Information</span>
                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Brand Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Ferrari, Rolls-Royce" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                    />
                                </div>

                                <div className="modal-form-group">
                                    <label>Origin Country</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Italy, United Kingdom" 
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Founded Year</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 1947" 
                                        value={foundedYear}
                                        onChange={(e) => setFoundedYear(e.target.value)}
                                    />
                                </div>
                                <div className="modal-form-group checkbox-container">
                                    <label className="checkbox-label-wrapper">
                                        <input 
                                            type="checkbox" 
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                        />
                                        <span>Brand is Active (Visible on catalog)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Section: Upload Logo & Hero Car Image */}
                            <span className="modal-section-title">Graphics & Imagery</span>
                            <div className="modal-form-row">
                                <div className="modal-form-group upload-zone-group">
                                    <label>Brand Logo Image</label>
                                    <label className="modal-file-upload-card">
                                        <FiCamera className="upload-icon" />
                                        <span>Select Logo Image</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange}
                                            className="hidden-file-input"
                                        />
                                    </label>
                                </div>
                                <div className="modal-form-group upload-zone-group">
                                    <label>Hero Car Showcase Image</label>
                                    <label className="modal-file-upload-card">
                                        <FiCamera className="upload-icon" />
                                        <span>Select Hero Car Image</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleHeroFileChange}
                                            className="hidden-file-input"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Logo Preview</label>
                                    <div className="modal-image-previews-list">
                                        {logoPreview ? (
                                            <div className="modal-img-card" style={{ width: "100%", height: "80px" }}>
                                                <img src={logoPreview} alt="Logo Preview" style={{ objectFit: "contain" }} />
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: "12px", color: "#8a8a93" }}>No logo uploaded</span>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-form-group">
                                    <label>Hero Car Preview</label>
                                    <div className="modal-image-previews-list">
                                        {heroPreview ? (
                                            <div className="hero-preview-wrapper">
                                                <img src={heroPreview} alt="Hero Car Preview" />
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: "12px", color: "#8a8a93" }}>No hero image uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Overview & Description Text */}
                            <span className="modal-section-title">Brand Text Descriptions</span>
                            <div className="modal-form-group">
                                <label>Short Description (Used in tables/lists)</label>
                                <textarea 
                                    placeholder="Provide a brief history summary..." 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="2"
                                    required
                                ></textarea>
                            </div>

                            <div className="modal-form-group">
                                <label>Detailed Showcase Overview</label>
                                <textarea 
                                    placeholder="Detailed overview for the brand showcase panel..." 
                                    value={overview}
                                    onChange={(e) => setOverview(e.target.value)}
                                    rows="3"
                                ></textarea>
                            </div>

                            {/* Section: Why Choose Brand and Popular Models Lists */}
                            <span className="modal-section-title">Showcase Lists</span>
                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Why Choose This Brand</label>
                                    <div className="dynamic-list-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="e.g. F1 Racing Heritage" 
                                            value={whyChooseInput}
                                            onChange={(e) => setWhyChooseInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddWhyChoose();
                                                }
                                            }}
                                        />
                                        <button type="button" className="dynamic-list-add-btn" onClick={handleAddWhyChoose}>
                                            Add
                                        </button>
                                    </div>
                                    <div className="dynamic-items-container">
                                        {whyChoose.length === 0 ? (
                                            <span style={{ fontSize: "11px", color: "#8a8a93" }}>No items added yet</span>
                                        ) : (
                                            whyChoose.map((item, index) => (
                                                <div key={index} className="dynamic-item-tag">
                                                    <span>{item}</span>
                                                    <button type="button" className="remove-tag-btn" onClick={() => handleRemoveWhyChoose(index)}>
                                                        &times;
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="modal-form-group">
                                    <label>Popular Models</label>
                                    <div className="dynamic-list-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="e.g. SF90 Stradale" 
                                            value={popularModelsInput}
                                            onChange={(e) => setPopularModelsInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddPopularModel();
                                                }
                                            }}
                                        />
                                        <button type="button" className="dynamic-list-add-btn" onClick={handleAddPopularModel}>
                                            Add
                                        </button>
                                    </div>
                                    <div className="dynamic-items-container">
                                        {popularModels.length === 0 ? (
                                            <span style={{ fontSize: "11px", color: "#8a8a93" }}>No models added yet</span>
                                        ) : (
                                            popularModels.map((item, index) => (
                                                <div key={index} className="dynamic-item-tag">
                                                    <span>{item}</span>
                                                    <button type="button" className="remove-tag-btn" onClick={() => handleRemovePopularModel(index)}>
                                                        &times;
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Performance stats */}
                            <span className="modal-section-title">Performance Metrics</span>
                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Top Speed (e.g. 340 km/h)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 340 km/h" 
                                        value={speed}
                                        onChange={(e) => setSpeed(e.target.value)}
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label>0–100 km/h (e.g. 2.5 sec)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 2.5 sec" 
                                        value={zero}
                                        onChange={(e) => setZero(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Horsepower (e.g. 1000 HP)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 1000 HP" 
                                        value={hp}
                                        onChange={(e) => setHp(e.target.value)}
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label>Engine Configuration (e.g. V8 Twin-Turbo)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 4.0L Twin-Turbo V8 Hybrid" 
                                        value={engine}
                                        onChange={(e) => setEngine(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions-buttons">
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? "Saving..." : "Save Brand Details"}
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

export default AdminBrands;
