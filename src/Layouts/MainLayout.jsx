// src/Layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TopBar from "../components/Topbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const MainLayout = () => {
  return (
    // 1. Contenedor "Padre" bloqueado al tamaño de la ventana (100vh)
    // 'overflow: hidden' evita que aparezca doble barra de scroll
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      {/* Sidebar Fijo a la izquierda */}
      <Sidebar 
        open={true} 
        variant="permanent" 
        onClose={() => {}} 
      />

      {/* 2. Columna Derecha (Topbar + Contenido) */}
      <Box 
        sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          height: "100%", // Asegura que ocupe todo el alto disponible
        }}
      >
        {/* TopBar Fijo arriba */}
        {/* Al no ser parte del área con scroll, se quedará siempre visible */}
        <Box sx={{ zIndex: 1200 }}>
          <TopBar onMenuClick={() => {}} /> 
        </Box>

        {/* 3. Área de Contenido con Scroll Independiente */}
        <Box 
          component="main"
          sx={{ 
            flex: 1,        // Ocupa el espacio restante
            p: 3,           // Padding
            overflow: "auto" // 👈 AQUÍ ESTÁ LA MAGIA: Solo esto hace scroll
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;