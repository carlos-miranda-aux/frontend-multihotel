// src/components/CreateDeviceForm.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button, Grid, Divider, Stack, ListSubheader, OutlinedInput, Chip, Checkbox, ListItemText
} from "@mui/material";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import "../pages/styles/ConfigButtons.css";

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

// Configuración para el menú desplegable múltiple
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const CreateDeviceForm = ({ onClose, onDeviceCreated, setMessage, setError }) => {
  const [formData, setFormData] = useState({
    etiqueta: "",
    nombre_equipo: "",
    descripcion: "",
    ip_equipo: "",
    usuarioId: "",
    perfiles_usuario: [], // 👈 AHORA ES UN ARRAY PARA EL MULTI-SELECT
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
    areaId: "", 
    fecha_proxima_revision: "",
  });

  const [errors, setErrors] = useState({});

  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [areas, setAreas] = useState([]); 
  const { refreshAlerts } = useContext(AlertContext);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [usersRes, deviceTypesRes, operatingSystemsRes, areasRes] = 
          await Promise.all([
            api.get("/users/get/all"),
            api.get("/device-types/get"),
            api.get("/operating-systems/get"),
            api.get("/areas/get?limit=0"), 
          ]);
        setUsers(usersRes.data);
        setDeviceTypes(deviceTypesRes.data);
        setOperatingSystems(operatingSystemsRes.data);
        setAreas(areasRes.data); 
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError("Error al cargar los datos del formulario.");
      }
    };
    fetchFormData();
  }, [setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.nombre_equipo.trim()) tempErrors.nombre_equipo = "El nombre es obligatorio.";
    if (!formData.numero_serie.trim()) tempErrors.numero_serie = "El número de serie es obligatorio.";
    if (!formData.marca.trim()) tempErrors.marca = "La marca es obligatoria.";
    if (!formData.modelo.trim()) tempErrors.modelo = "El modelo es obligatorio.";
    if (!formData.tipoId) tempErrors.tipoId = "El tipo de equipo es obligatorio.";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validate()) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }

    const payload = {};
    for (const key in formData) {
      const value = formData[key];
      
      // Caso especial: areaId
      if (key === 'areaId') {
        payload[key] = value ? Number(value) : null;
        continue;
      }

      // 👈 CASO ESPECIAL: perfiles_usuario (Array -> String)
      if (key === 'perfiles_usuario') {
        // Si es un array con datos, lo unimos por comas. Si está vacío, null.
        payload[key] = (Array.isArray(value) && value.length > 0) 
            ? value.join(", ") 
            : null;
        continue;
      }

      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        payload[key] = trimmedValue === "" ? null : trimmedValue;
      } else {
        payload[key] = value;
      }
    }

    const localGarantiainicio = parseLocalDate(payload.garantia_inicio);
    const localGarantiaFin = parseLocalDate(payload.garantia_fin);
    const localProximaRevision = parseLocalDate(payload.fecha_proxima_revision);

    payload.garantia_inicio = localGarantiainicio ? localGarantiainicio.toISOString() : null;
    payload.garantia_fin = localGarantiaFin ? localGarantiaFin.toISOString() : null;
    payload.fecha_proxima_revision = localProximaRevision ? localProximaRevision.toISOString() : null;
    
    try {
      await api.post("/devices/post", payload);
      setMessage("Equipo creado exitosamente.");
      refreshAlerts();
      onDeviceCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el equipo.");
    }
  };
  
  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;
    const sortedAreas = [...areas].sort((a, b) => {
        const deptA = a.departamento?.nombre || "";
        const deptB = b.departamento?.nombre || "";
        return deptA.localeCompare(deptB);
    });

    sortedAreas.forEach(area => {
      if (area.departamento?.nombre && area.departamento.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.departamentoId}`}>{area.departamento.nombre}</ListSubheader>);
        lastDept = area.departamento.nombre;
      }
      options.push(
        <MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>
          {area.nombre}
        </MenuItem>
      );
    });
    return options;
  };

  return (
    <Box sx={{ maxHeight: "85vh", overflowY: "auto", p: 3, bgcolor: "#f9f9f9", borderRadius: 2 }}>
      <Typography 
        variant="h5" 
        sx={{ mb: 3, fontWeight: "bold" }}
        className="modal-title-color"
      >
        Crear nuevo equipo
      </Typography>

      <form onSubmit={handleCreateDevice} noValidate>
        {/* ... (INFORMACIÓN GENERAL - SIN CAMBIOS) ... */}
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }} className="modal-subtitle-color">
            Información General
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Etiqueta (Opcional)" name="etiqueta" value={formData.etiqueta} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Número de Serie" name="numero_serie" value={formData.numero_serie} onChange={handleChange} fullWidth required error={!!errors.numero_serie} helperText={errors.numero_serie} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Nombre del equipo" name="nombre_equipo" value={formData.nombre_equipo} onChange={handleChange} fullWidth required error={!!errors.nombre_equipo} helperText={errors.nombre_equipo} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Descripción" name="descripcion" value={formData.descripcion} onChange={handleChange} fullWidth multiline minRows={2} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="IP del equipo" name="ip_equipo" value={formData.ip_equipo} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Marca" name="marca" value={formData.marca} onChange={handleChange} fullWidth required error={!!errors.marca} helperText={errors.marca} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} fullWidth required error={!!errors.modelo} helperText={errors.modelo} />
          </Grid>
        </Grid>

        {/* ASIGNACIÓN Y UBICACIÓN */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} className="modal-subtitle-color">
            Asignación y Ubicación
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 180 }} error={!!errors.tipoId}>
              <InputLabel>Tipo *</InputLabel>
              <Select name="tipoId" value={formData.tipoId} onChange={handleChange} label="Tipo *">
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {deviceTypes.map((type) => (<MenuItem key={type.id} value={type.id}>{type.nombre}</MenuItem>))}
              </Select>
              {errors.tipoId && <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>{errors.tipoId}</Typography>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
              <InputLabel>Área</InputLabel>
              <Select name="areaId" value={formData.areaId} onChange={handleChange} label="Área">
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {renderAreaOptions()}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 180 }}>
              <InputLabel>Responsable (Jefe)</InputLabel>
              <Select name="usuarioId" value={formData.usuarioId} onChange={handleChange} label="Responsable (Jefe)">
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {users.map((user) => (<MenuItem key={user.id} value={user.id}>{user.nombre}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>

          {/* 👇 NUEVO SELECT MÚLTIPLE PARA PERFILES */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="perfiles-multiple-checkbox-label">Perfiles de Usuario (Sesiones extra)</InputLabel>
              <Select
                labelId="perfiles-multiple-checkbox-label"
                name="perfiles_usuario"
                multiple
                value={formData.perfiles_usuario} // Debe ser array
                onChange={handleChange}
                input={<OutlinedInput label="Perfiles de Usuario (Sesiones extra)" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.nombre}>
                    <Checkbox checked={formData.perfiles_usuario.indexOf(user.nombre) > -1} />
                    <ListItemText primary={user.nombre} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* ... (RESTO DEL FORMULARIO - SOFTWARE Y GARANTÍA - IGUAL) ... */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} className="modal-subtitle-color">Software y Licencias</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel>Sistema Operativo</InputLabel>
                <Select name="sistemaOperativoId" value={formData.sistemaOperativoId} onChange={handleChange} label="Sistema Operativo">
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {operatingSystems.map((os) => (<MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>))}
                </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}><TextField label="Licencia de SO" name="licencia_so" value={formData.licencia_so} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={4}><TextField label="Versión de Office" name="office_version" value={formData.office_version} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={4}><TextField label="Tipo de Licencia de Office" name="office_tipo_licencia" value={formData.office_tipo_licencia} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={4}><TextField label="Serial de Office" name="office_serial" value={formData.office_serial} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={4}><TextField label="Clave de Office" name="office_key" value={formData.office_key} onChange={handleChange} fullWidth /></Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} className="modal-subtitle-color">Garantía</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField label="Número de producto de garantía" name="garantia_numero_producto" value={formData.garantia_numero_producto} onChange={handleChange} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Inicio de Garantía" name="garantia_inicio" type="date" value={formData.garantia_inicio} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Fin de Garantía" name="garantia_fin" type="date" value={formData.garantia_fin} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Próxima Revisión Sugerida" name="fecha_proxima_revision" type="date" value={formData.fecha_proxima_revision} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            className="primary-action-button"
          >
            Crear Equipo
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default CreateDeviceForm;