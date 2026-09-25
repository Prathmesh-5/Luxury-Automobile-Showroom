import { google } from "googleapis";
import crypto from "crypto";
import Settings from "../models/Settings.js";
import Brand from "../models/Brand.js";
import Car from "../models/Car.js";

export const HEADERS = [
    "Vehicle ID",
    "Name",
    "Brand",
    "Model",
    "Year",
    "Condition",
    "Price",
    "Mileage",
    "Engine",
    "Transmission",
    "FuelType",
    "Featured",
    "Priority",
    "Availability"
];

// Normalize values before hashing or storing to ensure equivalence
export const normalizeValue = (val, type) => {
    if (val === undefined || val === null) return "";
    
    if (type === "boolean") {
        const str = String(val).trim().toLowerCase();
        return (str === "true" || val === true || str === "yes" || str === "1") ? "TRUE" : "FALSE";
    }
    
    if (type === "number") {
        const str = String(val).replace(/,/g, "").trim();
        if (str === "") return "";
        const num = parseFloat(str);
        return isNaN(num) ? "" : String(num);
    }

    if (type === "priority") {
        const str = String(val).replace(/,/g, "").trim();
        const num = parseInt(str, 10);
        if (isNaN(num) || num === 9999 || num < 1) {
            return "9999";
        }
        return String(num);
    }
    
    if (type === "availability") {
        const str = String(val).trim().toLowerCase();
        if (str.includes("sold")) return "Sold";
        return "Available";
    }
    
    // Default text normalization (trim, collapse spaces, lowercase)
    return String(val).trim().replace(/\s+/g, " ").toLowerCase();
};

export const calculateVehicleHash = (carData) => {
    const isPriceOnCall = carData.priceOnCall || 
        carData.price === "" || 
        carData.price === undefined || 
        carData.price === null;
    const normalizedPrice = isPriceOnCall ? "" : normalizeValue(carData.price, "number");

    const fields = [
        normalizeValue(carData.name, "text"),
        normalizeValue(carData.brandName || (carData.brandId && carData.brandId.name) || "", "text"),
        normalizeValue(carData.model, "text"),
        normalizeValue(carData.year, "number"),
        normalizeValue(carData.condition, "text"),
        normalizedPrice,
        normalizeValue(carData.mileage, "number"),
        normalizeValue(carData.engine, "text"),
        normalizeValue(carData.transmission, "text"),
        normalizeValue(carData.fuelType, "text"),
        normalizeValue(carData.featured, "boolean"),
        normalizeValue(carData.featuredPriority !== undefined ? carData.featuredPriority : carData.Priority, "priority"),
        normalizeValue(carData.status || carData.availability, "availability")
    ];
    return crypto.createHash("md5").update(fields.join("|")).digest("hex");
};

