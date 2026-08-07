import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "../services/api";
import { 
    FiGrid, FiLayers, FiTruck, FiHelpCircle, 
    FiMail, FiCalendar, FiDollarSign, FiLogOut, FiExternalLink, FiMenu, FiX 
} from "react-icons/fi";
import "./AdminLayout.css";

function AdminLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const currentUser = authApi.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        } else {
            navigate("/admin/login");
        }
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
                        {user?.name ? user.name.charAt(0) : "A"}
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
                    <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiCalendar className="nav-icon" /> Test Drives
                    </NavLink>
                    <NavLink to="/admin/sell-requests" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeSidebar}>
                        <FiDollarSign className="nav-icon" /> Sell Requests
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
