// src/components/CreateMaintenanceForm.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid
} from "@mui/material";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";

const CreateMaintenanceForm = ({ onClose, onMaintenanceCreated, setMessage, setError }) => {
  const [formData, setFormData] = useState({
    descripcion: "",
    fecha_programada: "",
    estado: "pendiente", // Valor por defecto
    deviceId: "",
  });
  
  const [devices, setDevices] = useState([]);
  const { refreshAlerts } = useContext(AlertContext);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // 👈 CORRECCIÓN: Llamar a la nueva ruta
        const res = await api.get("/devices/get/all-names");
        
        // 👈 CORRECCIÓN: La respuesta es un array simple
        setDevices(res.data); 
      } catch (err) {
        console.error("Error fetching devices:", err);
        setError("Error al cargar la lista de equipos.");
      }
    };
    fetchDevices();
  }, [setError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      ...formData,
      deviceId: Number(formData.deviceId),
      fecha_programada: formData.fecha_programada ? new Date(formData.fecha_programada).toISOString() : null,
    };

    try {
      await api.post("/maintenances/post", payload);
      refreshAlerts();
      onMaintenanceCreated(); 
      onClose(); 
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el mantenimiento.");
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Crear nuevo mantenimiento
      </Typography>
      <Box component="form" onSubmit={handleCreateMaintenance} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Equipo (Device)</InputLabel>
              <Select
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                label="Equipo (Device)"
              >
                <MenuItem value="">
                  <em>Selecciona un equipo</em>
                </MenuItem>
                {devices.map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {/* 👈 CORRECCIÓN: Acceder a los datos del 'select' */}
                    {device.etiqueta} - {device.nombre_equipo || device.tipo?.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                label="Estado"
              >
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="realizado">Realizado</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Crear Mantenimiento
        </Button>
      </Box>
    </Box>
  );
};

export default CreateMaintenanceForm;