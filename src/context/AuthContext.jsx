import { createContext, useState, useEffect } from "react";
import DefaultAvatar from "../assets/Avatar.png"; // avatar por defecto

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializar user desde localStorage, con avatar por defecto
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser
      ? { ...JSON.parse(savedUser), avatar: JSON.parse(savedUser).avatar || DefaultAvatar }
      : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);

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

  const login = (token, userData) => {
    setToken(token);
    // Aseguramos que siempre tenga avatar
    setUser({ ...userData, avatar: DefaultAvatar });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUser) => {
    setUser({ ...updatedUser, avatar: DefaultAvatar });
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
