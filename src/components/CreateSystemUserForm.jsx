// src/components/CreateSystemUserForm.jsx
import React, { useState, useContext } from "react";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button,
  FormHelperText
} from "@mui/material";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants"; // 👈 Importamos roles nuevos
import HotelSelect from "./common/HotelSelect"; // 👈 Importamos selector

const CreateSystemUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    rol: "",
    hotelId: "" // 👈 Nuevo campo
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (setError) setError("");
    if (setMessage) setMessage("");

    // Validación de Hotel para Root
    // Si crea un ROOT o CORP_VIEWER, el hotel puede ser nulo (Global).
    // Si crea un HOTEL_ADMIN/AUX, DEBE tener hotel.
    if (isRoot && !formData.hotelId && ![ROLES.ROOT, ROLES.CORP_VIEWER].includes(formData.rol)) {
        if(setError) setError("Para este rol, es obligatorio asignar un Hotel.");
        return;
    }

    const payload = { ...formData };
    
    if (payload.hotelId) payload.hotelId = Number(payload.hotelId);
    else delete payload.hotelId; // Si es nulo o vacío, no lo enviamos

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

      <Box component="form" onSubmit={handleCreateUser} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        
        {/* 👇 SELECTOR DE HOTEL (SOLO ROOT) */}
        {isRoot && (
            <HotelSelect 
                value={formData.hotelId} 
                onChange={handleChange} 
                name="hotelId"
                required={![ROLES.ROOT, ROLES.CORP_VIEWER].includes(formData.rol)} // Opcional solo para globales
                helperText="Deja vacío solo si es un usuario Global (Root/Corp)"
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
            {/* 👇 ROLES ACTUALIZADOS */}
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