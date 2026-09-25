import express from "express";
import cors from "cors";
import carRoutes from "./routes/carRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import testDriveRoutes from "./routes/testDriveRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import path from "path";
import uploadRoutes from "./routes/uploadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import sellCarRoutes from "./routes/sellCarRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import heroSettingsRoutes from "./routes/heroSettingsRoutes.js";
import footerSettingsRoutes from "./routes/footerSettingsRoutes.js";
import brandShowcaseSettingsRoutes from "./routes/brandShowcaseSettingsRoutes.js";
import aboutSettingsRoutes from "./routes/aboutSettingsRoutes.js";
import contactSettingsRoutes from "./routes/contactSettingsRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import newsletterCampaignRoutes from "./routes/newsletterCampaignRoutes.js";
import notFound from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import helmet from "helmet";
import morgan from "morgan";
import limiter from "./middleware/rateLimitMiddleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan("dev"));
app.use(limiter);

app.get("/", (req, res) => {
    res.send("Luxury Automobile Showroom API is Running...");
});

app.use("/api/cars", carRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/test-drives", testDriveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads", { maxAge: "1d", etag: true }));
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/sell-cars", sellCarRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/hero-settings", heroSettingsRoutes);
app.use("/api/footer-settings", footerSettingsRoutes);
app.use("/api/brand-showcase-settings", brandShowcaseSettingsRoutes);
app.use("/api/about-settings", aboutSettingsRoutes);
app.use("/api/contact-settings", contactSettingsRoutes);
app.use("/api/newsletter/campaigns", newsletterCampaignRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
app.use(notFound);
app.use(errorMiddleware);

export default app;