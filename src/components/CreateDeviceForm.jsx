// src/components/CreateDeviceForm.jsx
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
} from "@mui/material";
import api from "../api/axios";

const CreateDeviceForm = ({ onClose, onDeviceCreated, setMessage, setError }) => {
  const [formData, setFormData] = useState({
    etiqueta: "",
    nombre_equipo: "",
    descripcion: "",
    ip_equipo: "",
    usuarioId: "",
    tipoId: "",
    marca: "",
    modelo: "",
    numero_serie: "",
    estadoId: "",
    sistemaOperativoId: "",
    licencia_so: "",
    office_version: "",
    office_tipo_licencia: "",
    office_serial: "",
    office_key: "",
    garantia_numero_producto: "",
    garantia_inicio: "",
    garantia_fin: "",
    departamentoId: "", // 👈 Campo de departamento agregado aquí
  });
  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceStatuses, setDeviceStatuses] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [usersRes, deviceTypesRes, deviceStatusesRes, operatingSystemsRes, departmentsRes] =
        await Promise.all([
          api.get("/users/get"),
          api.get("/device-types/get"),
          api.get("/device-status/get"),
          api.get("/operating-systems/get"),
          api.get("/departments/get")
        ]);
      setUsers(usersRes.data);
      setDeviceTypes(deviceTypesRes.data);
      setDeviceStatuses(deviceStatusesRes.data);
      setOperatingSystems(operatingSystemsRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      console.error("Error fetching form data:", err);
      setError("Error al cargar los datos del formulario.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/devices/post", formData);
      setMessage("Equipo creado exitosamente.");
      onDeviceCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el equipo.");
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Crear nuevo equipo
      </Typography>
      <Box component="form" onSubmit={handleCreateDevice} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Etiqueta"
          name="etiqueta"
          value={formData.etiqueta}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Número de Serie"
          name="numero_serie"
          value={formData.numero_serie}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="IP del equipo"
          name="ip_equipo"
          value={formData.ip_equipo}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Marca"
          name="marca"
          value={formData.marca}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Modelo"
          name="modelo"
          value={formData.modelo}
          onChange={handleChange}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select
            name="tipoId"
            value={formData.tipoId}
            onChange={handleChange}
            label="Tipo"
          >
            <MenuItem value="">
              <em>Ninguno</em>
            </MenuItem>
            {deviceTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>{type.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Estado</InputLabel>
          <Select
            name="estadoId"
            value={formData.estadoId}
            onChange={handleChange}
            label="Estado"
          >
            <MenuItem value="">
              <em>Ninguno</em>
            </MenuItem>
            {deviceStatuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>{status.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Departamento</InputLabel>
          <Select
            name="departamentoId"
            value={formData.departamentoId}
            onChange={handleChange}
            label="Departamento"
          >
            <MenuItem value="">
              <em>Ninguno</em>
            </MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>{dept.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Usuario Asignado</InputLabel>
          <Select
            name="usuarioId"
            value={formData.usuarioId}
            onChange={handleChange}
            label="Usuario Asignado"
          >
            <MenuItem value="">
              <em>Ninguno</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>{user.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary">
          Crear Equipo
        </Button>
      </Box>
    </Box>
  );
};

export default CreateDeviceForm;