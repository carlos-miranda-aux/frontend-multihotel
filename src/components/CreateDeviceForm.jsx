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
  Grid,
  Divider,
  Stack,
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
    sistemaOperativoId: "",
    licencia_so: "",
    office_version: "",
    office_tipo_licencia: "",
    office_serial: "",
    office_key: "",
    garantia_numero_producto: "",
    garantia_inicio: "",
    garantia_fin: "",
    departamentoId: "",
  });

  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [usersRes, deviceTypesRes, operatingSystemsRes, departmentsRes] =
          await Promise.all([
            api.get("/users/get"),
            api.get("/device-types/get"),
            api.get("/operating-systems/get"),
            api.get("/departments/get"),
          ]);
        setUsers(usersRes.data);
        setDeviceTypes(deviceTypesRes.data);
        setOperatingSystems(operatingSystemsRes.data);
        setDepartments(departmentsRes.data);
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError("Error al cargar los datos del formulario.");
      }
    };
    fetchFormData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {};
    for (const key in formData) {
      payload[key] = formData[key]?.trim() === "" ? null : formData[key];
    }

    try {
      await api.post("/devices/post", payload);
      setMessage("Equipo creado exitosamente.");
      onDeviceCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el equipo.");
    }
  };

  return (
    <Box sx={{ maxHeight: "85vh", overflowY: "auto", p: 3, bgcolor: "#f9f9f9", borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Crear nuevo equipo
      </Typography>

      <form onSubmit={handleCreateDevice}>
        {/* INFORMACIÓN GENERAL */}
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          Información General
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Etiqueta"
              name="etiqueta"
              value={formData.etiqueta}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Número de Serie"
              name="numero_serie"
              value={formData.numero_serie}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre del equipo"
              name="nombre_equipo"
              value={formData.nombre_equipo}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="IP del equipo"
              name="ip_equipo"
              value={formData.ip_equipo}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Marca"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* ASIGNACIÓN Y UBICACIÓN */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Asignación y Ubicación
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
              <InputLabel>Tipo</InputLabel>
              <Select name="tipoId" value={formData.tipoId} onChange={handleChange} label="Tipo">
                <MenuItem value="">
                  <em>Ninguno</em>
                </MenuItem>
                {deviceTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
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
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
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
                  <MenuItem key={user.id} value={user.id}>
                    {user.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* SOFTWARE Y LICENCIAS */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Software y Licencias
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 200 }}>
              <InputLabel>Sistema Operativo</InputLabel>
              <Select
                name="sistemaOperativoId"
                value={formData.sistemaOperativoId}
                onChange={handleChange}
                label="Sistema Operativo"
              >
                <MenuItem value="">
                  <em>Ninguno</em>
                </MenuItem>
                {operatingSystems.map((os) => (
                  <MenuItem key={os.id} value={os.id}>
                    {os.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Licencia de SO"
              name="licencia_so"
              value={formData.licencia_so}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Versión de Office"
              name="office_version"
              value={formData.office_version}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Tipo de Licencia de Office"
              name="office_tipo_licencia"
              value={formData.office_tipo_licencia}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Serial de Office"
              name="office_serial"
              value={formData.office_serial}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Clave de Office"
              name="office_key"
              value={formData.office_key}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>


        {/* GARANTÍA */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Garantía
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Número de producto de garantía"
              name="garantia_numero_producto"
              value={formData.garantia_numero_producto}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Inicio de Garantía"
              name="garantia_inicio"
              type="date"
              value={formData.garantia_inicio}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Fin de Garantía"
              name="garantia_fin"
              type="date"
              value={formData.garantia_fin}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* BOTÓN CREAR */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button type="submit" variant="contained" color="primary">
            Crear Equipo
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default CreateDeviceForm;
