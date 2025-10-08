import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TopBar from "../components/Topbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />

      {/* Contenedor principal */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* TopBar siempre visible */}
        <Box sx={{ zIndex: 1200 }}> {/* aseguramos que esté sobre el sidebar */}
          <TopBar onMenuClick={toggleSidebar} />
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
