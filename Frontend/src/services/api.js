import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("admin_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle unauthorized access
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");
            if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
                window.location.href = "/admin/login";
            }
        }
        return Promise.reject(error);
    }
);

// Auth Service
export const authApi = {
    login: async (email, password) => {
        const res = await api.post("/admin/login", { email, password });
        if (res.data && res.data.data && res.data.data.token) {
            localStorage.setItem("admin_token", res.data.data.token);
            localStorage.setItem("admin_user", JSON.stringify(res.data.data.admin));
        }
        return res.data;
    },
    logout: () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
    },
    getCurrentUser: () => {
        const user = localStorage.getItem("admin_user");
        return user ? JSON.parse(user) : null;
    },
    getProfile: async () => {
        const res = await api.get("/admin/profile");
        return res.data;
    },
    forgotPassword: async (email) => {
        const res = await api.post("/admin/forgot-password", { email });
        return res.data;
    },
    resetPassword: async (token, password) => {
        const res = await api.post(`/admin/reset-password?token=${token}`, { password });
        return res.data;
    },
    validateResetToken: async (token) => {
        const res = await api.get(`/admin/reset-password?token=${token}`);
        return res.data;
    }
};

// Brands Service
export const brandsApi = {
    getAll: async () => {
        const res = await api.get("/brands");
        return res.data.data.brands;
    },
    getById: async (id) => {
        const res = await api.get(`/brands/${id}`);
        return res.data.data;
    },
    create: async (data) => {
        const res = await api.post("/brands", data);
        return res.data;
    },
    update: async (id, data) => {
        const res = await api.put(`/brands/${id}`, data);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/brands/${id}`);
        return res.data;
    }
};

// Cars Service
export const carsApi = {
    getAll: async (params = {}) => {
        const res = await api.get("/cars", { params });
        return res.data;
    },
    getById: async (id) => {
        const res = await api.get(`/cars/${id}`);
        return res.data.data;
    },
    getSimilar: async (id) => {
        const res = await api.get(`/cars/${id}/similar`);
        return res.data.data;
    },
    create: async (data) => {
        const res = await api.post("/cars", data);
        return res.data;
    },
    update: async (id, data) => {
        const res = await api.put(`/cars/${id}`, data);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/cars/${id}`);
        return res.data;
    }
};

// Leads Service
export const leadsApi = {
    create: async (data) => {
        const res = await api.post("/leads", data);
        return res.data;
    },
    getAll: async () => {
        const res = await api.get("/leads");
        return res.data.data.leads;
    },
    updateStatus: async (id, status) => {
        const res = await api.put(`/leads/${id}`, { status });
        return res.data;
    }
};

// Test Drives Service
export const testDrivesApi = {
    create: async (data) => {
        const res = await api.post("/test-drives", data);
        return res.data;
    },
    getAll: async () => {
        const res = await api.get("/test-drives");
        return res.data.data.bookings;
    },
    updateStatus: async (id, status) => {
        const res = await api.put(`/test-drives/${id}`, { status });
        return res.data;
    }
};

// Sell Cars Service
export const sellCarsApi = {
    create: async (data) => {
        const res = await api.post("/sell-cars", data);
        return res.data;
    },
    getAll: async () => {
        const res = await api.get("/sell-cars");
        return res.data.data.requests;
    },
    updateStatus: async (id, status) => {
        const res = await api.put(`/sell-cars/${id}`, { status });
        return res.data;
    }
};

// FAQs Service
export const faqsApi = {
    getAll: async () => {
        const res = await api.get("/faqs");
        return res.data.data;
    },
    create: async (data) => {
        const res = await api.post("/faqs", data);
        return res.data;
    },
    update: async (id, data) => {
        const res = await api.put(`/faqs/${id}`, data);
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/faqs/${id}`);
        return res.data;
    }
};

// Settings & Sync Service
export const settingsApi = {
    get: async () => {
        const res = await api.get("/settings");
        return res.data.data;
    },
    update: async (data) => {
        const res = await api.put("/settings", data);
        return res.data;
    },
    triggerSync: async () => {
        const res = await api.post("/settings/sync");
        return res.data;
    }
};

// Image Upload Service
export const uploadApi = {
    uploadImages: async (files) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }
        const res = await api.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return res.data.images; // Array of paths
    }
};

// Dashboard Statistics Service
export const dashboardApi = {
    getStats: async () => {
        const res = await api.get("/dashboard");
        return res.data.data;
    }
};

export default api;
