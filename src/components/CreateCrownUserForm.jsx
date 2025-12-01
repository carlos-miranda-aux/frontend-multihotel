// src/components/CreateCrownUserForm.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form"; // 👈 Hook Form
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button,
  FormControlLabel, Switch, ListSubheader
} from "@mui/material";
import api from "../api/axios";

const CreateCrownUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  const { control, handleSubmit } = useForm({
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
    
    const payload = {
      ...data,
      areaId: data.areaId || null,
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
            name="nombre" control={control} rules={{ required: true }}
            render={({ field }) => <TextField {...field} label="Nombre" fullWidth required />}
        />
        <Controller
            name="correo" control={control}
            render={({ field }) => <TextField {...field} label="Correo" type="email" fullWidth />}
        />
        
        <FormControl fullWidth required>
          <InputLabel>Área</InputLabel>
          <Controller
            name="areaId" control={control} rules={{ required: true }}
            render={({ field }) => (
                <Select {...field} label="Área">
                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                    {renderAreaOptions()}
                </Select>
            )}
          />
        </FormControl>
        
        <Controller
            name="usuario_login" control={control}
            render={({ field }) => <TextField {...field} label="Usuario de Login" fullWidth />}
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