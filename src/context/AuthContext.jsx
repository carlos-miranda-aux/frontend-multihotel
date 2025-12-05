// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import DefaultAvatar from "../assets/Avatar.png"; // avatar por defecto

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Función auxiliar para obtener la inicial del nombre o username
  const getAvatarInitials = (userData) => {
      const name = userData?.nombre || userData?.username || "U";
      return name[0].toUpperCase();
  }

  // Inicializar user desde localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    
    return parsedUser
      ? { 
          ...parsedUser, 
          avatarUrl: DefaultAvatar, 
          initials: getAvatarInitials(parsedUser)
        }
      : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Inicializar hotel seleccionado desde localStorage
  const [selectedHotelId, setSelectedHotelId] = useState(() => {
      return localStorage.getItem("selectedHotelId") || "";
  });

  // Guardar en localStorage cada vez que user cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Guardar token en localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Función para cambiar de hotel manualmente
  const changeHotelContext = (hotelId) => {
      const val = hotelId ? String(hotelId) : ""; // "" significa Vista Global
      setSelectedHotelId(val);
      localStorage.setItem("selectedHotelId", val);
      
      // Forzar recarga para que React Query y otros componentes refetcheen con el nuevo header
      window.location.reload();
  };

  const login = (token, userData) => {
    setToken(token);
    setUser({ 
        ...userData, 
        avatarUrl: DefaultAvatar, 
        initials: getAvatarInitials(userData)
    });

    // Lógica inteligente: Si el usuario tiene SOLO 1 hotel, lo preseleccionamos
    if (userData.hotels && userData.hotels.length === 1) {
        const uniqueHotelId = String(userData.hotels[0].id);
        localStorage.setItem("selectedHotelId", uniqueHotelId);
        setSelectedHotelId(uniqueHotelId);
    } else {
        // Si tiene varios o es global (Root), por defecto iniciamos en Vista Global
        localStorage.setItem("selectedHotelId", "");
        setSelectedHotelId("");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSelectedHotelId("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedHotelId");
  };

  const updateUser = (updatedUser) => {
    setUser({ 
        ...updatedUser, 
        avatarUrl: DefaultAvatar, 
        initials: getAvatarInitials(updatedUser)
    });
  };

  return (
    <AuthContext.Provider 
        value={{ 
            user, 
            setUser: updateUser, 
            token, 
            setToken, 
            login, 
            logout,
            selectedHotelId,
            changeHotelContext 
        }}
    >
      {children}
    </AuthContext.Provider>
  );
};