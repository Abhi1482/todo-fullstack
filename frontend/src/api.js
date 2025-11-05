import axios from "axios";


const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000/api" });


api.interceptors.request.use((config) => {
const token = localStorage.getItem("access");
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
});


// Handle refresh token automatically
api.interceptors.response.use(
(res) => res,
async (error) => {
const original = error.config;
if (error.response?.status === 401 && !original._retry) {
original._retry = true;
const refresh = localStorage.getItem("refresh");
if (refresh) {
try {
const r = await axios.post(`${(import.meta.env.VITE_API_BASE||"http://localhost:8000/api").replace(/\/$/,"")}/auth/token/refresh/`, { refresh });
localStorage.setItem("access", r.data.access);
original.headers.Authorization = `Bearer ${r.data.access}`;
return api(original);
} catch (e) {
// fallthrough
}
}
}
return Promise.reject(error);
}
);


export default api;