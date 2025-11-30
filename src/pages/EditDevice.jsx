// src/pages/EditDevice.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, TextField, Button, Grid, Fade, 
  MenuItem, CircularProgress, Chip, Checkbox, 
  ListItemText, FormControlLabel, Switch, 
  Alert, ListSubheader, Avatar, Stack, Divider
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

// Iconos
import SaveIcon from '@mui/icons-material/Save';
import ComputerIcon from '@mui/icons-material/Computer';
import WifiIcon from '@mui/icons-material/Wifi';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Importaciones propias
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import PageHeader from "../components/common/PageHeader"; 
import SectionCard from "../components/common/SectionCard"; 
import StatusBadge from "../components/common/StatusBadge"; 
import "../pages/styles/ConfigButtons.css"; 

// --- Helpers ---
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 250 },
  },
};

const EditDevice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);

  // --- Estados ---
  const [formData, setFormData] = useState({
    nombre_equipo: "", modelo: "", numero_serie: "", ip_equipo: "", etiqueta: "",
    descripcion: "", usuarioId: "", perfiles_usuario: [], tipoId: "", estadoId: "",
    sistemaOperativoId: "", marca: "", licencia_so: "", office_version: "",
    office_tipo_licencia: "", office_serial: "", office_key: "", es_panda: false,
    garantia_numero_producto: "", garantia_numero_reporte: "", garantia_notes: "",
    garantia_inicio: "", garantia_fin: "", areaId: "", fecha_proxima_revision: "",
    motivo_baja: "", observaciones_baja: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Datos Maestros
  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceStatuses, setDeviceStatuses] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [areas, setAreas] = useState([]);
  
  // UI & Lógica
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bajaStatusId, setBajaStatusId] = useState(null);
  const [isPermanentlyBaja, setIsPermanentlyBaja] = useState(false);
  const [isWarrantyApplied, setIsWarrantyApplied] = useState(false);

  // --- Carga Inicial ---
  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);
        const [
          deviceResponse, usersRes, deviceTypesRes, 
          deviceStatusesRes, operatingSystemsRes, areasRes
        ] = await Promise.all([
          api.get(`/devices/get/${id}`),
          // 👇 AGREGADO ?limit=0 a todas las llamadas de catálogos
          api.get("/users/get?limit=0"), 
          api.get("/device-types/get?limit=0"),
          api.get("/device-status/get?limit=0"),
          api.get("/operating-systems/get?limit=0"),
          api.get("/areas/get?limit=0"),
        ]);

        const deviceData = deviceResponse.data;
        const formatDateForInput = (dateStr) => {
            if (!dateStr) return "";
            try { return new Date(dateStr).toISOString().substring(0, 10); } 
            catch (e) { return ""; }
        };

        // Si deviceStatusesRes es array lo usamos, si no (por error) usamos vacío
        const statusList = Array.isArray(deviceStatusesRes.data) ? deviceStatusesRes.data : [];
        const bajaStatus = statusList.find(s => s.nombre.toLowerCase() === 'baja');
        
        if (bajaStatus) setBajaStatusId(bajaStatus.id);
        if (bajaStatus && deviceData.estadoId === bajaStatus.id) setIsPermanentlyBaja(true);

        const hasWarrantyData = deviceData.garantia_numero_reporte || deviceData.garantia_notes;
        setIsWarrantyApplied(!!hasWarrantyData);

        setFormData({
          ...deviceData,
          perfiles_usuario: deviceData.perfiles_usuario ? deviceData.perfiles_usuario.split(',').map(s => s.trim()) : [],
          garantia_inicio: formatDateForInput(deviceData.garantia_inicio),
          garantia_fin: formatDateForInput(deviceData.garantia_fin),
          fecha_proxima_revision: formatDateForInput(deviceData.fecha_proxima_revision),
          es_panda: deviceData.es_panda || false,
          usuarioId: deviceData.usuarioId || "",
          areaId: deviceData.areaId || "",
          tipoId: deviceData.tipoId || "",
          estadoId: deviceData.estadoId || "",
          sistemaOperativoId: deviceData.sistemaOperativoId || "",
        });

        // Aseguramos que guardamos arrays (por si el backend fallara en limit=0)
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setDeviceTypes(Array.isArray(deviceTypesRes.data) ? deviceTypesRes.data : []);
        setDeviceStatuses(statusList);
        setOperatingSystems(Array.isArray(operatingSystemsRes.data) ? operatingSystemsRes.data : []);
        setAreas(Array.isArray(areasRes.data) ? areasRes.data : []);

      } catch (err) {
        console.error("Error cargando dispositivo:", err);
        setError("Error al cargar los datos del dispositivo.");
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceData();
  }, [id]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSwitchChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleWarrantySwitch = (e) => {
    setIsWarrantyApplied(e.target.checked);
    if (!e.target.checked) {
        setFormData(prev => ({ ...prev, garantia_numero_reporte: "", garantia_notes: "" }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.nombre_equipo?.trim()) tempErrors.nombre_equipo = "El nombre es obligatorio.";
    if (!formData.numero_serie?.trim()) tempErrors.numero_serie = "El N° serie es obligatorio.";
    if (!formData.marca?.trim()) tempErrors.marca = "Marca obligatoria.";
    if (!formData.modelo?.trim()) tempErrors.modelo = "Modelo obligatorio.";
    if (!formData.tipoId) tempErrors.tipoId = "Tipo obligatorio.";
    if (!formData.estadoId) tempErrors.estadoId = "Estado obligatorio.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setMessage("");

    const payload = { ...formData };
    
    const fieldsToRemove = [
        'id', 'created_at', 'updated_at', 'usuario', 'tipo', 'estado', 
        'sistema_operativo', 'area', 'maintenances', 'departamentoId', 'departamento'
    ];
    fieldsToRemove.forEach(field => delete payload[field]);

    const foreignKeys = ['areaId', 'usuarioId', 'tipoId', 'estadoId', 'sistemaOperativoId'];
    foreignKeys.forEach(key => { payload[key] = payload[key] ? Number(payload[key]) : null; });

    if (Array.isArray(payload.perfiles_usuario)) {
        payload.perfiles_usuario = payload.perfiles_usuario.length > 0 
            ? payload.perfiles_usuario.join(", ") : null;
    }

    if (!isWarrantyApplied) {
        payload.garantia_numero_reporte = null;
        payload.garantia_notes = null;
    }

    const formatDate = (date) => {
       const d = parseLocalDate(date);
       return d ? d.toISOString() : null;
    }
    payload.garantia_inicio = formatDate(payload.garantia_inicio);
    payload.garantia_fin = formatDate(payload.garantia_fin);
    payload.fecha_proxima_revision = formatDate(payload.fecha_proxima_revision);

    if (payload.estadoId !== bajaStatusId) {
      payload.motivo_baja = null;
      payload.observaciones_baja = null;
    }

    try {
      await api.put(`/devices/put/${id}`, payload);
      refreshAlerts();
      setMessage("Equipo actualizado correctamente.");
      setTimeout(() => {
          if (isPermanentlyBaja || payload.estadoId === bajaStatusId) navigate("/disposals");
          else navigate("/inventory");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al guardar cambios.");
    }
  };

  const getStatusName = () => {
      const status = deviceStatuses.find(s => s.id === formData.estadoId);
      return status ? status.nombre : "N/A";
  }

  const selectedArea = areas.find(a => a.id === formData.areaId);
  const departmentName = selectedArea?.departamento?.nombre || 'N/A';
  const assignedUser = users.find(u => u.id === formData.usuarioId);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        title={formData.nombre_equipo}
        subtitle={`${formData.marca} ${formData.modelo} • SN: ${formData.numero_serie}`}
        status={<StatusBadge status={getStatusName()} />}
        onBack={() => navigate(-1)}
        actions={
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleUpdate}
            className="primary-action-button"
          >
            Guardar
          </Button>
        }
      />

      {/* 2. MENSAJES */}
      <Box sx={{ px: 3, mb: 2 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {isPermanentlyBaja && (
            <Alert severity="warning" icon={<DeleteForeverIcon />} sx={{ mb: 2 }}>
                Este equipo está dado de baja. La edición está restringida.
            </Alert>
        )}
      </Box>

      {/* 3. CONTENIDO (DISEÑO UNIFICADO) */}
      <Box component="form" noValidate sx={{ px: 3 }}>
        <Grid container spacing={3}>
          
          {/* === COLUMNA IZQUIERDA === */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              
              {/* CARD 1: IDENTIDAD DEL EQUIPO */}
              <SectionCard title="Identidad del Equipo" icon={<ComputerIcon />}>
                <Stack spacing={3}>
                    {/* Fila 1: Nombre y Etiqueta */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Nombre del Equipo *" name="nombre_equipo" fullWidth value={formData.nombre_equipo} onChange={handleChange} required error={!!errors.nombre_equipo} helperText={errors.nombre_equipo} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Etiqueta / ID" name="etiqueta" fullWidth value={formData.etiqueta} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    {/* Fila 2: Marca, Modelo, Tipo */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Marca *" name="marca" fullWidth value={formData.marca} onChange={handleChange} required error={!!errors.marca} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Modelo *" name="modelo" fullWidth value={formData.modelo} onChange={handleChange} required error={!!errors.modelo} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                label="Tipo *"
                                name="tipoId"
                                fullWidth
                                value={formData.tipoId || ""}
                                onChange={handleChange}
                                required
                                error={!!errors.tipoId}
                            >
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {deviceTypes.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    {/* Fila 3: Serie y Descripción */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Número de Serie *" name="numero_serie" fullWidth value={formData.numero_serie} onChange={handleChange} required error={!!errors.numero_serie} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                             <TextField label="Notas Breves" name="descripcion" fullWidth value={formData.descripcion} onChange={handleChange} placeholder="Ej. Pantalla con rayón" />
                        </Grid>
                    </Grid>
                </Stack>
              </SectionCard>

              {/* CARD 2: RED Y SOFTWARE */}
              <SectionCard title="Red y Software" icon={<WifiIcon />}>
                <Stack spacing={3}>
                  {/* Fila 1: IP y SO */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ width: '100%' }}>
                      <TextField label="Dirección IP" name="ip_equipo" fullWidth value={formData.ip_equipo} onChange={handleChange} placeholder="Ej: 192.168.1.15" />
                    </Box>
                    <Box sx={{ width: '100%' }}>
                      <TextField select label="Sistema Operativo" name="sistemaOperativoId" fullWidth value={formData.sistemaOperativoId || ""} onChange={handleChange}>
                        <MenuItem value=""><em>Ninguno</em></MenuItem>
                        {operatingSystems.map((os) => (<MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>))}
                      </TextField>
                    </Box>
                  </Stack>

                  {/* Fila 2: Office */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>Licenciamiento Office</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField label="Versión Office" name="office_version" size="small" fullWidth value={formData.office_version} onChange={handleChange} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField label="Tipo Licencia" name="office_tipo_licencia" size="small" fullWidth value={formData.office_tipo_licencia} onChange={handleChange} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField label="Clave/Serial" name="office_key" size="small" fullWidth value={formData.office_key} onChange={handleChange} />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Fila 3: Panda */}
                  <Box>
                    <Divider sx={{ mb: 2 }} />
                    <FormControlLabel
                      control={<Switch checked={formData.es_panda} onChange={handleSwitchChange} name="es_panda" color="success" />}
                      label={<Box><Typography variant="body1">Panda Antivirus Instalado</Typography><Typography variant="caption" color="text.secondary">Activa si cuenta con protección endpoint</Typography></Box>}
                      sx={{ width: '100%', ml: 0 }}
                    />
                  </Box>
                </Stack>
              </SectionCard>

              {/* CARD 3: GARANTÍA */}
              <SectionCard title="Garantía y Ciclo de Vida" icon={<VerifiedUserIcon />} color={isWarrantyApplied ? "primary.main" : "text.disabled"}>
                <Stack spacing={3}>
                   <FormControlLabel
                        control={<Switch checked={isWarrantyApplied} onChange={handleWarrantySwitch} name="isWarrantyApplied" />}
                        label="Aplicar información de garantía"
                   />
                   
                   <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                          <TextField label="Inicio Garantía" type="date" name="garantia_inicio" fullWidth value={formData.garantia_inicio} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <TextField label="Fin Garantía" type="date" name="garantia_fin" fullWidth value={formData.garantia_fin} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                      </Grid>
                   </Grid>

                   {isWarrantyApplied && (
                     <Fade in={isWarrantyApplied}>
                         <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2, border: '1px dashed #bdbdbd' }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Detalles del Proveedor</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="N° Reporte Prov." name="garantia_numero_reporte" size="small" fullWidth value={formData.garantia_numero_reporte} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="N° Producto" name="garantia_numero_producto" size="small" fullWidth value={formData.garantia_numero_producto} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Notas del Servicio" name="garantia_notes" size="small" fullWidth multiline rows={2} value={formData.garantia_notes} onChange={handleChange} />
                                </Grid>
                            </Grid>
                         </Box>
                     </Fade>
                   )}
                   
                   <Divider />
                   
                   <Box>
                       <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                           <CalendarMonthIcon fontSize="small"/> Planificación
                       </Typography>
                       <TextField label="Sugerir Próxima Revisión" type="date" name="fecha_proxima_revision" fullWidth value={formData.fecha_proxima_revision} onChange={handleChange} InputLabelProps={{ shrink: true }} helperText="Fecha sugerida para mantenimiento preventivo" />
                   </Box>
                </Stack>
              </SectionCard>

            </Stack>
          </Grid>

          {/* === COLUMNA DERECHA === */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3} sx={{ position: 'sticky', top: 100 }}>
              
              {/* CARD 4: ASIGNACIÓN */}
              <SectionCard title="Responsable Actual" icon={<PersonIcon />}>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                            {assignedUser ? assignedUser.nombre.charAt(0).toUpperCase() : "?"}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{assignedUser ? assignedUser.nombre : "Sin Asignar"}</Typography>
                            <Typography variant="body2" color="text.secondary">{assignedUser ? assignedUser.usuario_login : "---"}</Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    <TextField
                        select
                        label="Área"
                        name="areaId"
                        fullWidth
                        value={formData.areaId || ""}
                        onChange={handleChange}
                    >
                        <MenuItem value=""><em>Ninguna</em></MenuItem>
                        {areas.map(area => (
                            <MenuItem key={area.id} value={area.id}>{area.nombre}</MenuItem>
                        ))}
                    </TextField>
                    
                    <TextField 
                        label="Departamento" 
                        fullWidth 
                        value={departmentName} 
                        InputProps={{ readOnly: true }} 
                        variant="filled" 
                        size="small"
                    />

                    <TextField
                        select
                        label="Usuario Asignado"
                        name="usuarioId"
                        fullWidth
                        value={formData.usuarioId || ""}
                        onChange={handleChange}
                    >
                        <MenuItem value=""><em>Ninguno</em></MenuItem>
                        {users.map((u) => (<MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>))}
                    </TextField>

                    <TextField
                        select
                        label="Perfiles (Sesiones)"
                        name="perfiles_usuario"
                        fullWidth
                        value={formData.perfiles_usuario}
                        onChange={handleChange}
                        SelectProps={{
                            multiple: true,
                            renderValue: (selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                                </Box>
                            ),
                            MenuProps: MenuProps
                        }}
                    >
                        {users.map((u) => (
                            <MenuItem key={u.id} value={u.nombre}>
                                <Checkbox checked={formData.perfiles_usuario.indexOf(u.nombre) > -1} />
                                <ListItemText primary={u.nombre} />
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>
              </SectionCard>

              {/* CARD 5: ESTADO */}
              <SectionCard title="Estado del Activo" icon={<SettingsIcon />}>
                 <TextField
                    select
                    label="Estado Actual *"
                    name="estadoId"
                    fullWidth
                    value={formData.estadoId || ""}
                    onChange={handleChange}
                    disabled={isPermanentlyBaja}
                    error={!!errors.estadoId}
                 >
                    {deviceStatuses.map((s) => (<MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>))}
                 </TextField>

                 <Fade in={formData.estadoId === bajaStatusId} mountOnEnter unmountOnExit>
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#fff4e5', borderRadius: 2, border: '1px solid #ffcc80' }}>
                        <Typography variant="subtitle2" color="warning.dark" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                            <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }}/> Zona de Baja
                        </Typography>
                        <Stack spacing={2}>
                            <TextField label="Motivo de Baja" name="motivo_baja" size="small" fullWidth value={formData.motivo_baja} onChange={handleChange} />
                            <TextField label="Observaciones Finales" name="observaciones_baja" size="small" fullWidth multiline rows={3} value={formData.observaciones_baja} onChange={handleChange} />
                        </Stack>
                    </Box>
                 </Fade>
              </SectionCard>

            </Stack>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default EditDevice;