// src/Layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TopBar from "../components/Topbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const MainLayout = () => {
  return (
    // Contenedor principal: Ocupa toda la pantalla, fondo gris del tema
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default", overflow: "hidden" }}>
      
      {/* Sidebar fijo */}
      <Sidebar 
        open={true} 
        variant="permanent" 
      />

      {/* Área derecha: Topbar + Contenido scrolleable */}
      <Box 
        sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          height: "100%", 
          overflow: "hidden" 
        }}
      >
        <TopBar onMenuClick={() => {}} />

        <Box 
          component="main"
          sx={{ 
            flex: 1,
            overflow: "auto", // El scroll ocurre solo aquí
            p: 0 // El padding lo manejan las páginas individualmente
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;