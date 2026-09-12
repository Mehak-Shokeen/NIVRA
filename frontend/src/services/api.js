import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("nivra_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem("nivra_token");
            localStorage.removeItem("nivra_user");

            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default api;