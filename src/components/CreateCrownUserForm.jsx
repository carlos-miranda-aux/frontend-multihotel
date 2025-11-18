// src/components/CreateCrownUserForm.jsx
import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button,
  FormControlLabel, Switch, ListSubheader
} from "@mui/material";
import api from "../api/axios";

const CreateCrownUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    areaId: "", // 👈 Cambiado de departamentoId a areaId
    usuario_login: "",
  });
  const [isManager, setIsManager] = useState(false);
  const [areas, setAreas] = useState([]); // Ahora cargamos áreas
  
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        // Suponemos que el backend devuelve áreas ordenadas por departamento
        const res = await api.get("/areas/get");
        setAreas(res.data || []);
      } catch (err) {
        console.error("Error fetching areas:", err);
        setError("Error al cargar las áreas.");
      }
    };
    fetchAreas();
  }, [setError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    const payload = {
      ...formData,
      areaId: formData.areaId || null,
      es_jefe_de_area: isManager
    };

    try {
      await api.post("/users/post", payload);
      setMessage("Usuario de Crown creado exitosamente.");
      onUserCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el usuario.");
    }
  };

  // Agrupar áreas por departamento para el Select
  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;

    areas.forEach(area => {
      if (area.departamento?.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.departamentoId}`}>{area.departamento?.nombre}</ListSubheader>);
        lastDept = area.departamento?.nombre;
      }
      options.push(
        <MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>
          {area.nombre}
        </MenuItem>
      );
    });
    return options;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Crear nuevo usuario</Typography>
      <Box component="form" onSubmit={handleCreateUser} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
        <TextField label="Correo" name="correo" type="email" value={formData.correo} onChange={handleChange} fullWidth required />
        
        {/* SELECCIONAR ÁREA */}
        <FormControl fullWidth required>
          <InputLabel>Área</InputLabel>
          <Select
            name="areaId"
            value={formData.areaId}
            onChange={handleChange}
            label="Área"
          >
            <MenuItem value=""><em>Ninguna</em></MenuItem>
            {renderAreaOptions()}
          </Select>
        </FormControl>
        
        <TextField label="Usuario de Login" name="usuario_login" value={formData.usuario_login} onChange={handleChange} fullWidth />

        <FormControlLabel
          control={<Switch checked={isManager} onChange={(e) => setIsManager(e.target.checked)} />}
          label="Es Jefe de Área (Recibe notificaciones)"
        />

        <Button type="submit" variant="contained" color="primary">Crear usuario</Button>
      </Box>
    </Box>
  );
};

export default CreateCrownUserForm;