import { useState, useEffect } from "react";
import { carsApi, brandsApi, uploadApi } from "../../services/api";
import { toast } from "react-hot-toast";
import { FiPlus, FiEdit, FiTrash, FiCheckCircle, FiXCircle, FiSliders, FiCamera, FiSearch, FiX, FiRotateCcw } from "react-icons/fi";
import PremiumSelect from "./PremiumSelect";
import "./AdminCommon.css";

const optimizeImage = (file) => {
    return new Promise((resolve) => {
        if (file.size < 250 * 1024) {
            return resolve(file);
        }

        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result;
        };

        img.onload = () => {
            const maxDimension = 1920;
            let width = img.width;
            let height = img.height;

            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            } else {
                return resolve(file);
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const optimizedFile = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now()
                        });
                        resolve(optimizedFile);
                    } else {
                        resolve(file);
                    }
                },
                "image/jpeg",
                0.82
            );
        };

        img.onerror = () => {
            resolve(file);
        };

        reader.readAsDataURL(file);
    });
};

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
    const [draggedIndex, setDraggedIndex] = useState(null);
    
    // Image Upload states
    const [uploadQueue, setUploadQueue] = useState([]);
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

    // ── Pagination state ──
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize]       = useState("10");

    const closeModal = () => {
        setShowModal(false);
        uploadQueue.forEach(item => {
            if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        setUploadQueue([]);
    };

    const uploadFile = async (itemToUpload) => {
        const { id, file } = itemToUpload;

        setUploadQueue(prev => prev.map(item => {
            if (item.id === id) return { ...item, status: "compressing" };
            return item;
        }));

        try {
            const optimized = await optimizeImage(file);

            setUploadQueue(prev => prev.map(item => {
                if (item.id === id) return { ...item, status: "uploading" };
                return item;
            }));

            const formData = new FormData();
            formData.append("images", optimized);

            const res = await uploadApi.uploadImagesSingle(formData, (progress) => {
                setUploadQueue(prev => prev.map(item => {
                    if (item.id === id) return { ...item, progress };
                    return item;
                }));
            });

            if (res && res.length > 0) {
                setUploadQueue(prev => prev.map(item => {
                    if (item.id === id) return { ...item, status: "success", uploadedUrl: res[0], progress: 100 };
                    return item;
                }));
            } else {
                throw new Error("Empty upload response");
            }
        } catch (err) {
            console.error("Upload failed for item", id, err);
            setUploadQueue(prev => prev.map(item => {
                if (item.id === id) return { ...item, status: "failed", error: err.response?.data?.message || err.message || "Upload failed" };
                return item;
            }));
        }
    };

    useEffect(() => {
        const activeCount = uploadQueue.filter(item => item.status === "compressing" || item.status === "uploading").length;
        const limit = 3;
        if (activeCount < limit) {
            const nextIdle = uploadQueue.find(item => item.status === "idle");
            if (nextIdle) {
                uploadFile(nextIdle);
            }
        }
    }, [uploadQueue]);

    useEffect(() => {
        return () => {
            uploadQueue.forEach(item => {
                if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
            });
        };
    }, []);

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
        setCurrentPage(1);
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
        uploadQueue.forEach(item => {
            if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        setUploadQueue([]);
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
        uploadQueue.forEach(item => {
            if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        setUploadQueue([]);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newQueueItems = [];
        for (const file of files) {
            const isDuplicate = uploadQueue.some(item => 
                item.file.name === file.name && 
                item.file.size === file.size && 
                item.file.lastModified === file.lastModified
            );
            if (isDuplicate) continue;

            const previewUrl = URL.createObjectURL(file);
            newQueueItems.push({
                id: Date.now() + "-" + Math.random().toString(36).substr(2, 9),
                file,
                previewUrl,
                status: "idle",
                progress: 0,
                uploadedUrl: "",
                error: ""
            });
        }

        setUploadQueue(prev => [...prev, ...newQueueItems]);
    };

    const handleRemoveQueueItem = (id) => {
        setUploadQueue(prev => {
            const target = prev.find(item => item.id === id);
            if (target && target.previewUrl) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter(item => item.id !== id);
        });
    };

    const handleRetryUpload = (id) => {
        setUploadQueue(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, status: "idle", progress: 0, error: "" };
            }
            return item;
        }));
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.classList.add("dragging");
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove("dragging");
        setDraggedIndex(null);
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const updated = [...existingImages];
        const [draggedItem] = updated.splice(draggedIndex, 1);
        updated.splice(targetIndex, 0, draggedItem);

        setExistingImages(updated);
        setDraggedIndex(null);
    };

    const handleRemoveExistingImage = (idx) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Check if there are active or pending uploads in the queue
        const pendingUploads = uploadQueue.filter(item => item.status === "idle" || item.status === "compressing" || item.status === "uploading");
        if (pendingUploads.length > 0) {
            toast.error("Please wait for all images to finish uploading.");
            return;
        }

        const failedUploads = uploadQueue.filter(item => item.status === "failed");
        if (failedUploads.length > 0) {
            if (!window.confirm(`There are ${failedUploads.length} failed image upload(s). Do you want to save the car details without these images?`)) {
                return;
            }
        }

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
            // Collect successful uploaded paths
            const uploadedImageUrls = uploadQueue
                .filter(item => item.status === "success")
                .map(item => item.uploadedUrl);

            // Combine with remaining existing images
            const finalImages = [...existingImages, ...uploadedImageUrls];

            const payload = {
                name,
                brandId,
                model,
                slug,
                year: parseInt(year),
                condition,
                status, // Pass status to request
                price: parseFloat(price) || 0,
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
                toast.success("Car updated successfully!");
            } else {
                await carsApi.create(payload);
                toast.success("Car added successfully!");
            }

            closeModal();
            loadData();
        } catch (err) {
            console.error("Car save error:", err);
            const errMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Operation failed.";
            toast.error(errMsg);
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

    // ── Reset pagination on search or filter change ──
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterBrand, filterStatus, filterFeatured, filterCondition, filterFuelType, filterTransmission, filterYear, filterPriceOnCall, sortOption]);

    // ── Pagination calculations ──
    const limit = pageSize === "all" ? (filteredAndSortedCars.length || 1) : Number(pageSize);
    const totalPages = Math.ceil(filteredAndSortedCars.length / limit) || 1;
    const validPage = Math.min(Math.max(1, currentPage), totalPages);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [pageSize, filteredAndSortedCars.length, totalPages, currentPage]);

    const startIndex = (validPage - 1) * limit;
    const endIndex   = pageSize === "all" ? filteredAndSortedCars.length : Math.min(startIndex + limit, filteredAndSortedCars.length);
    const paginatedCars = filteredAndSortedCars.slice(startIndex, endIndex);

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
                        <>
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
                                        {paginatedCars.map((car) => (
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

                            {/* ── Pagination Footer (PAGE SIZE + Pagination Controls) ── */}
                            <div className="cars-pagination-footer">
                                <div className="cars-pagesize-group">
                                    <label htmlFor="cars-pagesize-select" className="cars-pagesize-label">PAGE SIZE</label>
                                    <PremiumSelect
                                        id="cars-pagesize-select"
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
                            <h3>{editMode ? "Edit Vehicle Details" : "Add Vehicle Details"}</h3>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
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
                                            <div 
                                                className="modal-img-card draggable-img-card" 
                                                key={index}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onDrop={(e) => handleDrop(e, index)}
                                            >
                                                <img src={getImageUrl(img)} alt="Active" />
                                                <button 
                                                    type="button" 
                                                    className="remove-img-btn" 
                                                    onClick={() => handleRemoveExistingImage(index)}
                                                    style={{ zIndex: 10 }}
                                                >
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

                            {/* Upload progress & queue stats */}
                            {uploadQueue.length > 0 && (
                                <div className="modal-form-group">
                                    <div className="upload-queue-summary" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <label style={{ margin: 0 }}>
                                            Selected Images ({uploadQueue.length})
                                        </label>
                                        <span style={{ fontSize: "12px", color: "#8a8a93", fontWeight: "600" }}>
                                            Uploaded: {uploadQueue.filter(i => i.status === "success").length} | Remaining: {uploadQueue.filter(i => i.status === "idle" || i.status === "compressing" || i.status === "uploading").length} | Failed: {uploadQueue.filter(i => i.status === "failed").length}
                                        </span>
                                    </div>
                                    <div className="modal-image-previews-list">
                                        {uploadQueue.map((item) => (
                                            <div className="modal-img-card" key={item.id}>
                                                <img src={item.previewUrl} alt="New Preview" />
                                                <button 
                                                    type="button" 
                                                    className="remove-img-btn" 
                                                    onClick={() => handleRemoveQueueItem(item.id)}
                                                    title="Remove selected file"
                                                >
                                                    &times;
                                                </button>
                                                <div className="upload-status-overlay">
                                                    {item.status === "compressing" && <span className="status-lbl text-comp">Resizing...</span>}
                                                    {item.status === "uploading" && <span className="status-lbl text-upload">{item.progress}%</span>}
                                                    {item.status === "success" && <span className="status-lbl text-success">✓</span>}
                                                    {item.status === "failed" && (
                                                        <div className="fail-container">
                                                            <span className="status-lbl text-fail" title={item.error}>Failed</span>
                                                            <button 
                                                                type="button" 
                                                                className="retry-mini-btn" 
                                                                onClick={() => handleRetryUpload(item.id)}
                                                            >
                                                                Retry
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions-buttons">
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? "Saving details..." : "Save Vehicle"}
                                </button>
                                <button type="button" className="cancel-btn" onClick={closeModal}>
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
