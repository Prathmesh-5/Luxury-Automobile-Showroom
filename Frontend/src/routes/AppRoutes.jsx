import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// User Pages
import Home from "../pages/Home/Home.jsx";
import Cars from "../pages/Cars/Cars.jsx";
import CarDetails from "../pages/CarDetails/CarDetails.jsx";
import About from "../pages/About/About.jsx";
import Contact from "../pages/Contact/Contact.jsx";
import TestDrive from "../pages/TestDrive/TestDrive.jsx";
import SellYourCar from "../pages/SellYourCar/SellYourCar.jsx";
import FAQPage from "../pages/FAQ/FAQPage.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";

// Admin Pages
import Login from "../pages/Admin/Login.jsx";
import ResetPassword from "../pages/Admin/ResetPassword.jsx";
import Dashboard from "../pages/Admin/Dashboard.jsx";
import AdminCars from "../pages/Admin/Cars.jsx";
import AdminBrands from "../pages/Admin/Brands.jsx";
import AdminFAQs from "../pages/Admin/FAQs.jsx";
import AdminLeads from "../pages/Admin/Leads.jsx";
import AdminBookings from "../pages/Admin/Bookings.jsx";
import AdminSellRequests from "../pages/Admin/SellRequests.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import Chatbot from "../components/Chatbot/Chatbot.jsx";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop.jsx";

// Auth Guard component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public User Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/cars/:id" element={<CarDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/test-drive" element={<TestDrive />} />
                <Route path="/sell-your-car" element={<SellYourCar />} />
                <Route path="/faq" element={<FAQPage />} />

                {/* Admin Auth Route */}
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/reset-password" element={<ResetPassword />} />

                {/* Protected Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="cars" element={<AdminCars />} />
                    <Route path="brands" element={<AdminBrands />} />
                    <Route path="faqs" element={<AdminFAQs />} />
                    <Route path="leads" element={<AdminLeads />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="sell-requests" element={<AdminSellRequests />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AnimatePresence>
    );
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AnimatedRoutes />
            <Chatbot />
        </BrowserRouter>
    );
}

export default AppRoutes;

