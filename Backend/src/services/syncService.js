import Settings from "../models/Settings.js";
import Brand from "../models/Brand.js";
import Car from "../models/Car.js";

// Custom CSV Parser that handles comma and quoted values correctly
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const result = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = [];
        let inQuotes = false;
        let cell = "";
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(cell.trim().replace(/^"|"$/g, ''));
                cell = "";
            } else {
                cell += char;
            }
        }
        row.push(cell.trim().replace(/^"|"$/g, ''));
        result.push(row);
    }
    return result;
}

export const triggerSync = async () => {
    let settings = await Settings.findOne();
    if (!settings || !settings.googleSheetUrl || !settings.syncEnabled) {
        console.log("ℹ️ Sync is disabled or no URL configured.");
        return { success: false, message: "Sync is disabled or URL not configured" };
    }

    console.log(`⏳ Starting sync from spreadsheet URL: ${settings.googleSheetUrl}`);
    const errors = [];
    const activeSlugs = [];

    try {
        const response = await fetch(settings.googleSheetUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
        }

        const csvText = await response.text();
        const rows = parseCSV(csvText);

        if (rows.length < 2) {
            throw new Error("Spreadsheet is empty or has no header row.");
        }

        const headers = rows[0].map(h => h.toLowerCase().trim());
        
        // Find column indices
        const nameIdx = headers.indexOf("name");
        const brandIdx = headers.indexOf("brand");
        const modelIdx = headers.indexOf("model");
        const yearIdx = headers.indexOf("year");
        const conditionIdx = headers.indexOf("condition");
        const priceIdx = headers.indexOf("price");
        const mileageIdx = headers.indexOf("mileage");
        const engineIdx = headers.indexOf("engine");
        const transmissionIdx = headers.indexOf("transmission");
        const fuelTypeIdx = headers.indexOf("fueltype");
        const featuredIdx = headers.indexOf("featured");
        const imagesIdx = headers.indexOf("images");

        if (nameIdx === -1 || brandIdx === -1 || modelIdx === -1 || yearIdx === -1 || conditionIdx === -1 || priceIdx === -1) {
            throw new Error("Spreadsheet is missing required headers: Name, Brand, Model, Year, Condition, Price");
        }

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            // Skip empty rows
            if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue;

            const name = row[nameIdx];
            const brandName = row[brandIdx];
            const modelName = row[modelIdx];
            const yearStr = row[yearIdx];
            const condition = row[conditionIdx];
            const priceStr = row[priceIdx];

            // Validation checks
            if (!name || !brandName || !modelName || !yearStr || !condition || !priceStr) {
                errors.push(`Row ${i + 1}: Missing required field (Name, Brand, Model, Year, Condition, or Price)`);
                continue;
            }

            const year = parseInt(yearStr);
            if (isNaN(year) || year < 1900 || year > 2100) {
                errors.push(`Row ${i + 1}: Invalid Year (${yearStr})`);
                continue;
            }

            const price = parseFloat(priceStr);
            if (isNaN(price) || price < 0) {
                errors.push(`Row ${i + 1}: Invalid Price (${priceStr})`);
                continue;
            }

            const validCondition = condition === "New" || condition === "Used" ? condition : "Used";
            const transmission = transmissionIdx !== -1 && (row[transmissionIdx] === "Automatic" || row[transmissionIdx] === "Manual") 
                ? row[transmissionIdx] 
                : "Automatic";
            
            const fuelTypeRaw = fuelTypeIdx !== -1 ? row[fuelTypeIdx] : "Petrol";
            const fuelType = ["Petrol", "Diesel", "Hybrid", "Electric"].includes(fuelTypeRaw) ? fuelTypeRaw : "Petrol";

            const mileage = mileageIdx !== -1 ? parseInt(row[mileageIdx]) || 0 : 0;
            const engine = engineIdx !== -1 ? row[engineIdx] || "" : "";
            const featured = featuredIdx !== -1 ? row[featuredIdx].toLowerCase() === "true" : false;
            
            const imagesRaw = imagesIdx !== -1 ? row[imagesIdx] : "";
            const images = imagesRaw ? imagesRaw.split(",").map(url => url.trim()).filter(url => url) : [];

            // Generate brand slug & find/create brand
            const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            let brand = await Brand.findOne({ slug: brandSlug });
            if (!brand) {
                brand = await Brand.create({
                    name: brandName,
                    slug: brandSlug,
                    country: "Unknown",
                    logo: "",
                    description: `Auto-created via inventory sync`,
                    isActive: true
                });
                console.log(`🆕 Auto-created brand: ${brandName}`);
            }

            // Generate car slug
            const carSlug = `${brandSlug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            activeSlugs.push(carSlug);

            const carData = {
                name,
                brandId: brand._id,
                model: modelName,
                slug: carSlug,
                year,
                condition: validCondition,
                price,
                currency: "INR",
                priceOnCall: false,
                mileage,
                engine,
                transmission,
                fuelType,
                status: "Available",
                featured,
                images
            };

            // Find and update or create
            await Car.findOneAndUpdate(
                { slug: carSlug },
                carData,
                { upsert: true, new: true, runValidators: true }
            );
        }

        // Delete cars not in spreadsheet (if sync clean)
        if (activeSlugs.length > 0) {
            const deleteResult = await Car.deleteMany({ slug: { $nin: activeSlugs } });
            console.log(`🗑️ Removed ${deleteResult.deletedCount} cars missing from spreadsheet`);
        }

        // Update settings status
        settings.lastSyncTime = new Date();
        settings.syncErrors = errors;
        await settings.save();

        console.log(`✅ Sync completed! Total records matched: ${activeSlugs.length}. Errors logged: ${errors.length}`);
        return { success: true, count: activeSlugs.length, errors };

    } catch (err) {
        console.error("❌ Sync Error:", err);
        settings.syncErrors = [err.message];
        await settings.save();
        return { success: false, message: err.message };
    }
};

// Scheduler variables
let syncIntervalId = null;

export const startSyncScheduler = async () => {
    // Stop existing scheduler if any
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
        syncIntervalId = null;
    }

    let settings = await Settings.findOne();
    if (!settings) {
        // Create initial default settings document
        settings = await Settings.create({
            googleSheetUrl: "",
            syncEnabled: false,
            syncIntervalMinutes: 60
        });
    }

    if (settings.syncEnabled && settings.googleSheetUrl) {
        const intervalMs = settings.syncIntervalMinutes * 60 * 1000;
        console.log(`🕒 Scheduling spreadsheet sync task to run every ${settings.syncIntervalMinutes} minutes.`);
        syncIntervalId = setInterval(async () => {
            try {
                await triggerSync();
            } catch (e) {
                console.error("Scheduler sync execution failed:", e);
            }
        }, intervalMs);
    }
};
