import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Brand from "./models/Brand.js";
import Car from "./models/Car.js";
import FAQ from "./models/FAQ.js";
import Admin from "./models/Admin.js";
import Settings from "./models/Settings.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/luxury_showroom";

const seedDatabase = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for seeding...");

        // 1. Clear existing data
        await Brand.deleteMany();
        await Car.deleteMany();
        await FAQ.deleteMany();
        await Admin.deleteMany();
        await Settings.deleteMany();
        console.log("Cleared existing database collections.");

        // 2. Create Default Admin (admin@mail.com / admin)
        const hashedPassword = await bcrypt.hash("admin", 10);
        const admin = await Admin.create({
            name: "Showroom Admin",
            email: "admin@mail.com",
            password: hashedPassword
        });
        console.log(`Created default admin account: ${admin.email} / admin`);

        // 3. Create Brands (logos served locally from backend)
        const brandData = [
            {
                name: "Rolls-Royce",
                slug: "rolls-royce",
                logo: "https://logo.clearbit.com/rolls-roycemotorcars.com",
                heroCar: "/uploads/rolls-royce.png",
                foundedYear: "1906",
                country: "United Kingdom",
                description: "Rolls-Royce Motor Cars is a British luxury automobile maker, representing the pinnacle of automotive craftsmanship.",
                overview: "Rolls-Royce Motor Cars represents the pinnacle of luxury motoring. Handcrafted in Goodwood, England, every vehicle is a bespoke masterpiece designed to offer an exquisite, whisper-quiet sanctuary on wheels.",
                whyChoose: [
                    "Bespoke Personalization",
                    "Iconic Starlight Headliner",
                    "Whisper-Quiet V12 Power",
                    "Famous 'Magic Carpet Ride'",
                    "Pinnacle of Handcrafted Artistry"
                ],
                popularModels: ["Phantom", "Cullinan", "Ghost", "Spectre"],
                performance: {
                    speed: "250 km/h",
                    zero: "4.5 sec",
                    hp: "563 HP",
                    engine: "6.75L Twin-Turbo V12"
                },
                isActive: true
            },
            {
                name: "Ferrari",
                slug: "ferrari",
                logo: "https://logo.clearbit.com/ferrari.com",
                heroCar: "/uploads/ferrari.png",
                foundedYear: "1947",
                country: "Italy",
                description: "Ferrari S.p.A. is an Italian luxury sports car manufacturer based in Maranello, Italy, legendary in motorsports.",
                overview: "Ferrari is the world's most iconic luxury performance manufacturer. Born from Formula 1 racing heritage, every Ferrari combines cutting-edge engineering, Italian craftsmanship, and raw emotional driving dynamics.",
                whyChoose: [
                    "Formula 1 Racing Heritage",
                    "Screaming V8 & V12 Engines",
                    "Bespoke Italian Styling",
                    "Cutting-edge Hybrid Innovation",
                    "High-end Performance Dynamics"
                ],
                popularModels: ["SF90 Stradale", "296 GTB", "Roma", "Purosangue"],
                performance: {
                    speed: "340 km/h",
                    zero: "2.5 sec",
                    hp: "1000 HP",
                    engine: "Twin-Turbo V8 Hybrid"
                },
                isActive: true
            },
            {
                name: "Lamborghini",
                slug: "lamborghini",
                logo: "https://logo.clearbit.com/lamborghini.com",
                heroCar: "/uploads/lamborghini.png",
                foundedYear: "1963",
                country: "Italy",
                description: "Automobili Lamborghini S.p.A. is an Italian brand and manufacturer of luxury supercars and SUVs.",
                overview: "Automobili Lamborghini crafts aggressive, uncompromising super sports cars and super SUVs. Renowned for sharp angles, roaring naturally aspirated V10/V12 engines, and futuristic, bold designs.",
                whyChoose: [
                    "Aggressive Fighter-Jet Design",
                    "Raw Naturally Aspirated Power",
                    "Advanced Active Aerodynamics",
                    "Exclusive Ad Personam Program",
                    "Visceral Exhaust Symphony"
                ],
                popularModels: ["Revuelto", "Huracan Tecnica", "Urus Performante", "Temerario"],
                performance: {
                    speed: "350 km/h",
                    zero: "2.5 sec",
                    hp: "1015 HP",
                    engine: "6.5L V12 Hybrid"
                },
                isActive: true
            },
            {
                name: "Porsche",
                slug: "porsche",
                logo: "https://logo.clearbit.com/porsche.com",
                heroCar: "/uploads/porsche.png",
                foundedYear: "1931",
                country: "Germany",
                description: "Porsche AG is a German automobile manufacturer specializing in high-performance sports cars, SUVs and sedans.",
                overview: "Porsche represents precision engineering, timeless design, and high-performance racing pedigree. Famous for building the iconic 911, Porsche blends daily usability with track-ready performance.",
                whyChoose: [
                    "Daily Usable Supercars",
                    "Legendary Rear-Engine Layout",
                    "Lightning-Fast PDK Gearbox",
                    "Precision German Handling",
                    "Incredible Track Reliability"
                ],
                popularModels: ["911 GT3 RS", "Taycan Turbo S", "Cayenne Turbo", "Panamera"],
                performance: {
                    speed: "320 km/h",
                    zero: "2.7 sec",
                    hp: "525 HP",
                    engine: "4.0L Naturally Aspirated Flat-6"
                },
                isActive: true
            },
            {
                name: "Bentley",
                slug: "bentley",
                logo: "https://logo.clearbit.com/bentleymotors.com",
                heroCar: "/uploads/bentley.png",
                foundedYear: "1919",
                country: "United Kingdom",
                description: "Bentley Motors Limited is a British designer, manufacturer and marketer of luxury cars and SUVs.",
                overview: "Bentley Motors blends exhilarating grand touring power with exquisite British handcraftsmanship. Bentley cars deliver effortless torque, luxurious comfort, and commanding road presence.",
                whyChoose: [
                    "Exquisite Hand-Stitched Leather",
                    "Masterful Wood Veneers",
                    "Effortless Grand Touring Range",
                    "Custom Mulliner Personalization",
                    "High-Torque Performance"
                ],
                popularModels: ["Continental GT", "Flying Spur", "Bentayga EWB", "Batur"],
                performance: {
                    speed: "335 km/h",
                    zero: "3.6 sec",
                    hp: "650 HP",
                    engine: "6.0L Twin-Turbo W12"
                },
                isActive: true
            },
            {
                name: "BMW",
                slug: "bmw",
                logo: "https://logo.clearbit.com/bmw.com",
                heroCar: "/uploads/bmw.png",
                foundedYear: "1916",
                country: "Germany",
                description: "Bayerische Motoren Werke AG, commonly referred to as BMW, is a German multinational manufacturer of luxury vehicles and motorcycles.",
                overview: "BMW is the creator of 'The Ultimate Driving Machine'. By combining high-revving M-power engines, driver-focused suspension tuning, and state-of-the-art tech, BMW defines sporty luxury.",
                whyChoose: [
                    "Driver-Focused Cockpit Layout",
                    "High-Performance M Division",
                    "State-of-the-Art Connected Tech",
                    "Dynamic Rear-Wheel Drive",
                    "Bold and Modern Aesthetics"
                ],
                popularModels: ["M8 Competition", "X7 M60i", "i7 M70 xDrive", "XM Label Red"],
                performance: {
                    speed: "290 km/h",
                    zero: "3.2 sec",
                    hp: "625 HP",
                    engine: "4.4L M TwinPower Turbo V8"
                },
                isActive: true
            },
            {
                name: "Mercedes-Benz",
                slug: "mercedes-benz",
                logo: "https://logo.clearbit.com/mercedes-benz.com",
                heroCar: "/uploads/mercedes-benz.png",
                foundedYear: "1926",
                country: "Germany",
                description: "Mercedes-Benz is a German global automobile marque and a division of Daimler AG, known for premium luxury vehicles.",
                overview: "Mercedes-Benz delivers 'The Best or Nothing'. As pioneers of safety, tech, and unmatched comfort, Mercedes-Benz sets the industry standard for executive luxury and high-performance AMG vehicles.",
                whyChoose: [
                    "Industry-Leading Safety Tech",
                    "Roaring AMG V8 Soundtracks",
                    "Maybach High-End Luxury",
                    "Panoramic MBUX Hyperscreen",
                    "Supreme S-Class Comfort"
                ],
                popularModels: ["AMG GT 63 S", "Maybach S680", "G63 AMG", "SL 63 Roadster"],
                performance: {
                    speed: "315 km/h",
                    zero: "3.2 sec",
                    hp: "630 HP",
                    engine: "4.0L Biturbo AMG V8"
                },
                isActive: true
            },
            {
                name: "Aston Martin",
                slug: "aston-martin",
                logo: "https://logo.clearbit.com/astonmartin.com",
                heroCar: "/uploads/aston-martin.png",
                foundedYear: "1913",
                country: "United Kingdom",
                description: "Aston Martin Lagonda Global Holdings plc is a British independent manufacturer of luxury sports cars and grand tourers.",
                overview: "Aston Martin combines classic British elegance with aggressive sportscar dynamics. Every model represents a passionate blend of beauty, soul, and high-performance grand touring engineering.",
                whyChoose: [
                    "Timeless British Elegance",
                    "Formula 1 Aero Innovation",
                    "Glorious Exhaust Soundtracks",
                    "Handcrafted Q Customization",
                    "Iconic Grand Touring Heritage"
                ],
                popularModels: ["DB12 Volante", "DBS 770 Ultimate", "Vantage", "DBX707 SUV"],
                performance: {
                    speed: "325 km/h",
                    zero: "3.6 sec",
                    hp: "680 HP",
                    engine: "4.0L Twin-Turbo V8"
                },
                isActive: true
            }
        ];

        const brands = await Brand.create(brandData);
        console.log(`Seeded ${brands.length} luxury brands.`);

        // Map Brands by Slug for easy reference
        const brandMap = {};
        brands.forEach(b => {
            brandMap[b.slug] = b._id;
        });

        // 4. Create Cars with 8-10 high-quality photos each
        const carData = [
            {
                name: "SF90 Stradale",
                brandId: brandMap["ferrari"],
                model: "SF90",
                slug: "ferrari-sf90-stradale",
                year: 2025,
                condition: "New",
                price: 75000000,
                currency: "INR",
                priceOnCall: false,
                mileage: 0,
                engine: "4.0L Twin-Turbo V8 Hybrid",
                transmission: "Automatic",
                fuelType: "Hybrid",
                status: "Available",
                featured: true,
                images: [
                    "https://images.unsplash.com/photo-1594732101037-fe77b4c6e94a?w=800",
                    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
                    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800",
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
                    "https://images.unsplash.com/photo-1605558158312-98a12169693a?w=800",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"
                ]
            },
            {
                name: "Phantom VIII",
                brandId: brandMap["rolls-royce"],
                model: "Phantom",
                slug: "rolls-royce-phantom-viii",
                year: 2025,
                condition: "New",
                price: 95000000,
                currency: "INR",
                priceOnCall: false,
                mileage: 0,
                engine: "6.75L Twin-Turbo V12",
                transmission: "Automatic",
                fuelType: "Petrol",
                status: "Available",
                featured: true,
                images: [
                    "https://images.unsplash.com/photo-1636836109641-3db21a22ad3b?w=800",
                    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800",
                    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800",
                    "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800",
                    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=800",
                    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
                    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"
                ]
            },
            {
                name: "Huracan Tecnica",
                brandId: brandMap["lamborghini"],
                model: "Huracan",
                slug: "lamborghini-huracan-tecnica",
                year: 2024,
                condition: "Used",
                price: 40000000,
                currency: "INR",
                priceOnCall: false,
                mileage: 1450,
                engine: "5.2L V10",
                transmission: "Automatic",
                fuelType: "Petrol",
                status: "Available",
                featured: true,
                images: [
                    "https://images.unsplash.com/photo-1566008889981-d0b81c2f1f4b?w=800",
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
                    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
                    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
                    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=800",
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800"
                ]
            },
            {
                name: "911 GT3 RS",
                brandId: brandMap["porsche"],
                model: "911",
                slug: "porsche-911-gt3-rs",
                year: 2025,
                condition: "New",
                price: 35000000,
                currency: "INR",
                priceOnCall: false,
                mileage: 10,
                engine: "4.0L Flat-6 Naturally Aspirated",
                transmission: "Automatic",
                fuelType: "Petrol",
                status: "Available",
                featured: true,
                images: [
                    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
                    "https://images.unsplash.com/photo-1611245801083-f03d7e4663d2?w=800",
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
                    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
                    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=800",
                    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800"
                ]
            },
            {
                name: "Continental GT V8",
                brandId: brandMap["bentley"],
                model: "Continental GT",
                slug: "bentley-continental-gt-v8",
                year: 2025,
                condition: "New",
                price: 45000000,
                currency: "INR",
                priceOnCall: false,
                mileage: 0,
                engine: "4.0L Twin-Turbo V8",
                transmission: "Automatic",
                fuelType: "Petrol",
                status: "Available",
                featured: true,
                images: [
                    "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800",
                    "https://images.unsplash.com/photo-1562911772-294068f886e0?w=800",
                    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800",
                    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800",
                    "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800",
                    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=800",
                    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
                    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800"
                ]
            },
            {
                name: "X7 M60i xDrive",
                brandId: brandMap["bmw"],
                model: "X7",
                slug: "bmw-x7-m60i-xdrive",
                year: 2025,
                condition: "New",
                price: 18000000,
                currency: "INR",
                priceOnCall: false,
                mileage: 5,
                engine: "4.4L Twin-Turbo V8",
                transmission: "Automatic",
                fuelType: "Petrol",
                status: "Available",
                featured: false,
                images: [
                    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
                    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
                    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=800",
                    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800",
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800"
                ]
            },
            {
                name: "Maybach S680",
                brandId: brandMap["mercedes-benz"],
                model: "Maybach S-Class",
                slug: "mercedes-benz-maybach-s680",
                year: 2025,
                condition: "New",
                price: 34000000,
                currency: "INR",
                priceOnCall: false,
                mileage: 0,
                engine: "6.0L Biturbo V12",
                transmission: "Automatic",
                fuelType: "Petrol",
                status: "Available",
                featured: false,
                images: [
                    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
                    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
                    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=800",
                    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800",
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800"
                ]
            },
            {
                name: "DB12 Volante",
                brandId: brandMap["aston-martin"],
                model: "DB12",
                slug: "aston-martin-db12-volante",
                year: 2025,
                condition: "New",
                price: 48000000,
                currency: "INR",
                priceOnCall: false,
                mileage: 0,
                engine: "4.0L Twin-Turbo V8",
                transmission: "Automatic",
                fuelType: "Petrol",
                status: "Available",
                featured: true,
                images: [
                    "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=800",
                    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
                    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
                    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?w=800",
                    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800",
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800"
                ]
            }
        ];

        const cars = await Car.create(carData);
        console.log(`Seeded ${cars.length} vehicles.`);

        // 5. Create FAQs
        const faqData = [
            {
                question: "Do you offer financing options for exotic cars?",
                answer: "Yes, we work with premium banking institutions to provide tailored low-interest financing solutions up to 60 months for qualified buyers.",
                category: "financing",
                keywords: ["financing", "finance", "loan", "bank"]
            },
            {
                question: "How do I schedule a viewing or a test drive?",
                answer: "You can book a test drive or showroom viewing appointment directly through our online Booking page, or call us at +971 4 000 0000 to speak with a sales advisor.",
                category: "booking",
                keywords: ["test drive", "viewing", "appointment", "schedule", "book"]
            },
            {
                question: "How does the 'Sell Your Car' process work?",
                answer: "Simply submit your vehicle details, mileage, and photos through our 'Sell Your Car' page. Our valuation team will review it and make a competitive cash or trade-in offer within 24 hours.",
                category: "sell-process",
                keywords: ["sell my car", "evaluation", "valuation", "trade in", "sell"]
            },
            {
                question: "Do your pre-owned vehicles come with a warranty?",
                answer: "Absolutely. All our premium pre-owned vehicles undergo a rigorous 150-point inspection and come with a minimum 12-month mileage-unlimited warranty, extendable up to 36 months.",
                category: "warranty",
                keywords: ["warranty", "guarantee", "certified", "inspection"]
            },
            {
                question: "What are your showroom location and operating hours?",
                answer: "Our main showroom is located on Sheikh Zayed Road, Al Quoz 3, Dubai. We are open Monday to Saturday from 9:00 AM to 9:00 PM, and Sunday from 2:00 PM to 8:00 PM.",
                category: "location",
                keywords: ["hours", "location", "address", "open", "timing", "dubai"]
            },
            {
                question: "Do you support global shipping and export services?",
                answer: "Yes, we provide door-to-door global shipping, custom clearance, and export documentation services to over 80 countries worldwide.",
                category: "import-export",
                keywords: ["export", "shipping", "import", "global", "deliver"]
            }
        ];

        const faqs = await FAQ.create(faqData);
        console.log(`Seeded ${faqs.length} chatbot FAQs.`);

        // 6. Create default sync settings
        const settings = await Settings.create({
            googleSheetUrl: "",
            syncEnabled: false,
            syncIntervalMinutes: 60
        });
        console.log("Seeded initial system settings.");

        console.log("🎉 Seeding Database Complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding Database Failed:", err);
        process.exit(1);
    }
};

seedDatabase();
