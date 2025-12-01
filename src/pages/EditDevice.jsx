// src/pages/EditDevice.jsx
import React, { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form"; // 👈 IMPORTACIÓN
import {
  Box, Typography, TextField, Button, Grid, Fade, MenuItem, CircularProgress, 
  Chip, Checkbox, ListItemText, FormControlLabel, Switch, Alert, Avatar, Stack, Divider, 
  FormControl, InputLabel, FormHelperText, useTheme, alpha
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

import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import PageHeader from "../components/common/PageHeader"; 
import SectionCard from "../components/common/SectionCard"; 
import StatusBadge from "../components/common/StatusBadge"; 

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 250 } },
};

const EditDevice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);
  const theme = useTheme();

  // 👇 CONFIGURACIÓN DE REACT HOOK FORM
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      nombre_equipo: "", modelo: "", numero_serie: "", ip_equipo: "", etiqueta: "",
      descripcion: "", comentarios: "", usuarioId: "", perfiles_usuario: [], tipoId: "", 
      estadoId: "", sistemaOperativoId: "", marca: "", licencia_so: "", office_version: "",
      office_tipo_licencia: "", office_serial: "", office_key: "", es_panda: false,
      garantia_numero_producto: "", garantia_numero_reporte: "", garantia_notes: "",
      garantia_inicio: "", garantia_fin: "", areaId: "", fecha_proxima_revision: "",
      motivo_baja: "", observaciones_baja: "", isWarrantyApplied: false
    }
  });

  // Watchers para lógica condicional
  const watchAreaId = watch("areaId");
  const watchUsuarioId = watch("usuarioId");
  const watchEstadoId = watch("estadoId");
  const isWarrantyApplied = watch("isWarrantyApplied");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceStatuses, setDeviceStatuses] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [areas, setAreas] = useState([]);
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bajaStatusId, setBajaStatusId] = useState(null);
  const [isPermanentlyBaja, setIsPermanentlyBaja] = useState(false);

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);
        const [
          deviceResponse, usersRes, deviceTypesRes, 
          deviceStatusesRes, operatingSystemsRes, areasRes
        ] = await Promise.all([
          api.get(`/devices/get/${id}`),
          api.get("/users/get?limit=0"), 
          api.get("/device-types/get?limit=0"),
          api.get("/device-status/get?limit=0"),
          api.get("/operating-systems/get?limit=0"),
          api.get("/areas/get?limit=0"),
        ]);

        const deviceData = deviceResponse.data;
        const formatDate = (d) => d ? new Date(d).toISOString().substring(0, 10) : "";

        const statusList = Array.isArray(deviceStatusesRes.data) ? deviceStatusesRes.data : [];
        const bajaStatus = statusList.find(s => s.nombre.toLowerCase() === 'baja');
        if (bajaStatus) setBajaStatusId(bajaStatus.id);
        if (bajaStatus && deviceData.estadoId === bajaStatus.id) setIsPermanentlyBaja(true);

        const hasWarrantyData = !!(deviceData.garantia_numero_reporte || deviceData.garantia_notes);

        // 👇 POBLAR EL FORMULARIO
        reset({
          ...deviceData,
          perfiles_usuario: deviceData.perfiles_usuario ? deviceData.perfiles_usuario.split(',').map(s => s.trim()) : [],
          garantia_inicio: formatDate(deviceData.garantia_inicio),
          garantia_fin: formatDate(deviceData.garantia_fin),
          fecha_proxima_revision: formatDate(deviceData.fecha_proxima_revision),
          es_panda: deviceData.es_panda || false,
          // Aseguramos que los IDs sean strings vacíos si son null para que los Selects no se quejen
          usuarioId: deviceData.usuarioId || "",
          areaId: deviceData.areaId || "",
          tipoId: deviceData.tipoId || "",
          estadoId: deviceData.estadoId || "",
          sistemaOperativoId: deviceData.sistemaOperativoId || "",
          comentarios: deviceData.comentarios || "",
          isWarrantyApplied: hasWarrantyData
        });

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
  }, [id, reset]); // reset es dependencia

  const onSubmit = async (data) => {
    setError("");
    setMessage("");

    const payload = { ...data };
    
    // Limpieza de campos que no van al backend
    const fieldsToRemove = [
        'id', 'created_at', 'updated_at', 'usuario', 'tipo', 'estado', 
        'sistema_operativo', 'area', 'maintenances', 'departamentoId', 'departamento', 'isWarrantyApplied'
    ];
    fieldsToRemove.forEach(field => delete payload[field]);

    const foreignKeys = ['areaId', 'usuarioId', 'tipoId', 'estadoId', 'sistemaOperativoId'];
    foreignKeys.forEach(key => { payload[key] = payload[key] ? Number(payload[key]) : null; });

    if (Array.isArray(payload.perfiles_usuario)) {
        payload.perfiles_usuario = payload.perfiles_usuario.length > 0 ? payload.perfiles_usuario.join(", ") : null;
    }

    if (!data.isWarrantyApplied) {
        payload.garantia_numero_reporte = null;
        payload.garantia_notes = null;
    }

    // Convertir fechas a ISO para Prisma
    const toISO = (d) => d ? new Date(d).toISOString() : null;
    payload.garantia_inicio = toISO(payload.garantia_inicio);
    payload.garantia_fin = toISO(payload.garantia_fin);
    payload.fecha_proxima_revision = toISO(payload.fecha_proxima_revision);

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

  // Helpers visuales
  const getStatusName = () => {
      const status = deviceStatuses.find(s => s.id === watchEstadoId);
      return status ? status.nombre : "N/A";
  }
  const selectedArea = areas.find(a => a.id === watchAreaId);
  const departmentName = selectedArea?.departamento?.nombre || 'N/A';
  const assignedUser = users.find(u => u.id === watchUsuarioId);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <PageHeader 
        title={watch("nombre_equipo")}
        subtitle={`${watch("marca")} ${watch("modelo")} • SN: ${watch("numero_serie")}`}
        status={<StatusBadge status={getStatusName()} />}
        onBack={() => navigate(-1)}
        actions={
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />} 
            onClick={handleSubmit(onSubmit)} // 👈 React Hook Form Submit
          >
            Guardar
          </Button>
        }
      />

      <Box sx={{ px: 3, mb: 2 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {isPermanentlyBaja && (
            <Alert severity="warning" icon={<DeleteForeverIcon />} sx={{ mb: 2 }}>
                Este equipo está dado de baja. La edición está restringida.
            </Alert>
        )}
      </Box>

      <Box component="form" noValidate sx={{ px: 3 }}>
        <Grid container spacing={3}>
          
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              
              <SectionCard title="Identidad del Equipo" icon={<ComputerIcon />}>
                <Stack spacing={3}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Controller name="nombre_equipo" control={control} rules={{ required: "Requerido" }}
                                render={({ field }) => <TextField {...field} label="Nombre del Equipo" fullWidth required error={!!errors.nombre_equipo} helperText={errors.nombre_equipo?.message} />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="etiqueta" control={control} render={({ field }) => <TextField {...field} label="Etiqueta" fullWidth />} />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Controller name="marca" control={control} rules={{ required: "Requerido" }}
                                render={({ field }) => <TextField {...field} label="Marca" fullWidth required error={!!errors.marca} />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Controller name="modelo" control={control} rules={{ required: "Requerido" }}
                                render={({ field }) => <TextField {...field} label="Modelo" fullWidth required error={!!errors.modelo} />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth error={!!errors.tipoId}>
                                <InputLabel>Tipo *</InputLabel>
                                <Controller
                                    name="tipoId" control={control} rules={{ required: "Requerido" }}
                                    render={({ field }) => (
                                        <Select {...field} label="Tipo *">
                                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                                            {deviceTypes.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Controller name="numero_serie" control={control} rules={{ required: "Requerido" }}
                                render={({ field }) => <TextField {...field} label="Número de Serie" fullWidth required error={!!errors.numero_serie} />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                             <Controller name="descripcion" control={control} render={({ field }) => <TextField {...field} label="Descripción" fullWidth />} />
                        </Grid>
                    </Grid>
                    
                    <Controller name="comentarios" control={control} render={({ field }) => <TextField {...field} label="Comentarios" fullWidth multiline rows={2} />} />
                </Stack>
              </SectionCard>

              <SectionCard title="Red y Software" icon={<WifiIcon />}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller name="ip_equipo" control={control} render={({ field }) => <TextField {...field} label="Dirección IP" fullWidth />} />
                    <FormControl fullWidth>
                        <InputLabel>Sistema Operativo</InputLabel>
                        <Controller
                            name="sistemaOperativoId" control={control}
                            render={({ field }) => (
                                <Select {...field} label="Sistema Operativo">
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {operatingSystems.map((os) => <MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>)}
                                </Select>
                            )}
                        />
                    </FormControl>
                  </Stack>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>Licenciamiento Office</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}><Controller name="office_version" control={control} render={({ field }) => <TextField {...field} label="Versión" size="small" fullWidth />} /></Grid>
                      <Grid item xs={12} sm={4}><Controller name="office_tipo_licencia" control={control} render={({ field }) => <TextField {...field} label="Tipo Licencia" size="small" fullWidth />} /></Grid>
                      <Grid item xs={12} sm={4}><Controller name="office_key" control={control} render={({ field }) => <TextField {...field} label="Serial" size="small" fullWidth />} /></Grid>
                    </Grid>
                  </Box>

                  <Box>
                    <Divider sx={{ mb: 2 }} />
                    <Controller
                        name="es_panda" control={control}
                        render={({ field: { onChange, value } }) => (
                            <FormControlLabel control={<Switch checked={value} onChange={onChange} color="success" />} label="Panda Antivirus Instalado" />
                        )}
                    />
                  </Box>
                </Stack>
              </SectionCard>

              <SectionCard title="Garantía y Ciclo de Vida" icon={<VerifiedUserIcon />} color={isWarrantyApplied ? "primary.main" : "text.disabled"}>
                <Stack spacing={3}>
                   <Controller
                        name="isWarrantyApplied" control={control}
                        render={({ field: { onChange, value } }) => (
                            <FormControlLabel control={<Switch checked={value} onChange={onChange} />} label="Aplicar información de garantía" />
                        )}
                   />
                   
                   <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}><Controller name="garantia_inicio" control={control} render={({ field }) => <TextField {...field} label="Inicio Garantía" type="date" fullWidth InputLabelProps={{ shrink: true }} />} /></Grid>
                      <Grid item xs={12} sm={6}><Controller name="garantia_fin" control={control} render={({ field }) => <TextField {...field} label="Fin Garantía" type="date" fullWidth InputLabelProps={{ shrink: true }} />} /></Grid>
                   </Grid>

                   {isWarrantyApplied && (
                     <Fade in={isWarrantyApplied}>
                         <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2, border: '1px dashed #bdbdbd' }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Detalles del Proveedor</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}><Controller name="garantia_numero_reporte" control={control} render={({ field }) => <TextField {...field} label="N° Reporte Prov." size="small" fullWidth />} /></Grid>
                                <Grid item xs={12} sm={6}><Controller name="garantia_numero_producto" control={control} render={({ field }) => <TextField {...field} label="N° Producto" size="small" fullWidth />} /></Grid>
                                <Grid item xs={12}><Controller name="garantia_notes" control={control} render={({ field }) => <TextField {...field} label="Notas del Servicio" size="small" fullWidth multiline rows={2} />} /></Grid>
                            </Grid>
                         </Box>
                     </Fade>
                   )}
                   
                   <Divider />
                   
                   <Box>
                       <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                           <CalendarMonthIcon fontSize="small"/> Planificación
                       </Typography>
                       <Controller name="fecha_proxima_revision" control={control} render={({ field }) => <TextField {...field} label="Sugerir Próxima Revisión" type="date" fullWidth InputLabelProps={{ shrink: true }} />} />
                   </Box>
                </Stack>
              </SectionCard>

            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={3} sx={{ position: 'sticky', top: 100 }}>
              
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

                    <FormControl fullWidth>
                        <InputLabel>Área</InputLabel>
                        <Controller
                            name="areaId" control={control}
                            render={({ field }) => (
                                <Select {...field} label="Área">
                                    <MenuItem value=""><em>Ninguna</em></MenuItem>
                                    {areas.map(area => <MenuItem key={area.id} value={area.id}>{area.nombre}</MenuItem>)}
                                </Select>
                            )}
                        />
                    </FormControl>
                    
                    <TextField label="Departamento" fullWidth value={departmentName} InputProps={{ readOnly: true }} variant="filled" size="small" />

                    <FormControl fullWidth>
                        <InputLabel>Usuario Asignado</InputLabel>
                        <Controller
                            name="usuarioId" control={control}
                            render={({ field }) => (
                                <Select {...field} label="Usuario Asignado">
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>)}
                                </Select>
                            )}
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="perf-label">Perfiles (Sesiones)</InputLabel>
                        <Controller
                            name="perfiles_usuario" control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    labelId="perf-label"
                                    multiple
                                    renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((value) => <Chip key={value} label={value} size="small" />)}</Box>}
                                    MenuProps={MenuProps}
                                >
                                    {users.map((u) => (
                                        <MenuItem key={u.id} value={u.nombre}>
                                            <Checkbox checked={field.value.indexOf(u.nombre) > -1} />
                                            <ListItemText primary={u.nombre} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                </Stack>
              </SectionCard>

              <SectionCard title="Estado del Equipo" icon={<SettingsIcon />}>
                 <FormControl fullWidth error={!!errors.estadoId}>
                    <InputLabel>Estado Actual *</InputLabel>
                    <Controller
                        name="estadoId" control={control}
                        rules={{ required: "Requerido" }}
                        render={({ field }) => (
                            <Select {...field} label="Estado Actual *" disabled={isPermanentlyBaja}>
                                {deviceStatuses.map((s) => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}
                            </Select>
                        )}
                    />
                 </FormControl>

                 <Fade in={watchEstadoId === bajaStatusId} mountOnEnter unmountOnExit>
                    <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2, border: `1px solid ${theme.palette.warning.main}` }}>
                        <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                            <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }}/> Información de Baja
                        </Typography>
                        <Stack spacing={2}>
                            <Controller name="motivo_baja" control={control} render={({ field }) => <TextField {...field} label="Motivo de Baja" size="small" fullWidth />} />
                            <Controller name="observaciones_baja" control={control} render={({ field }) => <TextField {...field} label="Observaciones Finales" size="small" fullWidth multiline rows={3} />} />
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