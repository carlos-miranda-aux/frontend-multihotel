import React, { useState, useContext } from "react";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants";
import HotelSelect from "./common/HotelSelect";

const CreateDepartmentForm = ({ onClose, onSuccess, initialData }) => {
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    hotelId: initialData?.hotelId || ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.nombre) return setError("El nombre es obligatorio.");
    if (isRoot && !formData.hotelId) return setError("Selecciona un hotel.");

    const payload = { ...formData };
    if (payload.hotelId) payload.hotelId = Number(payload.hotelId);

    try {
      if (initialData) await api.put(`/departments/put/${initialData.id}`, payload);
      else await api.post("/departments/post", payload);
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" fontWeight="bold">{initialData ? "Editar" : "Crear"} Departamento</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      
      {isRoot && (
        <HotelSelect 
            value={formData.hotelId} 
            onChange={(e) => setFormData({...formData, hotelId: e.target.value})} 
            name="hotelId" required 
        />
      )}
      <TextField 
        label="Nombre del Departamento" 
        value={formData.nombre} 
        onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
        fullWidth required 
      />
      <Button type="submit" variant="contained" color="primary">Guardar</Button>
    </Box>
  );
};

export default CreateDepartmentForm;