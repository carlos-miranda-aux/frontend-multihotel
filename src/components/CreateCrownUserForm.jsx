// src/components/CreateCrownUserForm.jsx
import React, { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form"; 
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button,
  FormControlLabel, Switch, ListSubheader, FormHelperText
} from "@mui/material";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants";
import HotelSelect from "./common/HotelSelect";

const CreateCrownUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  const { user } = useContext(AuthContext); 
  const isRoot = user?.rol === ROLES.ROOT;

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { 
        nombre: "", correo: "", areaId: "", usuario_login: "", isManager: false, 
        hotelId: "" // 👈 Campo extra para Root
    }
  });
  
  const [areas, setAreas] = useState([]);
  const selectedHotelId = watch("hotelId");
  
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
      nombre: data.nombre,
      correo: data.correo,
      usuario_login: data.usuario_login,
      areaId: data.areaId ? Number(data.areaId) : null,
      es_jefe_de_area: data.isManager
    };

    // 🛡️ Lógica Root
    if (isRoot) {
        if (!data.hotelId) {
             if (setError) setError("Selecciona un hotel."); return;
        }
        payload.hotelId = Number(data.hotelId);
    }

    try {
      await api.post("/users/post", payload);
      if (setMessage) setMessage("Usuario creado exitosamente.");
      onUserCreated();
      onClose();
    } catch (err) {
      if (setError) setError(err.response?.data?.error || "Error al crear.");
    }
  };

  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;

    // Filtro de áreas para ROOT
    let filteredAreas = areas;
    if (isRoot && selectedHotelId) {
        filteredAreas = areas.filter(a => a.hotelId === Number(selectedHotelId));
    } else if (isRoot && !selectedHotelId) {
        filteredAreas = [];
    }

    const sortedAreas = [...filteredAreas].sort((a, b) => (a.departamento?.nombre || "").localeCompare(b.departamento?.nombre || ""));

    sortedAreas.forEach(area => {
      if (area.departamento?.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.departamentoId}`} sx={{ fontWeight: 'bold', color: 'primary.main' }}>{area.departamento?.nombre}</ListSubheader>);
        lastDept = area.departamento?.nombre;
      }
      options.push(<MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>{area.nombre}</MenuItem>);
    });
    
    if (isRoot && !selectedHotelId) {
        options.push(<MenuItem key="no-hotel" disabled>Primero selecciona un Hotel</MenuItem>);
    }

    return options;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }} color="text.primary">
        Crear nuevo miembro de Staff
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        
        {/* 👇 SELECTOR PARA ROOT */}
        {isRoot && (
             <Controller
                name="hotelId" control={control}
                render={({ field }) => <HotelSelect value={field.value} onChange={field.onChange} error={!!errors.hotelId} />}
            />
        )}

        <Controller
            name="nombre" control={control} rules={{ required: "El nombre es obligatorio" }}
            render={({ field }) => (
                <TextField 
                    {...field} 
                    label="Nombre" 
                    fullWidth 
                    required 
                    error={!!errors.nombre} 
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