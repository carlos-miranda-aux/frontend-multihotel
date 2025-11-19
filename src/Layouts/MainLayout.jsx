// src/Layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TopBar from "../components/Topbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

// Definimos el ancho de la Sidebar para usarlo en el margen del contenido
const SIDEBAR_WIDTH = '240px'; 

const MainLayout = () => {
  // Se ha eliminado la lógica de estado (sidebarOpen, toggleSidebar)

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar - Ahora es permanente */}
      {/* Se le pasa variant="permanent" y open={true} */}
      <Sidebar 
        open={true} 
        variant="permanent" 
        // Ya no necesitamos pasar onClose, pero es buena práctica mantenerla
        onClose={() => {}} 
      />

      {/* Contenedor principal del TopBar y Contenido */}
      <Box 
        sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          // [CORRECCIÓN CLAVE]: Se ELIMINA el margen izquierdo (ml: SIDEBAR_WIDTH)
          // Ya que el 'display: flex' de la Box padre y el 'position: static' del Sidebar
          // en modo 'permanent' hacen que este Box comience justo después del Sidebar.
        }}
      >
        {/* TopBar */}
        <Box sx={{ zIndex: 1200 }}>
          {/* onMenuClick se deja vacío ya que el botón de menú ya no es necesario */}
          <TopBar onMenuClick={() => {}} /> 
        </Box>

        {/* Área de contenido */}
        <Box sx={{ flex: 1, p: 3, mt: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;