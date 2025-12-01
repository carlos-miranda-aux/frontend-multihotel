// src/components/CreateMaintenanceForm.jsx
import React, { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form"; // 👈 Hook Form
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Grid, Divider, Autocomplete, Alert, FormHelperText
} from "@mui/material";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import { MAINTENANCE_STATUS, MAINTENANCE_TYPE } from "../config/constants"; // Constantes

const CreateMaintenanceForm = ({ onClose, onMaintenanceCreated, setMessage, setError }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      selectedDevice: null, // Objeto completo del Autocomplete
      descripcion: "",
      fecha_programada: "",
      estado: MAINTENANCE_STATUS.PENDING,
      tipo_mantenimiento: MAINTENANCE_TYPE.CORRECTIVE,
    }
  });

  const [devices, setDevices] = useState([]);
  const { refreshAlerts } = useContext(AlertContext);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await api.get("/devices/get/all-names");
        const formattedDevices = res.data.map(d => ({
            ...d,
            label: `${d.etiqueta || d.nombre_equipo} - ${d.nombre_equipo || d.tipo?.nombre}` 
        }));
        setDevices(formattedDevices); 
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };
    fetchDevices();
  }, []); 

  const onSubmit = async (data) => {
    if (setMessage) setMessage(""); 
    if (setError) setError(""); 

    const payload = {
      descripcion: data.descripcion,
      estado: data.estado,
      tipo_mantenimiento: data.tipo_mantenimiento,
      deviceId: Number(data.selectedDevice.id), // Extraemos ID del objeto
      fecha_programada: new Date(data.fecha_programada).toISOString(),
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
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }} color="text.primary">
        Crear nuevo mantenimiento
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        
        <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">
            Información del Equipo
        </Typography>
        
        <Box> 
            <Controller
                name="selectedDevice"
                control={control}
                rules={{ required: "Debes seleccionar un equipo" }}
                render={({ field: { onChange, value } }) => (
                    <Autocomplete
                        options={devices}
                        getOptionLabel={(option) => option.label || ""}
                        value={value}
                        onChange={(_, newValue) => onChange(newValue)}
                        isOptionEqualToValue={(option, val) => option.id === val.id} 
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Buscar Equipo" 
                                fullWidth 
                                error={!!errors.selectedDevice}
                                helperText={errors.selectedDevice?.message}
                            />
                        )}
                        noOptionsText="No hay equipos coincidentes"
                    />
                )}
            />
        </Box>

        <Typography variant="subtitle1" color="text.secondary" fontWeight="bold" sx={{ mb: -2, mt: 1 }}>
            Detalles del Mantenimiento
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
                <InputLabel>Tipo de Mantenimiento</InputLabel>
                <Controller
                    name="tipo_mantenimiento"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} label="Tipo de Mantenimiento">
                            <MenuItem value={MAINTENANCE_TYPE.CORRECTIVE}>{MAINTENANCE_TYPE.CORRECTIVE}</MenuItem>
                            <MenuItem value={MAINTENANCE_TYPE.PREVENTIVE}>{MAINTENANCE_TYPE.PREVENTIVE}</MenuItem>
                        </Select>
                    )}
                />
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Controller
                name="fecha_programada"
                control={control}
                rules={{ required: "La fecha es obligatoria" }}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Fecha Programada"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.fecha_programada}
                        helperText={errors.fecha_programada?.message}
                    />
                )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Controller
                name="descripcion"
                control={control}
                rules={{ required: "La descripción es obligatoria" }}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.descripcion}
                        helperText={errors.descripcion?.message}
                    />
                )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth disabled>
              <InputLabel>Estado</InputLabel>
              <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                      <Select {...field} label="Estado">
                        <MenuItem value={MAINTENANCE_STATUS.PENDING}>Pendiente</MenuItem>
                        <MenuItem value={MAINTENANCE_STATUS.COMPLETED}>Realizado</MenuItem>
                        <MenuItem value={MAINTENANCE_STATUS.CANCELLED}>Cancelado</MenuItem>
                      </Select>
                  )}
              />
              <FormHelperText>El estado inicial es siempre "Pendiente".</FormHelperText>
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