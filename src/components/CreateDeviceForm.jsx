// src/components/CreateDeviceForm.jsx
import React, { useEffect, useState, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button, Divider, Stack, ListSubheader, OutlinedInput, Chip, Checkbox, ListItemText,
  FormControlLabel, Switch, Fade, FormHelperText
} from "@mui/material";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext"; // 👈 Importamos Contexto
import { ROLES } from "../config/constants"; // 👈 Importamos Roles
import HotelSelect from "./common/HotelSelect"; // 👈 Importamos Selector

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 250 } },
};

const CreateDeviceForm = ({ onClose, onDeviceCreated, setMessage, setError }) => {
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT; // Verificamos si es ROOT

  const { control, handleSubmit, watch, setError: setFormError, setValue, formState: { errors } } = useForm({
    defaultValues: {
      etiqueta: "", nombre_equipo: "", descripcion: "", comentarios: "", ip_equipo: "",
      usuarioId: "", perfiles_usuario: [], tipoId: "", marca: "", modelo: "", numero_serie: "",
      sistemaOperativoId: "", licencia_so: "", office_version: "", office_tipo_licencia: "",
      office_serial: "", office_key: "", es_panda: false, garantia_numero_producto: "",
      garantia_numero_reporte: "", garantia_notes: "", garantia_inicio: "", garantia_fin: "",
      areaId: "", fecha_proxima_revision: "", isWarrantyApplied: false,
      hotelId: "" // 👈 Campo extra para Root
    }
  });

  const isWarrantyApplied = watch("isWarrantyApplied");
  const selectedHotelId = watch("hotelId"); // Observamos el hotel seleccionado

  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [areas, setAreas] = useState([]); 
  const { refreshAlerts } = useContext(AlertContext);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Root recibe TODAS las áreas y usuarios de TODOS los hoteles
        const [usersRes, deviceTypesRes, operatingSystemsRes, areasRes] = 
          await Promise.all([
            api.get("/users/get/all"),
            api.get("/device-types/get?limit=0"),
            api.get("/operating-systems/get?limit=0"),
            api.get("/areas/get?limit=0"), 
          ]);
        
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

  // Efecto: Si cambia el hotel (Root), limpiamos área y usuario seleccionados para evitar inconsistencias
  useEffect(() => {
      if (isRoot) {
          setValue("areaId", "");
          setValue("usuarioId", "");
      }
  }, [selectedHotelId, isRoot, setValue]);

  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;
    
    // 🛡️ FILTRADO DINÁMICO DE ÁREAS
    // Si es Root y seleccionó un hotel, filtramos las áreas. Si no es Root, ve todas (ya vienen filtradas del backend)
    let filteredAreas = areas;
    if (isRoot && selectedHotelId) {
        filteredAreas = areas.filter(a => a.hotelId === Number(selectedHotelId));
    } else if (isRoot && !selectedHotelId) {
        filteredAreas = []; // Si no selecciona hotel, no mostramos áreas
    }

    const sortedAreas = [...filteredAreas].sort((a, b) => (a.departamento?.nombre || "").localeCompare(b.departamento?.nombre || ""));

    sortedAreas.forEach(area => {
      if (area.departamento?.nombre && area.departamento.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.departamentoId}`}>{area.departamento.nombre}</ListSubheader>);
        lastDept = area.departamento.nombre;
      }
      options.push(<MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>{area.nombre}</MenuItem>);
    });
    
    if (isRoot && !selectedHotelId) {
        options.push(<MenuItem key="no-hotel" disabled>Primero selecciona un Hotel</MenuItem>);
    }
    
    return options;
  };

  const onSubmit = async (data) => {
    if (setError) setError("");
    if (setMessage) setMessage("");

    const payload = { ...data };
    
    if (payload.areaId) payload.areaId = Number(payload.areaId); else payload.areaId = null;
    if (payload.usuarioId) payload.usuarioId = Number(payload.usuarioId); else payload.usuarioId = null;
    if (payload.tipoId) payload.tipoId = Number(payload.tipoId);
    if (payload.sistemaOperativoId) payload.sistemaOperativoId = Number(payload.sistemaOperativoId); else payload.sistemaOperativoId = null;
    
    // 🛡️ Validación para ROOT
    if (isRoot) {
        if (!payload.hotelId) {
            if (setError) setError("Como usuario ROOT, es obligatorio seleccionar un Hotel.");
            return;
        }
        payload.hotelId = Number(payload.hotelId);
    } else {
        delete payload.hotelId; // Admin local no envía esto, el backend lo inyecta
    }

    if (Array.isArray(payload.perfiles_usuario)) {
        payload.perfiles_usuario = payload.perfiles_usuario.length > 0 ? payload.perfiles_usuario.join(", ") : null;
    }

    if (!payload.isWarrantyApplied) {
        payload.garantia_numero_reporte = null;
        payload.garantia_notes = null;
    }
    
    delete payload.isWarrantyApplied; 

    ['garantia_inicio', 'garantia_fin', 'fecha_proxima_revision'].forEach(key => {
        if (!payload[key]) payload[key] = null;
        else payload[key] = new Date(payload[key]).toISOString();
    });

    try {
      await api.post("/devices/post", payload);
      if (setMessage) setMessage("Equipo creado exitosamente.");
      refreshAlerts();
      if (onDeviceCreated) onDeviceCreated();
      onClose();
    } catch (err) {
      const serverData = err.response?.data;
      if (serverData?.details && Array.isArray(serverData.details)) {
          const errorList = serverData.details.map(d => `• ${d.message}`).join("\n");
          if (setError) setError(`Corrige los siguientes errores:\n${errorList}`);
          serverData.details.forEach(({ field, message }) => {
              setFormError(field, { type: 'server', message });
          });
      } else {
          if (setError) setError(serverData?.error || "Error al crear el equipo.");
      }
    }
  };

  return (
    <Box sx={{ maxHeight: "85vh", overflowY: "auto", p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }} color="text.primary">Crear nuevo equipo</Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        
        {/* 👇 SELECCIÓN DE HOTEL (SOLO VISIBLE PARA ROOT) */}
        {isRoot && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px dashed', borderColor: 'primary.main' }}>
                <Typography variant="subtitle2" color="primary.main" fontWeight="bold" mb={1}>
                    Ubicación del Activo (Modo Root)
                </Typography>
                <Controller
                    name="hotelId"
                    control={control}
                    render={({ field }) => (
                        <HotelSelect 
                            value={field.value} 
                            onChange={field.onChange} 
                            error={!!errors.hotelId}
                            helperText={errors.hotelId?.message}
                        />
                    )}
                />
            </Box>
        )}
        
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }} color="text.secondary" fontWeight="bold">Información General</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                    name="etiqueta" control={control}
                    render={({ field }) => <TextField {...field} label="Etiqueta" fullWidth error={!!errors.etiqueta} helperText={errors.etiqueta?.message} />}
                />
                <Controller
                    name="numero_serie" control={control}
                    rules={{ required: "El número de serie es obligatorio" }}
                    render={({ field }) => <TextField {...field} label="Número de Serie" fullWidth required error={!!errors.numero_serie} helperText={errors.numero_serie?.message} />}
                />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                    name="nombre_equipo" control={control}
                    rules={{ required: "El nombre es obligatorio" }}
                    render={({ field }) => <TextField {...field} label="Nombre del equipo" fullWidth required error={!!errors.nombre_equipo} helperText={errors.nombre_equipo?.message} />}
                />
                <Controller
                    name="descripcion" control={control}
                    render={({ field }) => <TextField {...field} label="Descripción" fullWidth error={!!errors.descripcion} helperText={errors.descripcion?.message} />}
                />
            </Stack>
            <Controller
                name="comentarios" control={control}
                render={({ field }) => <TextField {...field} label="Comentarios" fullWidth multiline rows={2} error={!!errors.comentarios} helperText={errors.comentarios?.message} />}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                    name="ip_equipo" control={control}
                    render={({ field }) => <TextField {...field} label="Dirección IP" fullWidth error={!!errors.ip_equipo} helperText={errors.ip_equipo?.message || 'Ej: 10.20.80.2 o "DHCP"'} />}
                />
                <Controller
                    name="marca" control={control}
                    rules={{ required: "La marca es obligatoria" }}
                    render={({ field }) => <TextField {...field} label="Marca" fullWidth required error={!!errors.marca} helperText={errors.marca?.message} />}
                />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                 <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <Controller
                        name="modelo" control={control}
                        rules={{ required: "El modelo es obligatorio" }}
                        render={({ field }) => <TextField {...field} label="Modelo" fullWidth required error={!!errors.modelo} helperText={errors.modelo?.message} />}
                    />
                 </Box>
            </Stack>
        </Stack>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} color="text.secondary" fontWeight="bold">Asignación y Ubicación</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth error={!!errors.areaId}>
                        <InputLabel>Área</InputLabel>
                        <Controller
                            name="areaId" control={control}
                            render={({ field }) => (
                                <Select {...field} label="Área">
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {renderAreaOptions()}
                                </Select>
                            )}
                        />
                        {errors.areaId && <FormHelperText>{errors.areaId.message}</FormHelperText>}
                    </FormControl>
                </Box>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth error={!!errors.usuarioId}>
                        <InputLabel>Responsable</InputLabel>
                        <Controller
                            name="usuarioId" control={control}
                            render={({ field }) => (
                                <Select {...field} label="Responsable">
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {/* Filtro de usuarios si es root: Solo mostrar los del hotel seleccionado */}
                                    {users
                                      .filter(u => !isRoot || (isRoot && u.hotelId === Number(selectedHotelId)))
                                      .map((user) => (<MenuItem key={user.id} value={user.id}>{user.nombre}</MenuItem>))
                                    }
                                </Select>
                            )}
                        />
                        {errors.usuarioId && <FormHelperText>{errors.usuarioId.message}</FormHelperText>}
                    </FormControl>
                </Box>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: '100%' }}>
                     <FormControl fullWidth>
                        <InputLabel id="perfiles-label">Perfiles de Usuarios</InputLabel>
                        <Controller
                            name="perfiles_usuario" control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    labelId="perfiles-label"
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
                                        .filter(u => !isRoot || (isRoot && u.hotelId === Number(selectedHotelId)))
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
                </Box>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth error={!!errors.tipoId}>
                        <InputLabel>Tipo *</InputLabel>
                        <Controller
                            name="tipoId" control={control}
                            rules={{ required: "El tipo es obligatorio" }}
                            render={({ field }) => (
                                <Select {...field} label="Tipo *">
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {deviceTypes.map((type) => (<MenuItem key={type.id} value={type.id}>{type.nombre}</MenuItem>))}
                                </Select>
                            )}
                        />
                        <FormHelperText>{errors.tipoId?.message}</FormHelperText>
                    </FormControl>
                </Box>
            </Stack>
        </Stack>
        
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} color="text.secondary" fontWeight="bold">Software y Licencias</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth error={!!errors.sistemaOperativoId}>
                        <InputLabel>Sistema Operativo</InputLabel>
                        <Controller
                            name="sistemaOperativoId" control={control}
                            render={({ field }) => (
                                <Select {...field} label="Sistema Operativo">
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {operatingSystems.map((os) => (<MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>))}
                                </Select>
                            )}
                        />
                        {errors.sistemaOperativoId && <FormHelperText>{errors.sistemaOperativoId.message}</FormHelperText>}
                    </FormControl>
                </Box>
                <Controller name="licencia_so" control={control} render={({ field }) => <TextField {...field} label="Licencia de SO" fullWidth />} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller name="office_version" control={control} render={({ field }) => <TextField {...field} label="Versión de Office" fullWidth />} />
                <Controller name="office_tipo_licencia" control={control} render={({ field }) => <TextField {...field} label="Tipo de Licencia de Office" fullWidth />} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller name="office_serial" control={control} render={({ field }) => <TextField {...field} label="Serial de Office" fullWidth />} />
                <Controller name="office_key" control={control} render={({ field }) => <TextField {...field} label="Clave de Office" fullWidth />} />
            </Stack>
            <Controller
                name="es_panda" control={control}
                render={({ field: { onChange, value } }) => (
                    <FormControlLabel
                        control={<Switch checked={value} onChange={onChange} color="success" />}
                        label="¿Tiene Panda instalado?"
                        labelPlacement="start"
                        sx={{ justifyContent: 'space-between', width: '100%', m: 0 }}
                    />
                )}
            />
        </Stack>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} color="text.secondary" fontWeight="bold">Garantía</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
             <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller name="garantia_numero_producto" control={control} render={({ field }) => <TextField {...field} label="Número de producto" fullWidth />} />
                <Controller name="garantia_inicio" control={control} render={({ field }) => <TextField {...field} label="Inicio de Garantía" type="date" fullWidth InputLabelProps={{ shrink: true }} />} />
                <Controller name="garantia_fin" control={control} render={({ field }) => <TextField {...field} label="Fin de Garantía" type="date" fullWidth InputLabelProps={{ shrink: true }} />} />
            </Stack>
            
            <Controller
                name="isWarrantyApplied" control={control}
                render={({ field: { onChange, value } }) => (
                    <FormControlLabel
                        control={<Switch checked={value} onChange={onChange} />}
                        label="¿Se aplicó garantía?"
                        labelPlacement="start"
                        sx={{ justifyContent: 'space-between', width: '100%', m: 0 }}
                    />
                )}
            />
             <Fade in={isWarrantyApplied} mountOnEnter unmountOnExit>
                 <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 1 }}>
                    <Controller name="garantia_numero_reporte" control={control} render={({ field }) => <TextField {...field} label="N° Reporte" fullWidth />} />
                    <Controller name="garantia_notes" control={control} render={({ field }) => <TextField {...field} label="Notas" fullWidth multiline rows={2} />} />
                 </Stack>
             </Fade>
             <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                <Controller name="fecha_proxima_revision" control={control} render={({ field }) => <TextField {...field} label="Próxima Revisión Sugerida" type="date" fullWidth InputLabelProps={{ shrink: true }} />} />
             </Box>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button type="submit" variant="contained" color="primary">Crear Equipo</Button>
        </Stack>
      </form>
    </Box>
  );
};

export default CreateDeviceForm;