// Helper to get authenticated Google Sheets client
const getSheetsClient = async (settings) => {
    const credsVar = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!credsVar) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured in the Backend .env file.");
    }
    
    let credentials;
    try {
        credentials = JSON.parse(credsVar);
    } catch (e) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON in .env is not a valid JSON string.");
    }

    let key = credentials.private_key;
    if (key && key.includes("\\n")) {
        key = key.replace(/\\n/g, "\n");
    }
    
    const auth = new google.auth.JWT({
        email: credentials.client_email,
        key: key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    
    return google.sheets({ version: "v4", auth });
};

// Map row array to object based on header indices
const mapRowToObject = (row, headerIndices) => {
    const getValue = (headerName) => {
        const idx = headerIndices[headerName];
        return idx !== undefined && idx < row.length ? row[idx] : "";
    };
    
    return {
        vehicleId: getValue("Vehicle ID"),
        name: getValue("Name"),
        brandName: getValue("Brand"),
        model: getValue("Model"),
        year: getValue("Year"),
        condition: getValue("Condition"),
        price: getValue("Price"),
        mileage: getValue("Mileage"),
        engine: getValue("Engine"),
        transmission: getValue("Transmission"),
        fuelType: getValue("FuelType"),
        featured: getValue("Featured"),
        featuredPriority: getValue("Priority"),
        availability: getValue("Availability")
    };
};

// Map object to row array based on header indices
const mapObjectToRow = (carObj, headerIndices) => {
    const row = [];
    const setVal = (headerName, value) => {
        const idx = headerIndices[headerName];
        if (idx !== undefined) {
            row[idx] = value;
        }
    };
    
    setVal("Vehicle ID", String(carObj._id));
    setVal("Name", carObj.name);
    setVal("Brand", carObj.brandName || (carObj.brandId && carObj.brandId.name) || "");
    setVal("Model", carObj.model);
    setVal("Year", String(carObj.year));
    setVal("Condition", carObj.condition);
    if (carObj.priceOnCall) {
        setVal("Price", "");
    } else {
        setVal("Price", String(carObj.price));
    }
    setVal("Mileage", String(carObj.mileage));
    setVal("Engine", carObj.engine || "");
    setVal("Transmission", carObj.transmission);
    setVal("FuelType", carObj.fuelType);
    setVal("Featured", normalizeValue(carObj.featured, "boolean"));
    
    const featuredVal = normalizeValue(carObj.featured, "boolean") === "TRUE";
    const priorityVal = carObj.featuredPriority !== undefined ? carObj.featuredPriority : 9999;
    const sheetPriority = (featuredVal && priorityVal !== 9999) ? String(priorityVal) : "";
    setVal("Priority", sheetPriority);
    
    setVal("Availability", carObj.status === "Sold" ? "Sold" : "Available");
    
    // Fill gaps
    for (let i = 0; i < HEADERS.length; i++) {
        if (row[i] === undefined) row[i] = "";
    }
    return row;
};

// Compare two rows cell-by-cell on a normalized basis
export const areRowValuesEquivalent = (rowA, rowB, headerIndices) => {
    const fields = [
        { name: "Vehicle ID", type: "text" },
        { name: "Name", type: "text" },
        { name: "Brand", type: "text" },
        { name: "Model", type: "text" },
        { name: "Year", type: "number" },
        { name: "Condition", type: "text" },
        { name: "Price", type: "number" },
        { name: "Mileage", type: "number" },
        { name: "Engine", type: "text" },
        { name: "Transmission", type: "text" },
        { name: "FuelType", type: "text" },
        { name: "Featured", type: "boolean" },
        { name: "Priority", type: "priority" },
        { name: "Availability", type: "availability" }
    ];

    for (let field of fields) {
        const idx = headerIndices[field.name];
        if (idx === undefined) continue;
        const valA = idx < rowA.length ? rowA[idx] : "";
        const valB = idx < rowB.length ? rowB[idx] : "";
        if (normalizeValue(valA, field.type) !== normalizeValue(valB, field.type)) {
            return false;
        }
    }
    return true;
};

// Trigger manual/scheduled sync
export const triggerSync = async () => {
    console.log("[SYNC] Started");
    let settings = await Settings.findOne();
    if (!settings || !settings.googleSpreadsheetId || !settings.syncEnabled) {
        console.log("ℹ️ Sync is disabled or Spreadsheet ID is not configured.");
        console.log("[SYNC] Completed");
        return { success: false, message: "Sync is disabled or Spreadsheet ID is not configured." };
    }

    const errors = [];
    let carsCreated = 0;
    let carsUpdated = 0;
    let sheetRowsAdded = 0;
    let sheetRowsUpdated = 0;
    let unmatchedRows = 0;
    let conflicts = 0;

    try {
        const sheets = await getSheetsClient(settings);
        const spreadsheetId = settings.googleSpreadsheetId;
        const sheetName = settings.googleSheetName || "Sheet1";

        // Read all values
        let response;
        try {
            response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A:N`
            });
        } catch (err) {
            throw new Error(`Failed to fetch sheet data: ${err.message}. Please check if the spreadsheet ID is correct.`);
        }

        let rows = response.data.values || [];
        if (rows.length === 0) {
            // Write headers if sheet is empty
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1:N1`,
                valueInputOption: "RAW",
                requestBody: { values: [HEADERS] }
            });
            rows = [HEADERS];
        }

        const headers = rows[0].map(h => h.trim());
        const headerIndices = {};
        HEADERS.forEach(h => {
            const idx = headers.indexOf(h);
            if (idx !== -1) {
                headerIndices[h] = idx;
            } else {
                headers.push(h);
                headerIndices[h] = headers.length - 1;
            }
        });

        // Write expanded headers back if columns changed
        if (headers.length > rows[0].length) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!1:1`,
                valueInputOption: "RAW",
                requestBody: { values: [headers] }
            });
        }

        // Fetch MongoDB cars
        const cars = await Car.find().populate("brandId", "name");
        const dbCarsMap = new Map();
        cars.forEach(car => dbCarsMap.set(String(car._id), car));

        const processedIds = new Set();
        const sheetRowsCount = rows.length - 1;

        // Process sheet rows
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue;

            const rowObj = mapRowToObject(row, headerIndices);
            const vehicleId = rowObj.vehicleId ? rowObj.vehicleId.trim() : "";

            if (vehicleId) {
                processedIds.add(vehicleId);
                const car = dbCarsMap.get(vehicleId);

                if (car) {
                    const dbHash = calculateVehicleHash(car);
                    const sheetHash = calculateVehicleHash(rowObj);

                    // CASE 1: In sync
                    if (dbHash === sheetHash) {
                        if (car.lastSyncedHash !== dbHash) {
                            car.lastSyncedHash = dbHash;
                            await car.save();
                        }
                        continue;
                    }

                    const lastSyncedHash = car.lastSyncedHash;

                    // CASE 2: MongoDB / Admin UI changed
                    if (dbHash !== lastSyncedHash && sheetHash === lastSyncedHash) {
                        const updatedRow = mapObjectToRow(car, headerIndices);
                        if (!areRowValuesEquivalent(row, updatedRow, headerIndices)) {
                            await sheets.spreadsheets.values.update({
                                spreadsheetId,
                                range: `${sheetName}!A${i + 1}:N${i + 1}`,
                                valueInputOption: "RAW",
                                requestBody: { values: [updatedRow] }
                            });
                            sheetRowsUpdated++;
                        }
                        car.lastSyncedHash = dbHash;
                        await car.save();
                    }
                    // CASE 3: Google Sheets changed
                    else if (sheetHash !== lastSyncedHash && dbHash === lastSyncedHash) {
                        const brandName = rowObj.brandName.trim();
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
                        }

                        let isModified = false;
                        if (normalizeValue(car.name, "text") !== normalizeValue(rowObj.name, "text")) { car.name = rowObj.name; isModified = true; }
                        if (String(car.brandId) !== String(brand._id)) { car.brandId = brand._id; isModified = true; }
                        if (normalizeValue(car.model, "text") !== normalizeValue(rowObj.model, "text")) { car.model = rowObj.model; isModified = true; }
                        if (normalizeValue(car.year, "number") !== normalizeValue(rowObj.year, "number")) { car.year = parseInt(rowObj.year) || car.year; isModified = true; }
                        if (normalizeValue(car.condition, "text") !== normalizeValue(rowObj.condition, "text")) { car.condition = ["New", "Used"].includes(rowObj.condition) ? rowObj.condition : car.condition; isModified = true; }
                        const isSheetPriceBlank = !rowObj.price || !rowObj.price.trim();
                        if (isSheetPriceBlank) {
                            if (!car.priceOnCall) {
                                car.priceOnCall = true;
                                isModified = true;
                            }
                        } else {
                            if (car.priceOnCall) {
                                car.priceOnCall = false;
                                isModified = true;
                            }
                            const parsedPrice = parseFloat(rowObj.price) || 0;
                            if (car.price !== parsedPrice) {
                                car.price = parsedPrice;
                                isModified = true;
                            }
                        }
                        if (normalizeValue(car.mileage, "number") !== normalizeValue(rowObj.mileage, "number")) { car.mileage = parseInt(rowObj.mileage) || 0; isModified = true; }
                        if (normalizeValue(car.engine, "text") !== normalizeValue(rowObj.engine, "text")) { car.engine = rowObj.engine; isModified = true; }
                        if (normalizeValue(car.transmission, "text") !== normalizeValue(rowObj.transmission, "text")) { car.transmission = ["Automatic", "Manual"].includes(rowObj.transmission) ? rowObj.transmission : car.transmission; isModified = true; }
                        if (normalizeValue(car.fuelType, "text") !== normalizeValue(rowObj.fuelType, "text")) { car.fuelType = ["Petrol", "Diesel", "Hybrid", "Electric"].includes(rowObj.fuelType) ? rowObj.fuelType : car.fuelType; isModified = true; }
                        if (normalizeValue(car.featured, "boolean") !== normalizeValue(rowObj.featured, "boolean")) {
                            car.featured = normalizeValue(rowObj.featured, "boolean") === "TRUE";
                            isModified = true;
                        }
                        const parsedPriority = parseInt(rowObj.featuredPriority, 10);
                        const targetPriority = car.featured ? ((!isNaN(parsedPriority) && parsedPriority >= 1) ? parsedPriority : 9999) : 9999;
                        if (car.featuredPriority !== targetPriority) {
                            car.featuredPriority = targetPriority;
                            isModified = true;
                        }
                        
                        const rowStatus = rowObj.availability.toLowerCase().includes("sold") ? "Sold" : "Available";
                        if (normalizeValue(car.status, "availability") !== normalizeValue(rowObj.availability, "availability")) { car.status = rowStatus; isModified = true; }

                        if (isModified || car.lastSyncedHash !== sheetHash) {
                            car.lastSyncedHash = sheetHash;
                            await car.save();
                            carsUpdated++;
                        }
                    }
                    // CASE 4: CONFLICT. MongoDB/Admin UI wins
                    else {
                        const updatedRow = mapObjectToRow(car, headerIndices);
                        if (!areRowValuesEquivalent(row, updatedRow, headerIndices)) {
                            await sheets.spreadsheets.values.update({
                                spreadsheetId,
                                range: `${sheetName}!A${i + 1}:N${i + 1}`,
                                valueInputOption: "RAW",
                                requestBody: { values: [updatedRow] }
                            });
                            sheetRowsUpdated++;
                        }
                        car.lastSyncedHash = dbHash;
                        await car.save();
                        conflicts++;
                    }
                } else {
                    unmatchedRows++;
                    errors.push(`Row ${i + 1}: Reference ID '${vehicleId}' not found in MongoDB. Skipping.`);
                }
            } else {
                // New row in Google Sheets (Vehicle ID is empty)
                const brandName = rowObj.brandName.trim();
                if (!rowObj.name || !brandName || !rowObj.model) {
                    errors.push(`Row ${i + 1}: Missing Name, Brand, or Model. Cannot auto-create vehicle.`);
                    continue;
                }

                // Loop Prevention check: Check for duplicates to link instead of creating duplicate MongoDB record
                let matchedCar = cars.find(car => {
                    const dbName = (car.name || "").trim().toLowerCase();
                    const dbBrand = (car.brandId && car.brandId.name || "").trim().toLowerCase();
                    return dbName === rowObj.name.trim().toLowerCase() && dbBrand === brandName.toLowerCase();
                });

                if (matchedCar) {
                    processedIds.add(String(matchedCar._id));
                    const updatedRow = mapObjectToRow(matchedCar, headerIndices);
                    await sheets.spreadsheets.values.update({
                        spreadsheetId,
                        range: `${sheetName}!A${i + 1}:N${i + 1}`,
                        valueInputOption: "RAW",
                        requestBody: { values: [updatedRow] }
                    });
                    matchedCar.lastSyncedHash = calculateVehicleHash(matchedCar);
                    await matchedCar.save();
                    sheetRowsUpdated++;
                    console.log(`[SYNC] Linked existing MongoDB vehicle (ID: ${matchedCar._id}) to sheet row ${i + 1}`);
                    continue;
                }

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
                }

                const slug = `${brandSlug}-${rowObj.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
                const newCarData = {
                    name: rowObj.name,
                    brandId: brand._id,
                    model: rowObj.model,
                    slug,
                    year: parseInt(rowObj.year) || 2026,
                    condition: ["New", "Used"].includes(rowObj.condition) ? rowObj.condition : "Used",
                    priceOnCall: !rowObj.price || !rowObj.price.trim(),
                    price: parseFloat(rowObj.price) || 0,
                    mileage: parseInt(rowObj.mileage) || 0,
                    engine: rowObj.engine || "",
                    transmission: ["Automatic", "Manual"].includes(rowObj.transmission) ? rowObj.transmission : "Automatic",
                    fuelType: ["Petrol", "Diesel", "Hybrid", "Electric"].includes(rowObj.fuelType) ? rowObj.fuelType : "Petrol",
                    featured: normalizeValue(rowObj.featured, "boolean") === "TRUE",
                    featuredPriority: (() => {
                        const isFeatured = normalizeValue(rowObj.featured, "boolean") === "TRUE";
                        const parsedPriority = parseInt(rowObj.featuredPriority, 10);
                        return isFeatured ? ((!isNaN(parsedPriority) && parsedPriority >= 1) ? parsedPriority : 9999) : 9999;
                    })(),
                    status: rowObj.availability.toLowerCase().includes("sold") ? "Sold" : "Available",
                    images: []
                };

                const initialHash = calculateVehicleHash({
                    ...newCarData,
                    brandName: brand.name
                });
                newCarData.lastSyncedHash = initialHash;

                const newCar = await Car.create(newCarData);
                processedIds.add(String(newCar._id));
                carsCreated++;
                sheetRowsAdded++;

                const updatedRow = mapObjectToRow(newCar, headerIndices);
                updatedRow[headerIndices["Brand"]] = brand.name;

                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `${sheetName}!A${i + 1}:N${i + 1}`,
                    valueInputOption: "RAW",
                    requestBody: { values: [updatedRow] }
                });
            }
        }

        // Accidental Deletion Safeguard
        dbCarsMap.forEach((car, id) => {
            if (!processedIds.has(id)) {
                console.warn(`⚠️ Warning: Vehicle '${car.name}' (ID: ${id}) is missing from the Google Sheet rows. Safeguard triggered - keeping MongoDB record.`);
                errors.push(`Vehicle ID '${id}' ('${car.name}') is missing from the Google Sheet. Safeguard preserved this record in MongoDB.`);
            }
        });

        settings.lastSyncTime = new Date();
        settings.syncErrors = errors;
        await settings.save();

        console.log(`[SYNC] Sheet rows read: ${sheetRowsCount}`);
        console.log(`[SYNC] Cars created: ${carsCreated}`);
        console.log(`[SYNC] Cars updated: ${carsUpdated}`);
        console.log(`[SYNC] Sheet rows added: ${sheetRowsAdded}`);
        console.log(`[SYNC] Sheet rows updated: ${sheetRowsUpdated}`);
        console.log(`[SYNC] Unmatched rows: ${unmatchedRows}`);
        console.log(`[SYNC] Conflicts: ${conflicts}`);
        console.log(`[SYNC] Errors: ${errors.length}`);
        console.log("[SYNC] Completed");

        return { success: true, count: carsCreated + carsUpdated + sheetRowsUpdated, errors };

    } catch (err) {
        console.error("❌ Sync Error:", err);
        settings.syncErrors = [err.message];
        await settings.save();
        console.log("[SYNC] Completed");
        return { success: false, message: err.message };
    }
};

