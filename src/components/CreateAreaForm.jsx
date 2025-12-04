// src/components/CreateAreaForm.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, Alert, FormHelperText
} from "@mui/material";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants";
import HotelSelect from "./common/HotelSelect";

const CreateAreaForm = ({ onClose, onSuccess, initialData }) => {
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  const [formData, setFormData] = useState({
    nombre: "",
    departamentoId: "",
    hotelId: "" 
  });
  
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]); 
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments/get?limit=0");
        setDepartments(res.data || []);
      } catch (err) {
        console.error("Error al cargar departamentos:", err);
        setError("No se pudieron cargar los departamentos.");
      }
    };
    fetchDepartments();

    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        departamentoId: initialData.departamentoId || "",
        hotelId: initialData.hotelId || "" 
      });
    }
  }, [initialData]);

  // Efecto: Filtrar departamentos cuando cambia el Hotel seleccionado (Solo Root)
  useEffect(() => {
    if (isRoot) {
        if (formData.hotelId) {
            const filtered = departments.filter(d => d.hotelId === Number(formData.hotelId));
            setFilteredDepartments(filtered);
        } else {
            setFilteredDepartments([]); 
        }
    } else {
        // Si no es Root, ve todos sus departamentos (ya filtrados por el backend)
        setFilteredDepartments(departments);
    }
  }, [formData.hotelId, departments, isRoot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        // Si cambia el hotel, limpiamos el departamento para evitar inconsistencias
        if (name === 'hotelId') {
            return { ...prev, [name]: value, departamentoId: "" };
        }
        return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre || !formData.departamentoId) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (isRoot && !formData.hotelId) {
        setError("Selecciona un Hotel.");
        return;
    }

    const payload = { ...formData };
    if (payload.hotelId) payload.hotelId = Number(payload.hotelId);
    else delete payload.hotelId;

    try {
      if (initialData) {
        await api.put(`/areas/put/${initialData.id}`, payload);
      } else {
        await api.post("/areas/post", payload);
      }
      onSuccess(); 
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar el área.");
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }} color="text.primary">
        {initialData ? "Editar Área" : "Crear Nueva Área"}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        
        {/* 👇 Selector de Hotel para ROOT */}
        {isRoot && (
            <HotelSelect 
                value={formData.hotelId} 
                onChange={handleChange} 
                name="hotelId"
                error={!formData.hotelId}
                // Si estamos editando, bloqueamos el cambio de hotel para evitar conflictos complejos
                required
            />
        )}

        <TextField 
            label="Nombre del Área" 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange} 
            fullWidth required 
        />

        <FormControl fullWidth required disabled={isRoot && !formData.hotelId}>
          <InputLabel>Departamento al que pertenece</InputLabel>
          <Select
            name="departamentoId"
            value={formData.departamentoId}
            onChange={handleChange}
            label="Departamento al que pertenece"
          >
            <MenuItem value=""><em>Seleccione un departamento</em></MenuItem>
            {filteredDepartments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>{dept.nombre}</MenuItem>
            ))}
          </Select>
          {isRoot && !formData.hotelId && <FormHelperText>Primero selecciona un hotel</FormHelperText>}
        </FormControl>

        <Button type="submit" variant="contained" color="primary">
          {initialData ? "Guardar Cambios" : "Crear Área"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateAreaForm;