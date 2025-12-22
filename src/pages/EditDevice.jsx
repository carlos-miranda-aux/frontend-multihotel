import React, { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box, Typography, TextField, Button, Grid, Fade, MenuItem, CircularProgress, 
  Chip, Checkbox, ListItemText, FormControlLabel, Switch, Alert, Avatar, Stack, Divider, 
  FormControl, InputLabel, Select, OutlinedInput, ListSubheader, FormHelperText,
  Autocomplete
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

// Iconos
import SaveIcon from '@mui/icons-material/Save';
import ComputerIcon from '@mui/icons-material/Computer';
import WifiIcon from '@mui/icons-material/Wifi';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import DomainIcon from '@mui/icons-material/Domain';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import DescriptionIcon from '@mui/icons-material/Description'; 

import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext"; 
import { ROLES, DEVICE_STATUS } from "../config/constants"; 
import PageHeader from "../components/common/PageHeader"; 
import SectionCard from "../components/common/SectionCard"; 
import StatusBadge from "../components/common/StatusBadge"; 

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = { PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 250 } } };

const EditDevice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);
  const { user, getHotelName } = useContext(AuthContext); 
  const isRoot = user?.rol === ROLES.ROOT;

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      nombre_equipo: "", modelo: "", numero_serie: "", ip_equipo: "", etiqueta: "",
      descripcion: "", comentarios: "", usuarioId: "", perfiles_usuario: [], tipoId: "", 
      estadoId: "", sistemaOperativoId: "", marca: "", licencia_so: "", office_version: "",
      office_tipo_licencia: "", office_serial: "", office_key: "", es_panda: false,
      garantia_numero_producto: "", garantia_numero_reporte: "", garantia_notes: "",
      garantia_inicio: "", garantia_fin: "", areaId: "", fecha_proxima_revision: "",
      motivo_baja: "", observaciones_baja: "", fecha_baja: "", isWarrantyApplied: false, 
      hotelId: ""
    }
  });

  const watchEstadoId = watch("estadoId");
  const watchHotelId = watch("hotelId");
  const watchUsuarioId = watch("usuarioId");
  const watchAreaId = watch("areaId");
  const isWarrantyApplied = watch("isWarrantyApplied");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceStatuses, setDeviceStatuses] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [areas, setAreas] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPermanentlyBaja, setIsPermanentlyBaja] = useState(false);
  
  const [downloadingDoc, setDownloadingDoc] = useState(false);

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);
      
        const [deviceResponse, usersRes, deviceTypesRes, deviceStatusesRes, operatingSystemsRes, areasRes] = await Promise.all([
          api.get(`/devices/get/${id}`),
          api.get("/users/get/all"),
          api.get("/device-types/get?limit=0"),
          api.get("/device-status/get?limit=0"),
          api.get("/operating-systems/get?limit=0"),
          api.get("/areas/get?limit=0"),
        ]);

        const deviceData = deviceResponse.data;
        const formatDate = (d) => d ? new Date(d).toISOString().substring(0, 10) : "";
        const statusList = Array.isArray(deviceStatusesRes.data) ? deviceStatusesRes.data : [];
        
        const bajaStatusName = DEVICE_STATUS.DISPOSED.toLowerCase();
        const currentStatusName = deviceData.estado?.nombre?.toLowerCase();
        
        if (currentStatusName === bajaStatusName) {
            setIsPermanentlyBaja(true);
        }

        reset({
          ...deviceData,
          perfiles_usuario: deviceData.perfiles_usuario ? deviceData.perfiles_usuario.split(',').map(s => s.trim()) : [],
          garantia_inicio: formatDate(deviceData.garantia_inicio),
          garantia_fin: formatDate(deviceData.garantia_fin),
          fecha_proxima_revision: formatDate(deviceData.fecha_proxima_revision),
          fecha_baja: formatDate(deviceData.fecha_baja), 
          es_panda: deviceData.es_panda || false,
          usuarioId: deviceData.usuarioId || "",
          areaId: deviceData.areaId || "",
          tipoId: deviceData.tipoId || "",
          estadoId: deviceData.estadoId || "",
          sistemaOperativoId: deviceData.sistemaOperativoId || "",
          comentarios: deviceData.comentarios || "",
          isWarrantyApplied: !!(deviceData.garantia_numero_reporte || deviceData.garantia_notes),
          hotelId: deviceData.hotelId
        });

        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setDeviceTypes(Array.isArray(deviceTypesRes.data) ? deviceTypesRes.data : []);
        setDeviceStatuses(statusList);
        setOperatingSystems(Array.isArray(operatingSystemsRes.data) ? operatingSystemsRes.data : []);
        setAreas(Array.isArray(areasRes.data) ? areasRes.data : []);
      } catch (err) {
        setError("Error al cargar el dispositivo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceData();
  }, [id, reset]);

  /**
   * Lógica de filtrado de usuarios para el Autocomplete
   */
  const getFilteredUsers = () => {
    let list = users;
    
    // 1. Filtrar por Hotel (si el usuario es ROOT)
    if (isRoot && watchHotelId) {
        list = list.filter(u => u.hotelId === Number(watchHotelId));
    }
    
    // 2. Filtrar por Área si se seleccionó una manualmente
    if (watchAreaId) {
        list = list.filter(u => u.areaId === Number(watchAreaId));
    }
    
    return list;
  };

  const onSubmit = async (data) => {
    setError(""); setMessage("");
    const payload = { ...data };

    const currentStatusObj = deviceStatuses.find(s => s.id === payload.estadoId);
    const isDisposing = currentStatusObj?.nombre === DEVICE_STATUS.DISPOSED;

    const fieldsToRemove = [
        'id', 'created_at', 'updated_at', 'usuario', 'tipo', 'estado', 
        'sistema_operativo', 'area', 'maintenances', 'departamentoId', 
        'departamento', 'isWarrantyApplied', 'hotelId', 'hotel'
    ]; 
    fieldsToRemove.forEach(field => delete payload[field]); 

    if (!isDisposing) {
        payload.fecha_baja = null;
        payload.motivo_baja = null;
        payload.observaciones_baja = null;
    } else {
        if (!payload.fecha_baja) {
            payload.fecha_baja = new Date().toISOString();
        } else {
            payload.fecha_baja = new Date(payload.fecha_baja).toISOString();
        }
    }

    const foreignKeys = ['areaId', 'usuarioId', 'tipoId', 'estadoId', 'sistemaOperativoId'];
    foreignKeys.forEach(key => { payload[key] = payload[key] ? Number(payload[key]) : null; });

    if (Array.isArray(payload.perfiles_usuario)) payload.perfiles_usuario = payload.perfiles_usuario.join(", ");
    
    ['garantia_inicio', 'garantia_fin', 'fecha_proxima_revision'].forEach(key => {
        payload[key] = payload[key] ? new Date(payload[key]).toISOString() : null;
    });

    try {
      await api.put(`/devices/put/${id}`, payload);
      refreshAlerts();
      setMessage("Guardado correctamente.");
      setTimeout(() => navigate("/inventory"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al guardar el equipo.");
    }
  };

  const handleDownloadResguardo = async () => {
      setDownloadingDoc(true);
      try {
          const response = await api.get(`/devices/export/resguardo/${id}`, {
              responseType: 'blob', 
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Resguardo_${watch("nombre_equipo") || "Equipo"}.docx`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
      } catch (err) {
          console.error(err);
          setError("Error al descargar el resguardo. Verifica que la plantilla exista en el servidor.");
      } finally {
          setDownloadingDoc(false);
      }
  };

  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;
    const filteredAreas = isRoot && watchHotelId ? areas.filter(a => a.hotelId == watchHotelId) : areas;
    const sortedAreas = [...filteredAreas].sort((a, b) => (a.departamento?.nombre || "").localeCompare(b.departamento?.nombre || ""));
    
    sortedAreas.forEach(area => {
      if (area.departamento?.nombre && area.departamento.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.departamentoId}`} disableSticky>{area.departamento.nombre}</ListSubheader>);
        lastDept = area.departamento.nombre;
      }
      options.push(<MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>{area.nombre}</MenuItem>);
    });
    return options;
  };

  const getStatusName = () => { const s = deviceStatuses.find(s => s.id === watchEstadoId); return s ? s.nombre : "N/A"; }
  const assignedUser = users.find(u => u.id === watchUsuarioId);
  const isAdmin = user?.rol === ROLES.HOTEL_ADMIN || isRoot;
  const hotelName = getHotelName(watchHotelId);
  
  const currentStatusObj = deviceStatuses.find(s => s.id === watchEstadoId);
  const isStatusBaja = currentStatusObj?.nombre === DEVICE_STATUS.DISPOSED;

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <PageHeader 
        title={watch("nombre_equipo")}
        subtitle={isRoot ? `Ubicación: ${hotelName}` : `${watch("marca")} ${watch("modelo")}`}
        status={<StatusBadge status={getStatusName()} />}
        onBack={() => navigate(-1)}
        actions={
            <>
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    startIcon={downloadingDoc ? <CircularProgress size={20} color="inherit" /> : <DescriptionIcon />} 
                    onClick={handleDownloadResguardo}
                    disabled={downloadingDoc}
                >
                    {downloadingDoc ? "Generando..." : "Resguardo"}
                </Button>
                <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>
                    Guardar Cambios
                </Button>
            </>
        }
      />

      <Box sx={{ px: 3, mb: 2 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Box>

      <Box component="form" noValidate sx={{ px: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {isRoot && (
                 <Alert severity="info" icon={<DomainIcon />}>
                    Estás editando un equipo del hotel: <b>{hotelName}</b>.
                 </Alert>
              )}
              <SectionCard title="Identidad del Equipo" icon={<ComputerIcon />}>
                 <Stack spacing={3}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><Controller name="nombre_equipo" control={control} rules={{ required: "Requerido" }} render={({ field }) => <TextField {...field} label="Nombre del Equipo" fullWidth required error={!!errors.nombre_equipo} />} /></Grid>
                        <Grid item xs={12} sm={6}><Controller name="etiqueta" control={control} render={({ field }) => <TextField {...field} label="Etiqueta" fullWidth />} /></Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}><Controller name="marca" control={control} render={({ field }) => <TextField {...field} label="Marca" fullWidth />} /></Grid>
                        <Grid item xs={12} sm={4}><Controller name="modelo" control={control} render={({ field }) => <TextField {...field} label="Modelo" fullWidth />} /></Grid>
                        <Grid item xs={12} sm={4}><FormControl fullWidth><InputLabel>Tipo</InputLabel><Controller name="tipoId" control={control} render={({ field }) => <Select {...field} label="Tipo"><MenuItem value=""><em>Ninguno</em></MenuItem>{deviceTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}</Select>} /></FormControl></Grid>
                    </Grid>
                    <Controller name="numero_serie" control={control} render={({ field }) => <TextField {...field} label="Número de Serie" fullWidth />} />
                    <Controller name="descripcion" control={control} render={({ field }) => <TextField {...field} label="Descripción" fullWidth multiline rows={2} />} />
                    <Controller name="comentarios" control={control} render={({ field }) => <TextField {...field} label="Comentarios / Observaciones" fullWidth multiline rows={2} />} />
                 </Stack>
              </SectionCard>
              
              <SectionCard title="Red y Software" icon={<WifiIcon />}>
                  <Stack spacing={2}>
                      <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}><Controller name="ip_equipo" control={control} render={({ field }) => <TextField {...field} label="Dirección IP" fullWidth />} /></Grid>
                          <Grid item xs={12} sm={6}>
                              <FormControl fullWidth>
                                  <InputLabel>Sistema Operativo</InputLabel>
                                  <Controller name="sistemaOperativoId" control={control} render={({ field }) => (
                                      <Select {...field} label="Sistema Operativo">
                                          <MenuItem value=""><em>Ninguno</em></MenuItem>
                                          {operatingSystems.map(os => <MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>)}
                                      </Select>
                                  )} />
                              </FormControl>
                          </Grid>
                      </Grid>
                      <Divider />
                      <Typography variant="subtitle2" color="text.secondary">Licencias</Typography>
                      <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}><Controller name="licencia_so" control={control} render={({ field }) => <TextField {...field} label="Licencia Windows" fullWidth />} /></Grid>
                          <Grid item xs={12} sm={6}><Controller name="office_version" control={control} render={({ field }) => <TextField {...field} label="Versión Office" fullWidth />} /></Grid>
                          <Grid item xs={12} sm={6}><Controller name="office_serial" control={control} render={({ field }) => <TextField {...field} label="Serial Office" fullWidth />} /></Grid>
                          <Grid item xs={12} sm={6}><Controller name="office_key" control={control} render={({ field }) => <TextField {...field} label="Key Office" fullWidth />} /></Grid>
                      </Grid>
                      <Controller name="es_panda" control={control} render={({ field: { onChange, value } }) => (<FormControlLabel control={<Switch checked={value} onChange={onChange} color="success" />} label="Antivirus Panda Instalado" />)} />
                  </Stack>
              </SectionCard>

              <SectionCard title="Garantía" icon={<VerifiedUserIcon />}>
                  <Stack spacing={2}>
                      <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}><Controller name="garantia_numero_producto" control={control} render={({ field }) => <TextField {...field} label="N° Producto / Servicio" fullWidth />} /></Grid>
                          <Grid item xs={12} sm={6}><Controller name="garantia_inicio" control={control} render={({ field }) => <TextField {...field} label="Inicio Garantía" type="date" fullWidth InputLabelProps={{ shrink: true }} />} /></Grid>
                          <Grid item xs={12} sm={6}><Controller name="garantia_fin" control={control} render={({ field }) => <TextField {...field} label="Fin Garantía" type="date" fullWidth InputLabelProps={{ shrink: true }} />} /></Grid>
                          <Grid item xs={12} sm={6}><Controller name="fecha_proxima_revision" control={control} render={({ field }) => <TextField {...field} label="Próxima Revisión" type="date" fullWidth InputLabelProps={{ shrink: true }} />} /></Grid>
                      </Grid>
                      <Controller name="isWarrantyApplied" control={control} render={({ field: { onChange, value } }) => (<FormControlLabel control={<Switch checked={value} onChange={onChange} />} label="¿Se ha aplicado garantía?" />)} />
                      <Fade in={isWarrantyApplied} unmountOnExit>
                          <Stack spacing={2}>
                              <Controller name="garantia_numero_reporte" control={control} render={({ field }) => <TextField {...field} label="Número de Reporte" fullWidth />} />
                              <Controller name="garantia_notes" control={control} render={({ field }) => <TextField {...field} label="Notas de Garantía" fullWidth multiline rows={2} />} />
                          </Stack>
                      </Fade>
                  </Stack>
              </SectionCard>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={3} sx={{ position: 'sticky', top: 20 }}>
              <SectionCard title="Responsable Actual" icon={<PersonIcon />}>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>{assignedUser ? assignedUser.nombre.charAt(0) : "?"}</Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">{assignedUser ? assignedUser.nombre : "Sin Asignar"}</Typography>
                          <Typography variant="caption" color="text.secondary">{assignedUser ? assignedUser.usuario_login : ""}</Typography>
                        </Box>
                    </Box>
                    
                    <FormControl fullWidth>
                      <InputLabel>Área</InputLabel>
                      <Controller 
                        name="areaId" 
                        control={control} 
                        render={({ field }) => (
                          <Select {...field} label="Área">
                            <MenuItem value=""><em>Ninguna</em></MenuItem>
                            {renderAreaOptions()}
                          </Select>
                        )} 
                      />
                    </FormControl>

                    <Controller
                        name="usuarioId"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Autocomplete
                                options={getFilteredUsers()}
                                getOptionLabel={(option) => option.nombre || ""}
                                value={getFilteredUsers().find(u => u.id === value) || null}
                                isOptionEqualToValue={(option, val) => option.id === val.id}
                                onChange={(_, newValue) => {
                                    onChange(newValue ? newValue.id : "");
                                    // AUTO-RELLENO: Al cambiar el responsable, se ajusta el área automáticamente
                                    if (newValue?.areaId) {
                                        setValue("areaId", newValue.areaId);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Responsable (Staff)" 
                                        placeholder="Buscar por nombre..."
                                        error={!!errors.usuarioId}
                                        helperText={errors.usuarioId?.message}
                                    />
                                )}
                                noOptionsText="No se encontraron usuarios"
                            />
                        )}
                    />

                    <FormControl fullWidth>
                      <InputLabel>Perfiles de Usuario</InputLabel>
                      <Controller 
                        name="perfiles_usuario" 
                        control={control} 
                        render={({ field }) => (
                          <Select 
                            {...field} 
                            multiple 
                            input={<OutlinedInput label="Perfiles de Usuario" />} 
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                              </Box>
                            )} 
                            MenuProps={MenuProps}
                          >
                            {users
                              .filter(u => !isRoot || !watchHotelId || u.hotelId == watchHotelId)
                              .map((user) => (
                                <MenuItem key={user.id} value={user.nombre}>
                                    <Checkbox checked={field.value.indexOf(user.nombre) > -1} />
                                    <ListItemText primary={user.nombre} />
                                </MenuItem>
                            ))}
                          </Select>
                        )} 
                      />
                    </FormControl>
                </Stack>
              </SectionCard>

              <SectionCard title="Estado del Activo" icon={<SettingsIcon />}>
                 <Stack spacing={2}>
                     <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Controller name="estadoId" control={control} render={({ field }) => (<Select {...field} label="Estado" disabled={isPermanentlyBaja && !isAdmin}>{deviceStatuses.map(s => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}</Select>)} />
                     </FormControl>
                     
                     <Fade in={isStatusBaja} unmountOnExit>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: 'error.50', borderRadius: 2, border: '1px dashed', borderColor: 'error.main' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}><EventBusyIcon fontSize="small" /><Typography variant="subtitle2" fontWeight="bold">Detalles de la Baja</Typography></Box>
                            <Controller name="motivo_baja" control={control} rules={{ required: isStatusBaja ? "El motivo es obligatorio." : false }} render={({ field }) => (<TextField {...field} label="Motivo de Baja" fullWidth size="small" color="error" required={isStatusBaja} error={!!errors.motivo_baja} helperText={errors.motivo_baja?.message} />)} />
                            <Controller name="observaciones_baja" control={control} render={({ field }) => (<TextField {...field} label="Observaciones" fullWidth multiline rows={2} size="small" color="error" />)} />
                            <Controller name="fecha_baja" control={control} render={({ field }) => (<TextField {...field} label="Fecha de Baja" type="date" fullWidth size="small" color="error" InputLabelProps={{ shrink: true }} />)} />
                        </Box>
                     </Fade>
                     {isPermanentlyBaja && !isAdmin && <Alert severity="warning">Este equipo está dado de baja (Inactivo).</Alert>}
                 </Stack>
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default EditDevice;