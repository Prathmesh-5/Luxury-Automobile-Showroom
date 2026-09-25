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
        if (res.data && res.data.data) {
            localStorage.setItem("admin_user", JSON.stringify(res.data.data));
        }
        return res.data;
    },
    updateProfile: async (data) => {
        const res = await api.put("/admin/profile", data);
        if (res.data && res.data.data) {
            localStorage.setItem("admin_user", JSON.stringify(res.data.data));
        }
        return res.data;
    },
    updateEmail: async (data) => {
        const res = await api.put("/admin/profile/email", data);
        if (res.data && res.data.data) {
            localStorage.setItem("admin_user", JSON.stringify(res.data.data));
        }
        return res.data;
    },
    updatePassword: async (data) => {
        const res = await api.put("/admin/profile/password", data);
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
    getAll: async (params = {}) => {
        const res = await api.get("/leads", { params });
        return res.data;
    },
    updateStatus: async (id, status) => {
        const res = await api.put(`/leads/${id}`, { status });
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/leads/${id}`);
        return res.data;
    }
};

// Test Drives Service
export const testDrivesApi = {
    create: async (data) => {
        const res = await api.post("/test-drives", data);
        return res.data;
    },
    getAll: async (params = {}) => {
        const res = await api.get("/test-drives", { params });
        return res.data;
    },
    updateStatus: async (id, status) => {
        const res = await api.put(`/test-drives/${id}`, { status });
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/test-drives/${id}`);
        return res.data;
    }
};

// Sell Cars Service
export const sellCarsApi = {
    create: async (data) => {
        const res = await api.post("/sell-cars", data);
        return res.data;
    },
    getAll: async (params = {}) => {
        const res = await api.get("/sell-cars", { params });
        return res.data;
    },
    updateStatus: async (id, status) => {
        const res = await api.put(`/sell-cars/${id}`, { status });
        return res.data;
    },
    delete: async (id) => {
        const res = await api.delete(`/sell-cars/${id}`);
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

// Hero Settings Service
export const heroSettingsApi = {
    getPublic: async () => {
        const res = await api.get("/hero-settings");
        return res.data.data;
    },
    update: async (data) => {
        const res = await api.put("/hero-settings", data);
        return res.data;
    }
};

// Footer Settings Service
export const footerSettingsApi = {
    getPublic: async () => {
        const res = await api.get("/footer-settings");
        return res.data.data;
    },
    update: async (data) => {
        const res = await api.put("/footer-settings", data);
        return res.data;
    },
    reset: async () => {
        const res = await api.post("/footer-settings/reset");
        return res.data;
    }
};

// Brand Showcase Settings Service
export const brandShowcaseSettingsApi = {
    getPublic: async () => {
        const res = await api.get("/brand-showcase-settings");
        return res.data.data;
    },
    update: async (data) => {
        const res = await api.put("/brand-showcase-settings", data);
        return res.data;
    }
};

// About Settings Service
export const aboutSettingsApi = {
    getPublic: async () => {
        const res = await api.get("/about-settings");
        return res.data.data;
    },
    update: async (data) => {
        const res = await api.put("/about-settings", data);
        return res.data;
    },
    reset: async () => {
        const res = await api.post("/about-settings/reset");
        return res.data;
    }
};

// Contact Settings Service
export const contactSettingsApi = {
    getPublic: async () => {
        const res = await api.get("/contact-settings");
        return res.data.data;
    },
    update: async (data) => {
        const res = await api.put("/contact-settings", data);
        return res.data;
    },
    reset: async () => {
        const res = await api.post("/contact-settings/reset");
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
    },
    uploadPublicImages: async (files) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);
        }
        const res = await api.post("/upload/public-sell-car", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return res.data.images; // Array of paths
    },
    uploadImagesSingle: async (formData, onProgress) => {
        const res = await api.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
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

// Newsletter Service
export const newsletterApi = {
    subscribe: async (email) => {
        const res = await api.post("/newsletter/subscribe", { email });
        return res.data;
    },
    unsubscribeToken: async (token) => {
        const res = await api.get(`/newsletter/unsubscribe?token=${token}`);
        return res.data;
    },
    getAnalytics: async (range = "30d") => {
        const res = await api.get(`/newsletter/analytics?range=${range}`);
        return res.data;
    },
    getSubscribers: async (params = {}, options = {}) => {
        const res = await api.get("/newsletter/subscribers", { params, ...options });
        return res.data;
    },
    updateSubscriberStatus: async (id, status) => {
        const res = await api.patch(`/newsletter/subscribers/${id}/status`, { status });
        return res.data;
    },
    bulkUpdateStatus: async (ids, status) => {
        const res = await api.post("/newsletter/subscribers/bulk-status", { ids, status });
        return res.data;
    },
    deleteSubscriber: async (id) => {
        const res = await api.delete(`/newsletter/subscribers/${id}`);
        return res.data;
    },
    bulkDelete: async (ids) => {
        const res = await api.post("/newsletter/subscribers/bulk-delete", { ids });
        return res.data;
    },
    exportSubscribersCsv: async (params = {}) => {
        const res = await api.get("/newsletter/export", {
            params,
            responseType: "blob"
        });
        return res.data;
    },
    // Campaign Endpoints
    getCampaigns: async (params = {}, options = {}) => {
        const res = await api.get("/newsletter/campaigns", { params, ...options });
        return res.data;
    },
    getCampaignById: async (id) => {
        const res = await api.get(`/newsletter/campaigns/${id}`);
        return res.data;
    },
    getCampaignRecipients: async (id, params = {}, options = {}) => {
        const res = await api.get(`/newsletter/campaigns/${id}/recipients`, { params, ...options });
        return res.data;
    },
    exportCampaignRecipientsCsv: async (id) => {
        const res = await api.get(`/newsletter/campaigns/${id}/export-recipients`, {
            responseType: "blob"
        });
        return res.data;
    },
    createCampaign: async (data) => {
        const res = await api.post("/newsletter/campaigns", data);
        return res.data;
    },
    updateCampaign: async (id, data) => {
        const res = await api.put(`/newsletter/campaigns/${id}`, data);
        return res.data;
    },
    deleteCampaign: async (id) => {
        const res = await api.delete(`/newsletter/campaigns/${id}`);
        return res.data;
    },
    sendTestEmail: async (id, payload) => {
        const res = await api.post(`/newsletter/campaigns/${id}/test-email`, payload);
        return res.data;
    },
    sendCampaign: async (id) => {
        const res = await api.post(`/newsletter/campaigns/${id}/send`);
        return res.data;
    }
};

export default api;
