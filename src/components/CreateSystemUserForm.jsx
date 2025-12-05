// src/components/CreateSystemUserForm.jsx
import React, { useState, useContext } from "react";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button, Divider, Alert
} from "@mui/material";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants"; 
import HotelSelect from "./common/HotelSelect"; 

const CreateSystemUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  // 👇 1. OBTENER CONTEXTO
  const { user, selectedHotelId: contextHotelId } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;
  const isContextActive = !!contextHotelId;

  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    rol: "",
    // 👇 2. PRE-LLENAR SI HAY CONTEXTO
    hotelIds: isContextActive ? [Number(contextHotelId)] : [] 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (setError) setError("");
    if (setMessage) setMessage("");

    // Validación para admins locales
    if (isRoot && formData.hotelIds.length === 0 && ![ROLES.ROOT, ROLES.CORP_VIEWER].includes(formData.rol)) {
        if(setError) setError("Para este rol, es obligatorio asignar al menos un Hotel.");
        return;
    }

    const payload = { ...formData };
    
    // El backend espera 'hotelIds' como array de números
    if (!payload.hotelIds || payload.hotelIds.length === 0) {
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

      {/* Mensaje visual si hay contexto fijo */}
      {isContextActive && (
          <Alert severity="info" sx={{ mb: 2 }}>
              Creando usuario para el <b>Hotel Activo</b>. (Para asignar múltiples hoteles, usa la Vista Global).
          </Alert>
      )}

      <Box component="form" onSubmit={handleCreateUser} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        
        {/* Selector de Hotel Múltiple (Solo para ROOT) */}
        {isRoot && (
            <HotelSelect 
                value={formData.hotelIds} 
                onChange={handleChange} 
                name="hotelIds"
                multiple={true}
                required={![ROLES.ROOT, ROLES.CORP_VIEWER].includes(formData.rol)}
                disabled={isContextActive} // 🔒 3. BLOQUEAR SI HAY CONTEXTO
                helperText={isContextActive ? "Ubicación fijada por el contexto actual" : "Puedes seleccionar varios hoteles"}
            />
        )}

        <TextField label="Nombre completo" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
        <TextField label="Nombre de usuario" name="username" value={formData.username} onChange={handleChange} fullWidth required />
        <TextField label="Correo electrónico" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
        <TextField label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required />
        
        <FormControl fullWidth required>
          <InputLabel>Rol</InputLabel>
          <Select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            label="Rol"
          >
            <MenuItem value={ROLES.HOTEL_ADMIN}>Admin de Hotel (IT Manager)</MenuItem>
            <MenuItem value={ROLES.HOTEL_AUX}>Auxiliar (Soporte)</MenuItem>
            <MenuItem value={ROLES.HOTEL_GUEST}>Invitado (Solo lectura)</MenuItem>
            
            {isRoot && <Divider />} 
            {isRoot && <MenuItem value={ROLES.CORP_VIEWER}>Auditor Corporativo (Global)</MenuItem>}
            {isRoot && <MenuItem value={ROLES.ROOT}>Super Usuario (Root)</MenuItem>}
          </Select>
        </FormControl>
        
        <Button type="submit" variant="contained" color="primary">
          Crear usuario
        </Button>
      </Box>
    </Box>
  );
};

export default CreateSystemUserForm;