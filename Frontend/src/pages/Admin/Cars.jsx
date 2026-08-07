import { useState, useEffect } from "react";
import { carsApi, brandsApi, uploadApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiPlus, FiEdit, FiTrash, FiCheckCircle, FiXCircle, FiSliders, FiCamera, FiSearch, FiX, FiRotateCcw } from "react-icons/fi";
import PremiumSelect from "./PremiumSelect";
import "./AdminCommon.css";


function AdminCars() {
    const [cars, setCars] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCarId, setSelectedCarId] = useState(null);

    // Form inputs
    const [name, setName] = useState("");
    const [brandId, setBrandId] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [condition, setCondition] = useState("Used");
    const [status, setStatus] = useState("Available"); // Added status state
    const [price, setPrice] = useState("");
    const [priceOnCall, setPriceOnCall] = useState(false);
    const [mileage, setMileage] = useState("");
    const [engine, setEngine] = useState("");
    const [transmission, setTransmission] = useState("Automatic");
    const [fuelType, setFuelType] = useState("Petrol");
    const [featured, setFeatured] = useState(false);
    const [featuredPriority, setFeaturedPriority] = useState("");
    const [existingImages, setExistingImages] = useState([]);
    
    // Image Upload states
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // ── Search / Filter / Sort state ──
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBrand, setFilterBrand] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterFeatured, setFilterFeatured] = useState("");
    const [filterCondition, setFilterCondition] = useState("");
    const [filterFuelType, setFilterFuelType] = useState("");
    const [filterTransmission, setFilterTransmission] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterPriceOnCall, setFilterPriceOnCall] = useState("");
    const [sortOption, setSortOption] = useState("latest");

    const resetFilters = () => {
        setSearchQuery("");
        setFilterBrand("");
        setFilterStatus("");
        setFilterFeatured("");
        setFilterCondition("");
        setFilterFuelType("");
        setFilterTransmission("");
        setFilterYear("");
        setFilterPriceOnCall("");
        setSortOption("latest");
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const carsList = await carsApi.getAll({ limit: 100 });
            setCars(carsList.data || []);
            
            const brandsList = await brandsApi.getAll();
            setBrands(brandsList || []);
        } catch (err) {
            console.error("Failed to load inventory:", err);
            toast.error("Inventory failed to load.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openAddModal = () => {
        setEditMode(false);
        setName("");
        setBrandId(brands.length > 0 ? brands[0]._id : "");
        setModel("");
        setYear("");
        setCondition("Used");
        setStatus("Available"); // Reset to Available
        setPrice("");
        setPriceOnCall(false);
        setMileage("");
        setEngine("");
        setTransmission("Automatic");
        setFuelType("Petrol");
        setFeatured(false);
        setFeaturedPriority("");
        setExistingImages([]);
        setSelectedFiles([]);
        setPreviews([]);
        setShowModal(true);
    };

    const openEditModal = (car) => {
        setEditMode(true);
        setSelectedCarId(car._id);
        setName(car.name);
        setBrandId(car.brandId?._id || car.brandId || "");
        setModel(car.model);
        setYear(car.year);
        setCondition(car.condition);
        setStatus(car.status || "Available"); // Set status from loaded car
        setPrice(car.price);
        setPriceOnCall(car.priceOnCall || false);
        setMileage(car.mileage || 0);
        setEngine(car.engine || "");
        setTransmission(car.transmission || "Automatic");
        setFuelType(car.fuelType || "Petrol");
        setFeatured(car.featured || false);
        setFeaturedPriority(car.featuredPriority !== undefined && car.featuredPriority !== 9999 ? car.featuredPriority.toString() : "");
        setExistingImages(car.images || []);
        setSelectedFiles([]);
        setPreviews([]);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);

        // Previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const handleRemoveExistingImage = (idx) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Frontend Validation for Featured Priority
        if (featured) {
            const cleanPriority = typeof featuredPriority === "string" ? featuredPriority.trim() : String(featuredPriority || "").trim();
            if (cleanPriority !== "") {
                const priorityNum = Number(cleanPriority);
                if (!Number.isInteger(priorityNum) || priorityNum < 1) {
                    toast.error("Featured Priority must be a positive integer starting from 1.");
                    return;
                }
            }
        }

        setSubmitting(true);

        const selectedBrand = brands.find(b => b._id === brandId);
        const brandSlug = selectedBrand ? selectedBrand.slug : "car";
        
        // Auto-generate slug
        const slug = `${brandSlug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

        try {
            let uploadedImageUrls = [];
            
            // 1. Upload new files if any
            if (selectedFiles.length > 0) {
                toast.loading("Uploading vehicle images...", { id: "car-upload" });
                uploadedImageUrls = await uploadApi.uploadImages(selectedFiles);
                toast.success("Images uploaded successfully!", { id: "car-upload" });
            }

            // 2. Combine with remaining existing images
            const finalImages = [...existingImages, ...uploadedImageUrls];

            const payload = {
                name,
                brandId,
                model,
                slug,
                year: parseInt(year),
                condition,
                status, // Pass status to request
                price: parseFloat(price),
                priceOnCall,
                mileage: parseInt(mileage) || 0,
                engine,
                transmission,
                fuelType,
                featured,
                featuredPriority: featured ? (featuredPriority !== "" ? parseInt(featuredPriority) : 9999) : 9999,
                images: finalImages
            };

            if (editMode) {
                await carsApi.update(selectedCarId, payload);
                toast.success("Car updated successfully!", { id: "car-upload" });
            } else {
                await carsApi.create(payload);
                toast.success("Car added successfully!", { id: "car-upload" });
            }

            setShowModal(false);
            loadData();
        } catch (err) {
            console.error("Car save error:", err);
            toast.error(err.response?.data?.message || "Operation failed.", { id: "car-upload" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vehicle from active inventory?")) return;
        
        try {
            await carsApi.delete(id);
            toast.success("Vehicle deleted successfully.");
            loadData();
        } catch (err) {
            console.error("Failed to delete car:", err);
            toast.error("Could not delete vehicle.");
        }
    };

    const getImageUrl = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=100";
        if (img.startsWith("http")) return img;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${img}`;
    };

    const formatPrice = (p) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(p);
    };

    // ── Dynamic option sets (derived from loaded cars, never hardcoded) ──
    const unique = (arr) => [...new Set(arr.filter(Boolean))].sort();

    const brandOptions       = unique(cars.map(c => c.brandId?.name));
    const statusOptions      = unique(cars.map(c => c.status));
    const conditionOptions   = unique(cars.map(c => c.condition));
    const fuelTypeOptions    = unique(cars.map(c => c.fuelType));
    const transmissionOpts   = unique(cars.map(c => c.transmission));
    const yearOptions        = [...new Set(cars.map(c => c.year).filter(Boolean))].sort((a, b) => b - a);

    // ── Search + Filter + Sort pipeline ──
    const filteredAndSortedCars = (() => {
        const q = searchQuery.trim().toLowerCase();

        let result = cars.filter(car => {
            // 1. Search
            if (q) {
                const brandName = (car.brandId?.name || "").toLowerCase();
                const carName   = (car.name  || "").toLowerCase();
                const carModel  = (car.model || "").toLowerCase();
                if (!carName.includes(q) && !carModel.includes(q) && !brandName.includes(q)) return false;
            }
            // 2. Brand
            if (filterBrand && (car.brandId?.name || "") !== filterBrand) return false;
            // 3. Status
            if (filterStatus && car.status !== filterStatus) return false;
            // 4. Featured
            if (filterFeatured === "yes" && !car.featured) return false;
            if (filterFeatured === "no"  &&  car.featured) return false;
            // 5. Condition
            if (filterCondition && car.condition !== filterCondition) return false;
            // 6. Fuel Type
            if (filterFuelType && car.fuelType !== filterFuelType) return false;
            // 7. Transmission
            if (filterTransmission && car.transmission !== filterTransmission) return false;
            // 8. Year
            if (filterYear && String(car.year) !== filterYear) return false;
            // 9. Price On Call
            if (filterPriceOnCall === "yes" && !car.priceOnCall) return false;
            if (filterPriceOnCall === "no"  &&  car.priceOnCall) return false;
            return true;
        });

        // 10. Sort
        result = [...result];
        switch (sortOption) {
            case "oldest":    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            case "price_asc": result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
            case "price_desc":result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
            case "year_desc": result.sort((a, b) => (b.year  || 0) - (a.year  || 0)); break;
            case "year_asc":  result.sort((a, b) => (a.year  || 0) - (b.year  || 0)); break;
            case "name_asc":  result.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
            case "name_desc": result.sort((a, b) => (b.name || "").localeCompare(a.name || "")); break;
            default:          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break; // latest
        }
        return result;
    })();

    // ── Active chips (one per active filter/search) ──
    const activeChips = [
        searchQuery.trim()  && { key: "search",       label: `"${searchQuery.trim()}"`,   clear: () => setSearchQuery("") },
        filterBrand         && { key: "brand",         label: filterBrand,                  clear: () => setFilterBrand("") },
        filterStatus        && { key: "status",        label: filterStatus,                 clear: () => setFilterStatus("") },
        filterFeatured      && { key: "featured",      label: filterFeatured === "yes" ? "Featured" : "Not Featured", clear: () => setFilterFeatured("") },
        filterCondition     && { key: "condition",     label: filterCondition,              clear: () => setFilterCondition("") },
        filterFuelType      && { key: "fuelType",      label: filterFuelType,               clear: () => setFilterFuelType("") },
        filterTransmission  && { key: "transmission",  label: filterTransmission,           clear: () => setFilterTransmission("") },
        filterYear          && { key: "year",          label: filterYear,                   clear: () => setFilterYear("") },
        filterPriceOnCall   && { key: "priceOnCall",   label: filterPriceOnCall === "yes" ? "Price On Call" : "Fixed Price", clear: () => setFilterPriceOnCall("") },
        (sortOption && sortOption !== "latest") && { key: "sort", label: {
            oldest: "Oldest First", price_asc: "Price ↑", price_desc: "Price ↓",
            year_desc: "Year ↓", year_asc: "Year ↑", name_asc: "A → Z", name_desc: "Z → A"
        }[sortOption], clear: () => setSortOption("latest") },
    ].filter(Boolean);

    const hasActiveFilters = activeChips.length > 0;

    return (
        <div className="admin-crud-panel">
            <div className="crud-header">
                <div>
                    <h1>Manage Cars</h1>
                    <p>Track, edit, or configure luxury car inventory.</p>
                </div>
                <button className="add-record-btn" onClick={openAddModal}>
                    <FiPlus /> Add Vehicle
                </button>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    <div className="spinner"></div>
                    <p>Loading catalog index...</p>
                </div>
            ) : cars.length === 0 ? (
                <div className="empty-crud-state">
                    <h3>No Cars Available</h3>
                    <p>Click "Add Vehicle" to register the first luxury supercar.</p>
                </div>
            ) : (
                <>
                    {/* ── Search Bar ── */}
                    <div className="cars-search-container">
                        <div className="cars-search-wrapper">
                            <FiSearch className="cars-search-icon" />
                            <input
                                id="cars-search-input"
                                type="text"
                                className="cars-search-input"
                                placeholder="Search by vehicle name, model or brand…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                            />
                            {searchQuery && (
                                <button
                                    className="cars-search-clear"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                    aria-label="Clear search"
                                >
                                    <FiX />
                                </button>
                            )}
                        </div>
                        <div className="cars-count-badge">
                            Showing {filteredAndSortedCars.length} of {cars.length} Cars
                        </div>
                    </div>

                    {/* ── Filter Row ── */}
                    <div className="cars-filter-row">
                        {/* Brand */}
                        <PremiumSelect
                            id="cars-filter-brand"
                            value={filterBrand}
                            onChange={(e) => setFilterBrand(e.target.value)}
                            options={[
                                { value: "", label: "All Brands" },
                                ...brandOptions.map(b => ({ value: b, label: b }))
                            ]}
                        />

                        {/* Availability */}
                        <PremiumSelect
                            id="cars-filter-status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={[
                                { value: "", label: "All Status" },
                                ...statusOptions.map(s => ({ value: s, label: s }))
                            ]}
                        />

                        {/* Featured */}
                        <PremiumSelect
                            id="cars-filter-featured"
                            value={filterFeatured}
                            onChange={(e) => setFilterFeatured(e.target.value)}
                            options={[
                                { value: "",    label: "All Featured" },
                                { value: "yes", label: "Featured" },
                                { value: "no",  label: "Not Featured" },
                            ]}
                        />

                        {/* Condition */}
                        <PremiumSelect
                            id="cars-filter-condition"
                            value={filterCondition}
                            onChange={(e) => setFilterCondition(e.target.value)}
                            options={[
                                { value: "", label: "All Conditions" },
                                ...conditionOptions.map(c => ({ value: c, label: c }))
                            ]}
                        />

                        {/* Fuel Type */}
                        <PremiumSelect
                            id="cars-filter-fuel"
                            value={filterFuelType}
                            onChange={(e) => setFilterFuelType(e.target.value)}
                            options={[
                                { value: "", label: "All Fuel Types" },
                                ...fuelTypeOptions.map(f => ({ value: f, label: f }))
                            ]}
                        />

                        {/* Transmission */}
                        <PremiumSelect
                            id="cars-filter-transmission"
                            value={filterTransmission}
                            onChange={(e) => setFilterTransmission(e.target.value)}
                            options={[
                                { value: "", label: "All Transmissions" },
                                ...transmissionOpts.map(t => ({ value: t, label: t }))
                            ]}
                        />

                        {/* Year */}
                        <PremiumSelect
                            id="cars-filter-year"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            options={[
                                { value: "", label: "All Years" },
                                ...yearOptions.map(y => ({ value: String(y), label: String(y) }))
                            ]}
                        />

                        {/* Price On Call */}
                        <PremiumSelect
                            id="cars-filter-priceoncall"
                            value={filterPriceOnCall}
                            onChange={(e) => setFilterPriceOnCall(e.target.value)}
                            options={[
                                { value: "",    label: "Price: All" },
                                { value: "yes", label: "Price On Call" },
                                { value: "no",  label: "Fixed Price" },
                            ]}
                        />

                        {/* Sort divider */}
                        <div className="cars-filter-sort-divider" />

                        {/* Sort */}
                        <PremiumSelect
                            id="cars-sort-select"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            options={[
                                { value: "latest",     label: "Latest Added" },
                                { value: "oldest",     label: "Oldest Added" },
                                { value: "price_asc",  label: "Price Low → High" },
                                { value: "price_desc", label: "Price High → Low" },
                                { value: "year_desc",  label: "Year Newest First" },
                                { value: "year_asc",   label: "Year Oldest First" },
                                { value: "name_asc",   label: "Name A → Z" },
                                { value: "name_desc",  label: "Name Z → A" },
                            ]}
                        />

                        {/* Reset */}
                        {hasActiveFilters && (
                            <button
                                id="cars-reset-filters-btn"
                                className="cars-reset-btn"
                                onClick={resetFilters}
                                title="Reset all filters"
                            >
                                <FiRotateCcw size={13} /> Reset Filters
                            </button>
                        )}
                    </div>


                    {/* ── Active Chips ── */}
                    {activeChips.length > 0 && (
                        <div className="cars-active-chips">
                            {activeChips.map(chip => (
                                <span key={chip.key} className="cars-chip">
                                    {chip.label}
                                    <button
                                        className="cars-chip-remove"
                                        onClick={chip.clear}
                                        title={`Remove ${chip.label} filter`}
                                        aria-label={`Remove ${chip.label} filter`}
                                    >
                                        <FiX />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ── Results Table or Empty State ── */}
                    {filteredAndSortedCars.length === 0 ? (
                        <div className="cars-no-results">
                            <span className="cars-no-results-icon">🔍</span>
                            <h3>No Matching Vehicles Found</h3>
                            <p>No vehicles match your current search or filters.<br />Try adjusting your criteria or clearing all filters.</p>
                            <button className="cars-no-results-reset" onClick={resetFilters}>
                                <FiRotateCcw size={14} /> Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Display</th>
                                        <th>Car Profile</th>
                                        <th>Specification</th>
                                        <th>Pricing</th>
                                        <th>Featured</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedCars.map((car) => (
                                        <tr key={car._id}>
                                            <td className="logo-cell">
                                                <img src={getImageUrl(car.images[0])} alt={car.name} />
                                            </td>
                                            <td>
                                                <strong className="car-title-strong">{car.name}</strong>
                                                <span className="car-brand-sub">
                                                    {car.brandId?.name || "Auto-Created"} - Model: {car.model}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="spec-tag-sub">{car.year} | {car.condition}</span>
                                                <span className="spec-tag-sub desc">{car.engine} | {car.transmission}</span>
                                            </td>
                                            <td>
                                                <strong>{car.priceOnCall ? "Price On Call" : formatPrice(car.price)}</strong>
                                            </td>
                                            <td>
                                                {car.featured ? (
                                                    <span className="badge-status success"><FiCheckCircle /> Yes</span>
                                                ) : (
                                                    <span className="badge-status danger"><FiXCircle /> No</span>
                                                )}
                                            </td>
                                            <td className="text-right actions-cell">
                                                <button className="edit-btn" onClick={() => openEditModal(car)} title="Edit Car">
                                                    <FiEdit />
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDelete(car._id)} title="Delete Car">
                                                    <FiTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Modal Overlay Form */}
            {showModal && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card large">
                        <div className="modal-header">
                            <h3>{editMode ? "Edit Vehicle Details" : "Add Vehicle Details"}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Vehicle Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. SF90 Stradale" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label>Brand Selection</label>
                                    <select 
                                        value={brandId}
                                        onChange={(e) => setBrandId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Model Variant</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. SF90" 
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label>Manufacture Year</label>
                                    <input 
                                        type="number" 
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        required 
                                        min="1990"
                                        max="2027"
                                    />
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Price (INR)</label>
                                    <input 
                                        type="number" 
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required={!priceOnCall}
                                        disabled={priceOnCall}
                                        min="0"
                                    />
                                </div>
                                <div className="modal-form-group checkbox-container align-end">
                                    <label className="checkbox-label-wrapper">
                                        <input 
                                            type="checkbox" 
                                            checked={priceOnCall}
                                            onChange={(e) => setPriceOnCall(e.target.checked)}
                                        />
                                        <span>Show "Price On Call"</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Mileage (Km)</label>
                                    <input 
                                        type="number" 
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        required 
                                        min="0"
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label>Engine Specifications</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 4.0L Twin-Turbo V8" 
                                        value={engine}
                                        onChange={(e) => setEngine(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Condition</label>
                                    <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                                        <option value="New">New Model (Arrival)</option>
                                        <option value="Used">Pre-Owned</option>
                                    </select>
                                </div>
                                <div className="modal-form-group">
                                    <label>Availability / Status</label>
                                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="Available">Available (For Sale)</option>
                                        <option value="Sold">Sold (Previously Sold)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label>Transmission</label>
                                    <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <div className="modal-form-group">
                                    <label>Fuel Type</label>
                                    <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group checkbox-container align-end">
                                    <label className="checkbox-label-wrapper">
                                        <input 
                                            type="checkbox" 
                                            checked={featured}
                                            onChange={(e) => setFeatured(e.target.checked)}
                                        />
                                        <span>Show on Featured Homepage</span>
                                    </label>
                                </div>
                                <div className="modal-form-group">
                                    {/* Spacing alignment */}
                                </div>
                            </div>

                            {featured && (
                                <div className="modal-form-row">
                                    <div className="modal-form-group">
                                        <label>Featured Priority</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            step="1"
                                            placeholder="e.g. 1" 
                                            value={featuredPriority}
                                            onChange={(e) => setFeaturedPriority(e.target.value)}
                                        />
                                        <span className="helper-text" style={{ fontSize: "11px", color: "#8a8a93", marginTop: "3px" }}>
                                            Lower number appears first on the Homepage. Example: 1 = First Featured Car, 2 = Second, 3 = Third
                                        </span>
                                    </div>
                                    <div className="modal-form-group">
                                        {/* Spacing alignment */}
                                    </div>
                                </div>
                            )}

                            {/* Existing Images panel */}
                            {existingImages.length > 0 && (
                                <div className="modal-form-group">
                                    <label>Active Images ({existingImages.length})</label>
                                    <div className="modal-image-previews-list">
                                        {existingImages.map((img, index) => (
                                            <div className="modal-img-card" key={index}>
                                                <img src={getImageUrl(img)} alt="Active" />
                                                <button type="button" className="remove-img-btn" onClick={() => handleRemoveExistingImage(index)}>
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload New Files */}
                            <div className="modal-form-group upload-zone-group">
                                <label>Upload Additional Images</label>
                                <label className="modal-file-upload-card">
                                    <FiCamera className="upload-icon" />
                                    <span>Browse Device Files</span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="hidden-file-input"
                                    />
                                </label>
                            </div>

                            {/* Previews grid */}
                            {previews.length > 0 && (
                                <div className="modal-form-group">
                                    <label>New Selected Previews ({previews.length})</label>
                                    <div className="modal-image-previews-list">
                                        {previews.map((src, index) => (
                                            <div className="modal-img-card" key={index}>
                                                <img src={src} alt="New Preview" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions-buttons">
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? "Saving details..." : "Save Vehicle"}
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

export default AdminCars;
