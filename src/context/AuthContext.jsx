import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios"; 
import DefaultAvatar from "../assets/Avatar.png"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const getAvatarInitials = (userData) => {
      const name = userData?.nombre || userData?.username || "U";
      return name[0].toUpperCase();
  }

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    return parsedUser ? { ...parsedUser, avatarUrl: DefaultAvatar, initials: getAvatarInitials(parsedUser) } : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [selectedHotelId, setSelectedHotelId] = useState(() => localStorage.getItem("selectedHotelId") || "");
  const [availableHotels, setAvailableHotels] = useState([]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const refreshHotelList = useCallback(async () => {
    if (!token) return;
    try {
        const res = await api.get('/hotels/list');
        setAvailableHotels(res.data || []);
    } catch (err) {
        console.error("Error actualizando lista de hoteles:", err);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) refreshHotelList();
  }, [user, token, refreshHotelList]);

  const getHotelName = useCallback((id) => {
      if (!id) return "N/A";
      const idNum = Number(id);
      const hotel = availableHotels.find(h => h.id === idNum);
      return hotel ? hotel.nombre : `ID: ${id}`;
  }, [availableHotels]);

  const changeHotelContext = (hotelId) => {
      const val = hotelId ? String(hotelId) : ""; 
      setSelectedHotelId(val);
      localStorage.setItem("selectedHotelId", val);
  };

  const login = (token, userData) => {
    setToken(token);
    setUser({ ...userData, avatarUrl: DefaultAvatar, initials: getAvatarInitials(userData) });
    if (userData.hotels && userData.hotels.length === 1) {
        const uniqueHotelId = String(userData.hotels[0].id);
        localStorage.setItem("selectedHotelId", uniqueHotelId);
        setSelectedHotelId(uniqueHotelId);
    } else {
        localStorage.setItem("selectedHotelId", "");
        setSelectedHotelId("");
    }
  };

  const logout = () => {
    setToken(null); setUser(null); setSelectedHotelId(""); setAvailableHotels([]);
    localStorage.removeItem("token"); localStorage.removeItem("user"); localStorage.removeItem("selectedHotelId");
  };

  const updateUser = (updatedUser) => {
    setUser({ ...updatedUser, avatarUrl: DefaultAvatar, initials: getAvatarInitials(updatedUser) });
  };

  return (
    <AuthContext.Provider 
        value={{ 
            user, setUser: updateUser, token, setToken, login, logout,
            selectedHotelId, changeHotelContext, availableHotels, refreshHotelList,
            getHotelName
        }}
    >
      {children}
    </AuthContext.Provider>
  );
};