// src/components/CreateMaintenanceForm.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, 
  Autocomplete, FormHelperText
} from "@mui/material";
import api from "../api/axios";
import { ROLES } from "../config/constants";
import { AuthContext } from "../context/AuthContext";

const CreateMaintenanceForm = ({ onClose, onMaintenanceCreated, setMessage, setError }) => {
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  const [formData, setFormData] = useState({
    deviceId: null,
    tipo_mantenimiento: "Preventivo",
    descripcion: "",
    fecha_programada: ""
  });

  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // Obtenemos nombres de dispositivos (el backend ya filtra por hotel)
        const res = await api.get("/devices/get/all-names");
        setDevices(res.data || []);
      } catch (err) {
        if (setError) setError("Error al cargar la lista de equipos.");
      }
    };
    fetchDevices();
  }, [setError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (setError) setError("");
    if (setMessage) setMessage("");

    if (!formData.deviceId) {
        if (setError) setError("Debes seleccionar un equipo.");
        return;
    }

    // Preparar payload
    const payload = {
        deviceId: formData.deviceId.id, // Autocomplete devuelve objeto
        tipo_mantenimiento: formData.tipo_mantenimiento,
        descripcion: formData.descripcion,
        fecha_programada: new Date(formData.fecha_programada).toISOString()
    };

    try {
      await api.post("/maintenances/post", payload);
      if (setMessage) setMessage("Mantenimiento programado exitosamente.");
      onMaintenanceCreated();
      onClose();
    } catch (err) {
      if (setError) setError(err.response?.data?.error || "Error al crear mantenimiento.");
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }} color="text.primary">
        Programar Mantenimiento
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        
        {/* Selector de Equipo con Búsqueda */}
        <Autocomplete
            options={devices}
            getOptionLabel={(option) => {
                // Si es ROOT, mostramos más info para distinguir
                const hotelTag = isRoot && option.hotelId ? ` (H:${option.hotelId})` : ""; 
                return `${option.etiqueta || 'S/N'} - ${option.nombre_equipo}${hotelTag}`;
            }}
            value={formData.deviceId}
            onChange={(event, newValue) => {
                setFormData({ ...formData, deviceId: newValue });
            }}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label="Seleccionar Equipo" 
                    required 
                    helperText="Busca por etiqueta o nombre"
                />
            )}
            noOptionsText="No se encontraron equipos"
        />

        <FormControl fullWidth>
          <InputLabel>Tipo de Mantenimiento</InputLabel>
          <Select
            name="tipo_mantenimiento"
            value={formData.tipo_mantenimiento}
            onChange={handleChange}
            label="Tipo de Mantenimiento"
          >
            <MenuItem value="Preventivo">Preventivo</MenuItem>
            <MenuItem value="Correctivo">Correctivo</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Descripción / Tarea"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
          required
          placeholder="Ej: Limpieza física, Actualización de RAM..."
        />

        <TextField
          label="Fecha Programada"
          name="fecha_programada"
          type="date"
          value={formData.fecha_programada}
          onChange={handleChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
        />

        <Button type="submit" variant="contained" color="primary" size="large">
          Programar
        </Button>
      </Box>
    </Box>
  );
};

export default CreateMaintenanceForm;