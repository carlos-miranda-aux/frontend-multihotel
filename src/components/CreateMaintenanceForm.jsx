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
import "../pages/styles/ConfigButtons.css"; // 👈 IMPORTACIÓN DE ESTILOS

const CreateMaintenanceForm = ({ onClose, onMaintenanceCreated, setMessage, setError }) => {
  const [formData, setFormData] = useState({
    descripcion: "",
    fecha_programada: "",
    estado: "pendiente", // Valor por defecto
    deviceId: "",
    tipo_mantenimiento: "Correctivo", // 👈 VALOR POR DEFECTO: Correctivo
  });
  
  const [devices, setDevices] = useState([]);
  const { refreshAlerts } = useContext(AlertContext);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // Pide la lista de dispositivos activos para el selector
        const res = await api.get("/devices/get/all-names");
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
      tipo_mantenimiento: formData.tipo_mantenimiento, // Se incluye
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
      <Typography 
        variant="h6" 
        sx={{ mb: 2 }}
        className="modal-title-color" // ✅ Aplicar clase al título
      >
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
                    {/* Muestra etiqueta y nombre */}
                    {device.etiqueta} - {device.nombre_equipo || device.tipo?.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* 👇 NUEVO CAMPO: TIPO DE MANTENIMIENTO */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
                <InputLabel>Tipo de Mantenimiento</InputLabel>
                <Select
                  name="tipo_mantenimiento"
                  value={formData.tipo_mantenimiento}
                  onChange={handleChange}
                  label="Tipo de Mantenimiento"
                >
                  <MenuItem value="Correctivo">Correctivo</MenuItem>
                  <MenuItem value="Preventivo">Preventivo</MenuItem>
                </Select>
            </FormControl>
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
          
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required // Hacemos la descripción requerida
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                label="Estado"
                disabled // Deshabilitar la edición de estado al crear
              >
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="realizado">Realizado</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
              </Select>
              <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                El estado inicial es siempre "Pendiente".
              </Typography>
            </FormControl>
          </Grid>
        </Grid>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          className="primary-action-button" // ✅ Aplicar clase CSS
        >
          Crear Mantenimiento
        </Button>
      </Box>
    </Box>
  );
};

export default CreateMaintenanceForm;