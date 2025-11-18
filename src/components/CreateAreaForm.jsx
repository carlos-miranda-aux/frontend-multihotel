import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert
} from "@mui/material";
import api from "../api/axios";

const CreateAreaForm = ({ onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    departamentoId: "",
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");

  // Cargar departamentos al montar
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments/get");
        setDepartments(res.data || []);
      } catch (err) {
        console.error("Error al cargar departamentos:", err);
        setError("No se pudieron cargar los departamentos.");
      }
    };
    fetchDepartments();

    // Si estamos editando, rellenar datos
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        departamentoId: initialData.departamentoId || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre || !formData.departamentoId) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      if (initialData) {
        // MODO EDICIÓN
        await api.put(`/areas/put/${initialData.id}`, formData);
      } else {
        // MODO CREACIÓN
        await api.post("/areas/post", formData);
      }
      onSuccess(); // Recargar tabla y cerrar modal
      onClose();
    } catch (err) {
      console.error("Error al guardar área:", err);
      setError(err.response?.data?.error || "Error al guardar el área.");
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {initialData ? "Editar Área" : "Crear Nueva Área"}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Nombre del Área"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          fullWidth
          required
        />

        <FormControl fullWidth required>
          <InputLabel>Departamento al que pertenece</InputLabel>
          <Select
            name="departamentoId"
            value={formData.departamentoId}
            onChange={handleChange}
            label="Departamento al que pertenece"
          >
            <MenuItem value="">
              <em>Seleccione un departamento</em>
            </MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary">
          {initialData ? "Guardar Cambios" : "Crear Área"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateAreaForm;