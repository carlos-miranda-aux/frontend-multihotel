import React, { useState, useContext, useEffect } from "react";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button, Divider, Alert
} from "@mui/material";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants"; 
import HotelSelect from "./common/HotelSelect"; 

const CreateSystemUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  const { user, selectedHotelId: contextHotelId } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;
  const isContextActive = !!contextHotelId;

  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    rol: "", // Rol inicial vacío para obligar selección
    hotelIds: isContextActive ? [Number(contextHotelId)] : [] 
  });
  
  // Estado derivado para saber si el rol seleccionado es global
  const [isGlobalRole, setIsGlobalRole] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "username") {
        const cleanValue = value.toLowerCase().replace(/\s/g, "");
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } 
    else if (name === "rol") {
        // Lógica de limpieza automática
        const isGlobal = [ROLES.ROOT, ROLES.CORP_VIEWER].includes(value);
        setIsGlobalRole(isGlobal);
        
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            // Si es global, vaciamos los hoteles automáticamente
            hotelIds: isGlobal ? [] : prev.hotelIds 
        }));
    }
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleHotelsChange = (event) => {
      const { value } = event.target;
      // En Material UI Select multiple, value es un array
      setFormData(prev => ({ ...prev, hotelIds: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (setError) setError("");
    if (setMessage) setMessage("");

    // Validación local antes de enviar
    if (isRoot && !isGlobalRole && formData.hotelIds.length === 0) {
        if(setError) setError("Para roles locales (Admin/Aux/Invitado), es obligatorio asignar al menos un Hotel.");
        return;
    }

    const payload = { ...formData };
    
    // Limpieza final por seguridad
    if (isGlobalRole || !payload.hotelIds || payload.hotelIds.length === 0) {
        delete payload.hotelIds;
    }

    try {
      await api.post("/auth/create-user", payload);
      if (setMessage) setMessage("Usuario del sistema creado exitosamente.");
      onUserCreated();
      onClose();
    } catch (err) {
      if (setError) setError(err.response?.data?.error || "Error al crear el usuario.");
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }} color="text.primary">
        Crear nuevo usuario del sistema
      </Typography>

      {isContextActive && (
          <Alert severity="info" sx={{ mb: 2 }}>
              Creando usuario vinculado al <b>Hotel Activo</b>.
          </Alert>
      )}
      
      {isGlobalRole && (
          <Alert severity="warning" sx={{ mb: 2 }}>
              Los usuarios globales tienen acceso a <b>todos los hoteles</b>. No es necesario asignar uno específico.
          </Alert>
      )}

      <Box component="form" onSubmit={handleCreateUser} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        
        <TextField label="Nombre completo" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
        
        <TextField 
            label="Nombre de usuario" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            fullWidth 
            required 
            helperText="Sin espacios, minúsculas automáticas."
        />
        
        <TextField label="Correo electrónico" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
        <TextField label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required />
        
        <FormControl fullWidth required>
          <InputLabel>Rol del Sistema</InputLabel>
          <Select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            label="Rol del Sistema"
          >
            <MenuItem value={ROLES.HOTEL_ADMIN}>Admin de Hotel (IT Manager)</MenuItem>
            <MenuItem value={ROLES.HOTEL_AUX}>Auxiliar (Soporte)</MenuItem>
            <MenuItem value={ROLES.HOTEL_GUEST}>Invitado (Solo lectura)</MenuItem>
            
            {isRoot && <Divider />} 
            {isRoot && <MenuItem value={ROLES.CORP_VIEWER} sx={{ color: 'warning.main' }}>Auditor Corporativo (Global)</MenuItem>}
            {isRoot && <MenuItem value={ROLES.ROOT} sx={{ color: 'error.main', fontWeight: 'bold' }}>Super Usuario (Root)</MenuItem>}
          </Select>
        </FormControl>

        {/* SELECTOR DE HOTELES (Solo visible para ROOT si no hay contexto fijo) */}
        {isRoot && !isContextActive && (
            <HotelSelect 
                value={formData.hotelIds} 
                onChange={handleHotelsChange} 
                name="hotelIds"
                multiple={true}
                required={!isGlobalRole}
                disabled={isGlobalRole} // 🔒 Se deshabilita si es Global
                helperText={isGlobalRole ? "Acceso global automático" : "Selecciona los hoteles permitidos"}
            />
        )}
        
        <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 1 }}>
          Crear usuario
        </Button>
      </Box>
    </Box>
  );
};

export default CreateSystemUserForm;