// Real-time synchronization back to Google Sheets when created/updated/deleted from Admin UI
export const syncVehicleToSheets = async (carId) => {
    try {
        const settings = await Settings.findOne();
        if (!settings || !settings.googleSpreadsheetId || !settings.syncEnabled) return;

        const sheets = await getSheetsClient(settings);
        const spreadsheetId = settings.googleSpreadsheetId;
        const sheetName = settings.googleSheetName || "Sheet1";

        const car = await Car.findById(carId).populate("brandId", "name");
        if (!car) return;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:N`
        });

        const rows = response.data.values || [];
        if (rows.length === 0) return;

        const headers = rows[0].map(h => h.trim());
        const headerIndices = {};
        HEADERS.forEach(h => {
            const idx = headers.indexOf(h);
            headerIndices[h] = idx !== -1 ? idx : headers.length;
        });

        let foundRowIndex = -1;
        const idColIdx = headerIndices["Vehicle ID"];
        if (idColIdx !== undefined) {
            for (let i = 1; i < rows.length; i++) {
                if (rows[i] && rows[i][idColIdx] === String(car._id)) {
                    foundRowIndex = i + 1;
                    break;
                }
            }
        }

        const rowData = mapObjectToRow(car, headerIndices);

        if (foundRowIndex !== -1) {
            const existingRow = rows[foundRowIndex - 1];
            // Cell-by-cell write protection check before triggering Google API update
            if (!areRowValuesEquivalent(existingRow, rowData, headerIndices)) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `${sheetName}!A${foundRowIndex}:N${foundRowIndex}`,
                    valueInputOption: "RAW",
                    requestBody: { values: [rowData] }
                });
                console.log(`✏️ Real-time: Updated Sheets row ${foundRowIndex} for vehicle: ${car.name}`);
            } else {
                console.log(`✏️ Real-time: Sheets row ${foundRowIndex} is already equivalent. Skip write.`);
            }
        } else {
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A:N`,
                valueInputOption: "RAW",
                requestBody: { values: [rowData] }
            });
            console.log(`🆕 Real-time: Appended vehicle ${car.name} to Google Sheets`);
        }

        car.lastSyncedHash = calculateVehicleHash(car);
        await car.save();

    } catch (err) {
        console.error("❌ Real-time Sync Error:", err.message);
    }
};

// Scheduler variables
let syncIntervalId = null;

export const startSyncScheduler = async () => {
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
        syncIntervalId = null;
    }

    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({
            googleSpreadsheetId: "",
            googleSheetName: "Sheet1",
            syncEnabled: false,
            syncIntervalMinutes: 5
        });
    }

    if (settings.syncEnabled && settings.googleSpreadsheetId) {
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
