// src/pages/EditMaintenance.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid
} from "@mui/material";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";

const EditMaintenance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);

  const [formData, setFormData] = useState({
    descripcion: "",
    fecha_programada: "",
    fecha_realizacion: "",
    estado: "pendiente",
    deviceId: "",
  });
  
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        const [maintenanceRes, devicesRes] = await Promise.all([
          api.get(`/maintenances/get/${id}`),
          // 👈 CORRECCIÓN: Llamar a la nueva ruta "get/all-names"
          api.get("/devices/get/all-names"),
        ]);

        const maintenanceData = maintenanceRes.data;
        
        setFormData({
          descripcion: maintenanceData.descripcion || "",
          fecha_programada: maintenanceData.fecha_programada ? new Date(maintenanceData.fecha_programada).toISOString().substring(0, 10) : "",
          fecha_realizacion: maintenanceData.fecha_realizacion ? new Date(maintenanceData.fecha_realizacion).toISOString().substring(0, 10) : "",
          estado: maintenanceData.estado || "pendiente",
          deviceId: maintenanceData.deviceId || "",
        });
        
        // 👈 CORRECCIÓN: 'devicesRes.data' ahora es un array simple
        setDevices(devicesRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos del mantenimiento.");
        setLoading(false);
      }
    };
    fetchMaintenanceData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      ...formData,
      deviceId: Number(formData.deviceId),
      fecha_programada: formData.fecha_programada ? new Date(formData.fecha_programada).toISOString() : null,
      fecha_realizacion: formData.fecha_realizacion ? new Date(formData.fecha_realizacion).toISOString() : null,
    };

    try {
      await api.put(`/maintenances/put/${id}`, payload);
      refreshAlerts(); 
      setMessage("Mantenimiento actualizado correctamente.");
      setTimeout(() => navigate("/maintenances"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el mantenimiento.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Editar Mantenimiento
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleUpdate} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                    // 👈 CORRECCIÓN: Acceder a los datos del 'select'
                    <MenuItem key={device.id} value={device.id}>
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
              <TextField
                label="Fecha Realización"
                name="fecha_realizacion"
                type="date"
                value={formData.fecha_realizacion}
                onChange={handleChange}
                fullWidth
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
            Guardar Cambios
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditMaintenance;