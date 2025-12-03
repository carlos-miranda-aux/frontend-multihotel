// src/components/CreateCrownUserForm.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form"; 
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button,
  FormControlLabel, Switch, ListSubheader, FormHelperText
} from "@mui/material";
import api from "../api/axios";

const CreateCrownUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  // Desestructuramos 'formState: { errors }' para poder pintar los campos de rojo
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { nombre: "", correo: "", areaId: "", usuario_login: "", isManager: false }
  });
  
  const [areas, setAreas] = useState([]);
  
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await api.get("/areas/get?limit=0"); 
        setAreas(res.data || []);
      } catch (err) {
        if (setError) setError("Error al cargar las áreas.");
      }
    };
    fetchAreas();
  }, [setError]);

  const onSubmit = async (data) => {
    if (setError) setError("");
    if (setMessage) setMessage("");
    
    // Corregido: Mapeo manual para evitar enviar 'isManager'
    const payload = {
      nombre: data.nombre,
      correo: data.correo,
      usuario_login: data.usuario_login,
      areaId: data.areaId ? Number(data.areaId) : null,
      es_jefe_de_area: data.isManager
    };

    try {
      await api.post("/users/post", payload);
      if (setMessage) setMessage("Usuario de Crown creado exitosamente.");
      onUserCreated();
      onClose();
    } catch (err) {
      if (setError) setError(err.response?.data?.error || "Error al crear el usuario.");
    }
  };

  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;
    const sortedAreas = [...areas].sort((a, b) => (a.departamento?.nombre || "").localeCompare(b.departamento?.nombre || ""));

    sortedAreas.forEach(area => {
      if (area.departamento?.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.departamentoId}`} sx={{ fontWeight: 'bold', color: 'primary.main' }}>{area.departamento?.nombre}</ListSubheader>);
        lastDept = area.departamento?.nombre;
      }
      options.push(<MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>{area.nombre}</MenuItem>);
    });
    return options;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }} color="text.primary">
        Crear nuevo usuario
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Controller
            name="nombre" control={control} rules={{ required: "El nombre es obligatorio" }}
            render={({ field }) => (
                <TextField 
                    {...field} 
                    label="Nombre" 
                    fullWidth 
                    required 
                    error={!!errors.nombre} // 👈 Visual error
                    helperText={errors.nombre?.message} 
                />
            )}
        />
        <Controller
            name="correo" control={control}
            render={({ field }) => (
                <TextField 
                    {...field} 
                    label="Correo" 
                    type="email" 
                    fullWidth 
                    error={!!errors.correo}
                    helperText={errors.correo?.message}
                />
            )}
        />
        
        <FormControl fullWidth required error={!!errors.areaId}>
          <InputLabel>Área</InputLabel>
          <Controller
            name="areaId" control={control} rules={{ required: "El área es obligatoria" }}
            render={({ field }) => (
                <Select {...field} label="Área">
                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                    {renderAreaOptions()}
                </Select>
            )}
          />
          {errors.areaId && <FormHelperText>{errors.areaId.message}</FormHelperText>}
        </FormControl>
        
        <Controller
            name="usuario_login" control={control}
            render={({ field }) => <TextField {...field} label="Usuario" fullWidth error={!!errors.usuario_login} helperText={errors.usuario_login?.message} />}
        />

        <Controller
            name="isManager" control={control}
            render={({ field: { onChange, value } }) => (
                <FormControlLabel
                    control={<Switch checked={value} onChange={onChange} color="primary" />}
                    label="Es Jefe de Área"
                />
            )}
        />

        <Button type="submit" variant="contained" color="primary">Crear usuario</Button>
      </Box>
    </Box>
  );
};

export default CreateCrownUserForm;