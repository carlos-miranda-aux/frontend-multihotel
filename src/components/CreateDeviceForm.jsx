// src/components/CreateDeviceForm.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button, Divider, Stack, ListSubheader, OutlinedInput, Chip, Checkbox, ListItemText,
  FormControlLabel, Switch, Fade 
} from "@mui/material";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import "../pages/styles/ConfigButtons.css";

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

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
    comentarios: "", 
    ip_equipo: "",
    usuarioId: "",
    perfiles_usuario: [], 
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
    es_panda: false,
    garantia_numero_producto: "",
    garantia_numero_reporte: "", 
    garantia_notes: "",         
    garantia_inicio: "",
    garantia_fin: "",
    areaId: "", 
    fecha_proxima_revision: "",
  });

  const [errors, setErrors] = useState({});
  const [isWarrantyApplied, setIsWarrantyApplied] = useState(false);

  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [areas, setAreas] = useState([]); 
  const { refreshAlerts } = useContext(AlertContext);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // CORRECCIÓN APLICADA: Se agregó ?limit=0 a device-types y operating-systems
        // para asegurar que el backend devuelva un Array [] y no un objeto paginado {data:[], totalCount}.
        const [usersRes, deviceTypesRes, operatingSystemsRes, areasRes] = 
          await Promise.all([
            api.get("/users/get/all"),
            api.get("/device-types/get?limit=0"),      // <--- Corregido
            api.get("/operating-systems/get?limit=0"), // <--- Corregido
            api.get("/areas/get?limit=0"), 
          ]);
        
        // Verificación de seguridad para evitar pantallas blancas si la API falla
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setDeviceTypes(Array.isArray(deviceTypesRes.data) ? deviceTypesRes.data : []);
        setOperatingSystems(Array.isArray(operatingSystemsRes.data) ? operatingSystemsRes.data : []);
        setAreas(Array.isArray(areasRes.data) ? areasRes.data : []); 

      } catch (err) {
        console.error("Error fetching form data:", err);
        if (setError) setError("Error al cargar los datos del formulario.");
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
  
  const handleSwitchChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };
  
  const handleWarrantySwitch = (e) => {
    setIsWarrantyApplied(e.target.checked);
    if (!e.target.checked) {
        setFormData(prev => ({
            ...prev,
            garantia_numero_reporte: "",
            garantia_notes: ""
        }));
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
    if (setError) setError("");
    if (setMessage) setMessage("");

    if (!validate()) {
      if (setError) setError("Por favor completa los campos obligatorios.");
      return;
    }

    const payload = {};
    for (const key in formData) {
      const value = formData[key];
      
      if (key === 'areaId' || key === 'usuarioId' || key === 'tipoId' || key === 'sistemaOperativoId') {
        payload[key] = value ? Number(value) : null;
        continue;
      }
      if (key === 'es_panda') {
        payload[key] = value;
        continue;
      }
      if (key === 'perfiles_usuario') {
        payload[key] = (Array.isArray(value) && value.length > 0) 
            ? value.join(", ") 
            : null;
        continue;
      }
      if (!isWarrantyApplied && (key === 'garantia_numero_reporte' || key === 'garantia_notes')) {
          payload[key] = null;
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
      if (setMessage) setMessage("Equipo creado exitosamente.");
      refreshAlerts();
      if (onDeviceCreated) onDeviceCreated();
      onClose();
    } catch (err) {
      if (setError) setError(err.response?.data?.error || "Error al crear el equipo.");
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
        
        {/* --- INFORMACIÓN GENERAL --- */}
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }} className="modal-subtitle-color">
            Información General
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Etiqueta" name="etiqueta" value={formData.etiqueta} onChange={handleChange} fullWidth />
                <TextField label="Número de Serie" name="numero_serie" value={formData.numero_serie} onChange={handleChange} fullWidth required error={!!errors.numero_serie} helperText={errors.numero_serie} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Nombre del equipo" name="nombre_equipo" value={formData.nombre_equipo} onChange={handleChange} fullWidth required error={!!errors.nombre_equipo} helperText={errors.nombre_equipo} />
                <TextField label="Rol / Puesto (Descripción)" name="descripcion" value={formData.descripcion} onChange={handleChange} fullWidth placeholder="Ej. Recepción Lobby" />
            </Stack>
            
            <TextField 
                label="Comentarios / Estado físico" 
                name="comentarios" 
                value={formData.comentarios} 
                onChange={handleChange} 
                fullWidth 
                multiline
                rows={2}
                placeholder="Ej. Pantalla con rayón, equipo prestado, etc."
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="IP del equipo" name="ip_equipo" value={formData.ip_equipo} onChange={handleChange} fullWidth />
                <TextField label="Marca" name="marca" value={formData.marca} onChange={handleChange} fullWidth required error={!!errors.marca} helperText={errors.marca} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                 <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <TextField label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} fullWidth required error={!!errors.modelo} helperText={errors.modelo} />
                 </Box>
            </Stack>
        </Stack>


        {/* --- ASIGNACIÓN Y UBICACIÓN --- */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} className="modal-subtitle-color">
            Asignación y Ubicación
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={2}>
            {/* Fila 1 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth>
                    <InputLabel>Área</InputLabel>
                    <Select name="areaId" value={formData.areaId} onChange={handleChange} label="Área">
                        <MenuItem value=""><em>Ninguno</em></MenuItem>
                        {renderAreaOptions()}
                    </Select>
                    </FormControl>
                </Box>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth>
                    <InputLabel>Responsable</InputLabel>
                    <Select name="usuarioId" value={formData.usuarioId} onChange={handleChange} label="Responsable">
                        <MenuItem value=""><em>Ninguno</em></MenuItem>
                        {users.map((user) => (<MenuItem key={user.id} value={user.id}>{user.nombre}</MenuItem>))}
                    </Select>
                    </FormControl>
                </Box>
            </Stack>

            {/* Fila 2 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: '100%' }}>
                     <FormControl fullWidth>
                        <InputLabel id="perfiles-multiple-checkbox-label">Perfiles de Usuarios</InputLabel>
                        <Select
                            labelId="perfiles-multiple-checkbox-label"
                            name="perfiles_usuario"
                            multiple
                            value={formData.perfiles_usuario} 
                            onChange={handleChange}
                            input={<OutlinedInput label="Perfiles de Usuario" />}
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
                </Box>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth error={!!errors.tipoId}>
                        <InputLabel>Tipo *</InputLabel>
                        <Select name="tipoId" value={formData.tipoId} onChange={handleChange} label="Tipo *">
                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                            {deviceTypes.map((type) => (<MenuItem key={type.id} value={type.id}>{type.nombre}</MenuItem>))}
                        </Select>
                        {errors.tipoId && <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>{errors.tipoId}</Typography>}
                    </FormControl>
                </Box>
            </Stack>
        </Stack>
        
        {/* --- SOFTWARE Y LICENCIAS --- */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} className="modal-subtitle-color">Software y Licencias</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth>
                        <InputLabel>Sistema Operativo</InputLabel>
                        <Select name="sistemaOperativoId" value={formData.sistemaOperativoId} onChange={handleChange} label="Sistema Operativo">
                        <MenuItem value=""><em>Ninguno</em></MenuItem>
                        {operatingSystems.map((os) => (<MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Box>
                <TextField label="Licencia de SO" name="licencia_so" value={formData.licencia_so} onChange={handleChange} fullWidth />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Versión de Office" name="office_version" value={formData.office_version} onChange={handleChange} fullWidth />
                <TextField label="Tipo de Licencia de Office" name="office_tipo_licencia" value={formData.office_tipo_licencia} onChange={handleChange} fullWidth />
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Serial de Office" name="office_serial" value={formData.office_serial} onChange={handleChange} fullWidth />
                <TextField label="Clave de Office" name="office_key" value={formData.office_key} onChange={handleChange} fullWidth />
            </Stack>
            
            <FormControlLabel
                  control={<Switch checked={formData.es_panda} onChange={handleSwitchChange} name="es_panda" />}
                  label="¿Tiene Panda instalado?"
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', width: '100%', m: 0 }}
            />
        </Stack>


        {/* --- GARANTÍA --- */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} className="modal-subtitle-color">Garantía</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
             <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Número de producto" name="garantia_numero_producto" value={formData.garantia_numero_producto} onChange={handleChange} fullWidth />
                <TextField label="Inicio de Garantía" name="garantia_inicio" type="date" value={formData.garantia_inicio} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Fin de Garantía" name="garantia_fin" type="date" value={formData.garantia_fin} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
            
            <FormControlLabel
                control={<Switch checked={isWarrantyApplied} onChange={handleWarrantySwitch} name="isWarrantyApplied" />}
                label="¿Se aplicó garantía?"
                labelPlacement="start"
                sx={{ justifyContent: 'space-between', width: '100%', m: 0 }}
            />
            <Divider />
            
             <Fade in={isWarrantyApplied} mountOnEnter unmountOnExit>
                 <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 1 }}>
                    <TextField 
                        label="N° Reporte" 
                        name="garantia_numero_reporte" 
                        value={formData.garantia_numero_reporte} 
                        onChange={handleChange} 
                        fullWidth 
                        helperText="Registro." 
                    />
                    <TextField 
                        label="Notas" 
                        name="garantia_notes" 
                        value={formData.garantia_notes} 
                        onChange={handleChange} 
                        fullWidth 
                        multiline 
                        rows={2} 
                        helperText="Detalles." 
                    />
                 </Stack>
             </Fade>
             
             <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                <TextField label="Próxima Revisión Sugerida" name="fecha_proxima_revision" type="date" value={formData.fecha_proxima_revision} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
             </Box>
        </Stack>

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