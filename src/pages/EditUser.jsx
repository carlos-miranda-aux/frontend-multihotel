import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Paper, Alert, FormControl, InputLabel, Select, MenuItem, Divider
} from "@mui/material";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants"; 
import HotelSelect from "../components/common/HotelSelect"; 

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    rol: "",
    password: "",
    hotelIds: [] 
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/auth/get/${id}`);
        const userData = response.data;
        
        const assignedHotelIds = userData.hotels ? userData.hotels.map(h => h.id) : [];

        setFormData({
          nombre: userData.nombre || "",
          username: userData.username || "",
          email: userData.email || "",
          rol: userData.rol || ROLES.HOTEL_GUEST,
          hotelIds: assignedHotelIds, 
          password: "",
        });
      } catch (err) {
        setError(err.response?.data?.error || "Error al cargar los datos.");
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // VALIDACIÓN EN TIEMPO REAL
    if (name === "username") {
        const cleanValue = value.toLowerCase().replace(/\s/g, "");
        setFormData({ ...formData, [name]: cleanValue });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");

    if (formData.username === "root" && formData.rol !== ROLES.ROOT) {
      setError("No se puede cambiar el rol del usuario ROOT.");
      return;
    }
    
    const payload = { ...formData };
    
    if (!payload.password) delete payload.password; 

    try {
      await api.put(`/auth/put/${id}`, payload);
      setMessage("Usuario actualizado correctamente.");
      setTimeout(() => navigate("/user-manager"), 1500); 
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar.");
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }} color="primary">
        Editar Usuario: {formData.username}
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box component="form" onSubmit={handleUpdateUser} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          
          {isRoot && (
            <HotelSelect 
                value={formData.hotelIds} 
                onChange={handleChange} 
                name="hotelIds"
                multiple={true} 
                required={![ROLES.ROOT, ROLES.CORP_VIEWER].includes(formData.rol)}
                helperText="Selecciona los hoteles a los que tendrá acceso"
            />
          )}

          <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth />
          
          {/* Validación de Username */}
          <TextField 
            label="Nombre de usuario" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            fullWidth 
            helperText="Sin espacios, minúsculas automáticas."
          />

          <TextField label="Correo electrónico" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth />
          
          <FormControl fullWidth disabled={formData.username === "root"}>
            <InputLabel>Rol</InputLabel>
            <Select name="rol" value={formData.rol} onChange={handleChange} label="Rol">
                <MenuItem value={ROLES.HOTEL_ADMIN}>Admin de Hotel</MenuItem>
                <MenuItem value={ROLES.HOTEL_AUX}>Auxiliar</MenuItem>
                <MenuItem value={ROLES.HOTEL_GUEST}>Invitado</MenuItem>
                {isRoot && <Divider />}
                {isRoot && <MenuItem value={ROLES.CORP_VIEWER}>Auditor Global</MenuItem>}
                {isRoot && <MenuItem value={ROLES.ROOT}>Root</MenuItem>}
            </Select>
          </FormControl>

          <TextField label="Nueva Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth helperText="Dejar en blanco para mantener la actual." />
          
          <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: 'flex-start', mt: 1 }}>
            Guardar cambios
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditUser;