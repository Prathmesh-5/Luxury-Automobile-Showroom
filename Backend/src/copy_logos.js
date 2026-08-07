import fs from "fs";
import path from "path";

const srcDir = "c:/Users/HP/Downloads/Luxury-Automobile-Showroom/Frontend/src/assets/images/brands";
const destDir = "c:/Users/HP/Downloads/Luxury-Automobile-Showroom/Backend/uploads";

const mappings = {
    "mercedes.png": "mercedes-benz.png",
    "bmw.png": "bmw.png",
    "audi.png": "audi.png",
    "rolls.png": "rolls-royce.png",
    "ferrari.png": "ferrari.png",
    "lamborghini.png": "lamborghini.png",
    "porsche.png": "porsche.png",
    "bentley.png": "bentley.png",
    "mclaren.png": "mclaren.png",
    "astonmartin.png": "aston-martin.png"
};

const copyLogos = () => {
    try {
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        Object.entries(mappings).forEach(([srcFile, destFile]) => {
            const srcPath = path.join(srcDir, srcFile);
            const destPath = path.join(destDir, destFile);

            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`✅ Copied: ${srcFile} ➔ ${destFile}`);
            } else {
                console.warn(`⚠️ Source file not found: ${srcPath}`);
            }
        });
        console.log("🎉 Logo copying complete!");
    } catch (err) {
        console.error("❌ Copy Error:", err);
    }
};

copyLogos();
