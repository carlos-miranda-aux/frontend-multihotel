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
  Grid,
  Divider, 
  Autocomplete,
  Alert 
} from "@mui/material";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import "../pages/styles/ConfigButtons.css"; 

const CreateMaintenanceForm = ({ onClose, onMaintenanceCreated, setMessage, setError, error }) => {
  const [formData, setFormData] = useState({
    descripcion: "",
    fecha_programada: "",
    estado: "pendiente", // Valor por defecto
    tipo_mantenimiento: "Correctivo", // VALOR POR DEFECTO: Correctivo
  });
  
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null); 
  const { refreshAlerts } = useContext(AlertContext);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        
        const res = await api.get("/devices/get/all-names");
        
        // Mapear los datos para que Autocomplete tenga una propiedad 'label' usable
        const formattedDevices = res.data.map(d => ({
            ...d,
            // Combina Etiqueta y Nombre de Equipo para una búsqueda más amplia
            label: `${d.etiqueta || d.nombre_equipo} - ${d.nombre_equipo || d.tipo?.nombre}` 
        }));
        
        setDevices(formattedDevices); 
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };
    fetchDevices();
  }, []); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    // Limpieza de mensajes antes de la validación
    if (setMessage) setMessage(""); 
    if (setError) setError(""); 

    // Validación de campos obligatorios
    if (!selectedDevice || !formData.descripcion || !formData.fecha_programada) {
        if (setError) setError("Por favor, selecciona un equipo, una descripción y una fecha programada.");
        return;
    }

    const payload = {
      ...formData,
      deviceId: Number(selectedDevice.id), // Usamos el ID del objeto seleccionado
      fecha_programada: formData.fecha_programada ? new Date(formData.fecha_programada).toISOString() : null,
      tipo_mantenimiento: formData.tipo_mantenimiento, 
    };

    try {
      await api.post("/maintenances/post", payload);
      if (setMessage) setMessage("Mantenimiento programado exitosamente.");
      refreshAlerts();
      onMaintenanceCreated(); 
      onClose(); 
    } catch (err) {
      if (setError) setError(err.response?.data?.error || "Error al crear el mantenimiento.");
    }
  };

  return (
    <Box sx={{ p: 1, pt: 0 }}> 
      <Typography 
        variant="h5" 
        sx={{ mb: 2, fontWeight: 'bold' }}
        className="modal-title-color"
      >
        Crear nuevo mantenimiento
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleCreateMaintenance} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        
        <Typography variant="subtitle1" className="modal-subtitle-color">
            Información del Equipo
        </Typography>
        
        {/* CORRECCIÓN: Autocomplete envuelto en Box para ocupar el 100% sin restricciones de Grid */}
        <Box> 
            <Autocomplete
                options={devices}
                getOptionLabel={(option) => option.label || ""}
                value={selectedDevice}
                onChange={(event, newValue) => {
                    setSelectedDevice(newValue);
                    if (error && setError) setError(""); 
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id} 
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label="Buscar Equipo" 
                        fullWidth 
                        required 
                        error={!selectedDevice && !!error}
                        helperText={!selectedDevice && !!error ? "Selecciona un equipo de la lista." : null}
                    />
                )}
                noOptionsText="No hay equipos coincidentes"
                fullWidth
            />
        </Box>

        <Typography variant="subtitle1" className="modal-subtitle-color" sx={{ mb: -2, mt: 1 }}>
            Detalles del Mantenimiento
        </Typography>
        <Grid container spacing={2}>
          
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
              error={!formData.fecha_programada && !!error}
              helperText={!formData.fecha_programada && !!error ? "La fecha es obligatoria." : null}
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
              required 
              error={!formData.descripcion && !!error}
              helperText={!formData.descripcion && !!error ? "La descripción es obligatoria." : null}
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
                disabled 
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
          className="primary-action-button" 
        >
          Crear Mantenimiento
        </Button>
        
        {!!error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}
        
      </Box>
    </Box>
  );
};

export default CreateMaintenanceForm;