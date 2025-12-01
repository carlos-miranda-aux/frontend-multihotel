import axios from "axios";


const api = axios.create({
  //baseURL: "/api" //para produccion
  baseURL: "http://localhost:3000/api"
  //baseURL: import.meta.env.VITE_API_UR //"http://localhost:3000/api", // tu backend
});

export default api;

api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage (o de un contexto)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
