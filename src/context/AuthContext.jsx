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

  // Inicializar user desde localStorage, con avatar por defecto
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const parsedUser = savedUser
      ? JSON.parse(savedUser) 
      : null;
    
    // Almacenamos el path de la imagen como 'avatarUrl' y la inicial calculada
    return parsedUser
      ? { 
          ...parsedUser, 
          avatarUrl: DefaultAvatar, // Usamos DefaultAvatar como URL para el tag <img>
          initials: getAvatarInitials(parsedUser)
        }
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
    // Guardamos el path de la imagen y las iniciales calculadas
    setUser({ 
        ...userData, 
        avatarUrl: DefaultAvatar, 
        initials: getAvatarInitials(userData)
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUser) => {
    // Cuando se actualiza el usuario, volvemos a calcular las propiedades
    setUser({ 
        ...updatedUser, 
        avatarUrl: DefaultAvatar, 
        initials: getAvatarInitials(updatedUser)
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};