import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "../services/api";
import { 
    FiGrid, FiLayers, FiTruck, FiHelpCircle, 
    FiMail, FiSend, FiCalendar, FiDollarSign, FiLogOut, FiExternalLink, FiMenu, FiX, FiSliders, FiUser 
} from "react-icons/fi";
import "./AdminLayout.css";

function AdminLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
        const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";
        return `${base}${path}`;
    };

    useEffect(() => {
        const currentUser = authApi.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        } else {
            navigate("/admin/login");
        }

        // Fetch fresh profile from API
        authApi.getProfile()
            .then(res => {
                if (res?.data) {
                    setUser(res.data);
                }
            })
            .catch(() => {});

        const handleUserUpdate = () => {
            const u = authApi.getCurrentUser();
            if (u) setUser(u);
        };

        window.addEventListener("admin_user_updated", handleUserUpdate);
        return () => window.removeEventListener("admin_user_updated", handleUserUpdate);
    }, [navigate]);

    const handleLogout = () => {
        authApi.logout();
        navigate("/");
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="admin-layout">
            {/* Mobile Top Bar */}
            <header className="mobile-admin-header">
                <button className="menu-toggle-btn" onClick={toggleSidebar}>
                    {sidebarOpen ? <FiX /> : <FiMenu />}
                </button>
                <div className="mobile-logo">
                    LUXURY SHOWROOM <span>ADMIN</span>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="sidebar-brand">
                    <h2>LUXURY</h2>
                    <span>ADMIN PORTAL</span>
                </div>

                <div className="user-profile-badge">
                    <div className="avatar">
                        {(user?.profileImage || user?.avatar) ? (
                            <img 
                                src={getAvatarUrl(user.profileImage || user.avatar)} 
                                alt={user.name || "Admin"} 
                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                            />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : "A"
                        )}
                    </div>
                    <div className="info">
                        <h4>{user?.name || "Admin"}</h4>
                        <p>{user?.email || "admin@showroom.com"}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiGrid className="nav-icon" /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiUser className="nav-icon" /> Profile Settings
                    </NavLink>
                    <NavLink to="/admin/brands" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiLayers className="nav-icon" /> Manage Brands
                    </NavLink>
                    <NavLink to="/admin/cars" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiTruck className="nav-icon" /> Manage Cars
                    </NavLink>
                    <NavLink to="/admin/faqs" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiHelpCircle className="nav-icon" /> Chatbot FAQs
                    </NavLink>
                    <NavLink to="/admin/leads" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiMail className="nav-icon" /> Leads / Enquiries
                    </NavLink>
                    <NavLink to="/admin/newsletter-subscribers" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiSend className="nav-icon" /> Newsletter Subscribers
                    </NavLink>
                    <NavLink to="/admin/newsletter-campaigns" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiMail className="nav-icon" /> Newsletter Campaigns
                    </NavLink>
                    <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiCalendar className="nav-icon" /> Test Drives
                    </NavLink>
                    <NavLink to="/admin/sell-requests" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiDollarSign className="nav-icon" /> Sell Requests
                    </NavLink>
                    <NavLink to="/admin/hero-settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiSliders className="nav-icon" /> Hero Settings
                    </NavLink>
                    <NavLink to="/admin/footer-settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiSliders className="nav-icon" /> Footer Settings
                    </NavLink>
                    <NavLink to="/admin/brand-showcase-settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiSliders className="nav-icon" /> Brand Showcase Settings
                    </NavLink>
                    <NavLink to="/admin/about-settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiSliders className="nav-icon" /> About Settings
                    </NavLink>
                    <NavLink to="/admin/contact-settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiSliders className="nav-icon" /> Contact Settings
                    </NavLink>
                    <a href="/" target="_blank" rel="noreferrer" className="nav-item external" onClick={closeSidebar}>
                        <FiExternalLink className="nav-icon" /> Visit Website
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut className="nav-icon" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                {sidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}
                <div className="admin-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
