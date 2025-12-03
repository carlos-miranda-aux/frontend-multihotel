// src/components/CreateMaintenanceForm.jsx
import React, { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Grid, Divider, Autocomplete, FormHelperText
} from "@mui/material";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
// 👇 IMPORTANTE: Importamos las constantes para evitar strings mágicos
import { MAINTENANCE_STATUS, MAINTENANCE_TYPE } from "../config/constants"; 

const CreateMaintenanceForm = ({ onClose, onMaintenanceCreated, setMessage, setError }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      selectedDevice: null,
      descripcion: "",
      fecha_programada: "",
      // 👇 Usamos la constante, no el string "pendiente"
      estado: MAINTENANCE_STATUS.PENDING, 
      // 👇 Usamos la constante, no el string "Correctivo"
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

    // Ajuste de hora para evitar desfase de zona horaria
    const fechaFixed = new Date(data.fecha_programada + "T12:00:00").toISOString();

    const payload = {
      descripcion: data.descripcion,
      estado: data.estado,
      tipo_mantenimiento: data.tipo_mantenimiento,
      deviceId: Number(data.selectedDevice.id),
      fecha_programada: fechaFixed,
    };

    // 👇 Validación usando CONSTANTE
    if (payload.estado === MAINTENANCE_STATUS.COMPLETED) {
        payload.fecha_realizacion = fechaFixed;
    }

    try {
      await api.post("/maintenances/post", payload);
      if (setMessage) setMessage("Mantenimiento registrado exitosamente.");
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
                            {/* 👇 Usamos constantes para el valor y el texto visible */}
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
                        label="Fecha"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.fecha_programada}
                        helperText={errors.fecha_programada?.message || "Fecha de programación o ejecución"}
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
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                      <Select {...field} label="Estado">
                        {/* 👇 Usamos constantes para los valores que se envían a la BD */}
                        <MenuItem value={MAINTENANCE_STATUS.PENDING}>Pendiente</MenuItem>
                        <MenuItem value={MAINTENANCE_STATUS.COMPLETED}>Realizado</MenuItem>
                      </Select>
                  )}
              />
            </FormControl>
          </Grid>
        </Grid>
        
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Registrar Mantenimiento
        </Button>
      </Box>
    </Box>
  );
};

export default CreateMaintenanceForm;