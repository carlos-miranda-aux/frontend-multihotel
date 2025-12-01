// src/pages/AdminSettings.jsx
import React, { useState } from "react";
import { Box, Typography, Button, Stack, Divider } from "@mui/material";

// Iconos para el menú de selección
import ListIcon from '@mui/icons-material/List';
import PeopleIcon from '@mui/icons-material/People';
import DomainIcon from '@mui/icons-material/Domain'; 

// Subcomponentes refactorizados
import CrudTable from "../components/CrudTable.jsx";
import UsersSystemTable from "../components/admin/UserSystemTable.jsx";
import AreasTable from "../components/admin/AreasTable.jsx";

const AdminSettings = () => {
  const [activeTable, setActiveTable] = useState(null);

  const tables = [
    { name: "Departamentos", url: "/departments" },
    { name: "Áreas", url: "/areas", icon: <DomainIcon /> }, 
    { name: "Sistemas Operativos", url: "/operating-systems" },
    { name: "Tipos de Dispositivo", url: "/device-types" },
    { name: "Estados de Dispositivo", url: "/device-status" },
    { name: "Gestión de Usuarios", url: "/auth", icon: <PeopleIcon /> },
  ];

  const handleTableChange = (tableName) => {
    setActiveTable(tableName);
  };

  const renderActiveTable = () => {
    if (!activeTable) {
        return (
            <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
                Selecciona una opción del menú superior.
            </Typography>
        );
    }

    // Renderizamos el componente específico según la selección
    if (activeTable === "Gestión de Usuarios") return <UsersSystemTable />;
    if (activeTable === "Áreas") return <AreasTable />;

    // Para tablas sencillas, usamos el genérico
    const tableData = tables.find(t => t.name === activeTable);
    return <CrudTable title={tableData.name} apiUrl={tableData.url} />;
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }} color="primary">
        Configuración
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }} color="text.secondary">
        Tablas del Sistema:
      </Typography>

      {/* Menú de Selección */}
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {tables.map((table) => (
          <Button
            key={table.name}
            variant={activeTable === table.name ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleTableChange(table.name)} 
            startIcon={table.icon || <ListIcon />}
            sx={{ minWidth: 150 }}
          >
            {table.name}
          </Button>
        ))}
      </Stack>

      <Divider sx={{ my: 4 }} />

      {/* Área de Contenido */}
      <Box sx={{ minHeight: 400 }}>
        {renderActiveTable()}
      </Box>
    </Box>
  );
};

export default AdminSettings;