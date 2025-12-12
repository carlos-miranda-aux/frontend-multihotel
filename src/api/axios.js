import axios from "axios";

const api = axios.create({

  baseURL: import.meta.env.VITE_API_URL
});

export default api;

api.interceptors.request.use(
  (config) => {
    // 1. Obtener el token del localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Obtener el Hotel Seleccionado (Contexto Global)
    const selectedHotelId = localStorage.getItem("selectedHotelId");
    
    // Si existe y no es cadena vacía (lo que indica "Vista Global"), lo enviamos
    if (selectedHotelId && selectedHotelId !== "") {
        config.headers['x-hotel-id'] = selectedHotelId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);