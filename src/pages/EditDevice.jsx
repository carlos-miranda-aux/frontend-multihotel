// src/pages/EditDevice.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Divider,
  Stack,
  Fade,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";

// Función para parsear la fecha como LOCAL
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

const EditDevice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);

  const [formData, setFormData] = useState({
    nombre_equipo: "",
    modelo: "",
    numero_serie: "",
    ip_equipo: "",
    etiqueta: "",
    descripcion: "",
    usuarioId: "",
    tipoId: "",
    estadoId: "",
    sistemaOperativoId: "",
    marca: "",
    licencia_so: "",
    office_version: "",
    office_tipo_licencia: "",
    office_serial: "",
    office_key: "",
    garantia_numero_producto: "",
    garantia_inicio: "",
    garantia_fin: "",
    departamentoId: "",
    fecha_proxima_revision: "",
    motivo_baja: "",
    observaciones_baja: "",
  });

  // 1. Nuevo estado de errores para la validación
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceStatuses, setDeviceStatuses] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bajaStatusId, setBajaStatusId] = useState(null);
  const [isPermanentlyBaja, setIsPermanentlyBaja] = useState(false);

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);
        const [
          deviceResponse,
          usersRes,
          deviceTypesRes,
          deviceStatusesRes,
          operatingSystemsRes,
          departmentsRes,
        ] = await Promise.all([
          api.get(`/devices/get/${id}`),
          api.get("/users/get/all"), // Ruta correcta (no paginada)
          api.get("/device-types/get"),
          api.get("/device-status/get"),
          api.get("/operating-systems/get"),
          api.get("/departments/get"),
        ]);

        const deviceData = deviceResponse.data;
        
        const formatDateForInput = (dateString) => {
            if (!dateString) return "";
            try {
                return new Date(dateString).toISOString().substring(0, 10);
            } catch (e) {
                return "";
            }
        };
        
        const bajaStatus = deviceStatusesRes.data.find(s => s.nombre.toLowerCase() === 'baja');
        if (bajaStatus) {
          setBajaStatusId(bajaStatus.id);
        }

        if (bajaStatus && deviceData.estadoId === bajaStatus.id) {
          setIsPermanentlyBaja(true);
        }

        setFormData({
          nombre_equipo: deviceData.nombre_equipo || "",
          modelo: deviceData.modelo || "",
          numero_serie: deviceData.numero_serie || "",
          ip_equipo: deviceData.ip_equipo || "",
          etiqueta: deviceData.etiqueta || "",
          descripcion: deviceData.descripcion || "",
          usuarioId: deviceData.usuarioId || "",
          tipoId: deviceData.tipoId || "",
          estadoId: deviceData.estadoId || "",
          sistemaOperativoId: deviceData.sistemaOperativoId || "",
          marca: deviceData.marca || "",
          licencia_so: deviceData.licencia_so || "",
          office_version: deviceData.office_version || "",
          office_tipo_licencia: deviceData.office_tipo_licencia || "",
          office_serial: deviceData.office_serial || "",
          office_key: deviceData.office_key || "",
          garantia_numero_producto: deviceData.garantia_numero_producto || "",
          garantia_inicio: formatDateForInput(deviceData.garantia_inicio),
          garantia_fin: formatDateForInput(deviceData.garantia_fin),
          departamentoId: deviceData.departamentoId || "",
          fecha_proxima_revision: formatDateForInput(deviceData.fecha_proxima_revision),
          motivo_baja: deviceData.motivo_baja || "",
          observaciones_baja: deviceData.observaciones_baja || "",
        }); 
        
        setUsers(usersRes.data);
        setDeviceTypes(deviceTypesRes.data);
        setDeviceStatuses(deviceStatusesRes.data);
        setOperatingSystems(operatingSystemsRes.data);
        setDepartments(departmentsRes.data);
      } catch (err) {
        console.error("Error al cargar el dispositivo:", err);
        setError("Error al cargar el dispositivo");
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar el error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // 2. Función de Validación (Igual que en CreateDeviceForm)
  const validate = () => {
    let tempErrors = {};
    
    if (!formData.nombre_equipo.trim()) tempErrors.nombre_equipo = "El nombre es obligatorio.";
    if (!formData.numero_serie.trim()) tempErrors.numero_serie = "El número de serie es obligatorio.";
    if (!formData.marca.trim()) tempErrors.marca = "La marca es obligatoria.";
    if (!formData.modelo.trim()) tempErrors.modelo = "El modelo es obligatorio.";
    
    // Validar selects (que no estén vacíos o en string vacío)
    if (!formData.tipoId) tempErrors.tipoId = "El tipo es obligatorio.";
    if (!formData.estadoId) tempErrors.estadoId = "El estado es obligatorio.";

    // Etiqueta es opcional -> No validamos

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // 3. Ejecutar validación antes de enviar
    if (!validate()) {
      setError("Por favor corrige los errores antes de guardar.");
      return;
    }

    const payload = { ...formData };
    
    const localGarantiainicio = parseLocalDate(payload.garantia_inicio);
    const localGarantiaFin = parseLocalDate(payload.garantia_fin);
    const localProximaRevision = parseLocalDate(payload.fecha_proxima_revision);

    payload.garantia_inicio = localGarantiainicio ? localGarantiainicio.toISOString() : null;
    payload.garantia_fin = localGarantiaFin ? localGarantiaFin.toISOString() : null;
    payload.fecha_proxima_revision = localProximaRevision ? localProximaRevision.toISOString() : null;

    if (payload.estadoId !== bajaStatusId) {
      payload.motivo_baja = null;
      payload.observaciones_baja = null;
    }

    try {
      await api.put(`/devices/put/${id}`, payload);
      refreshAlerts();
      setMessage("Equipo actualizado correctamente.");
      if (isPermanentlyBaja || payload.estadoId === bajaStatusId) {
        setTimeout(() => navigate("/disposals"), 1200);
      } else {
        setTimeout(() => navigate("/inventory"), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el equipo.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, width: "100%", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Editar equipo
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, width: "100%" }}>
        <form onSubmit={handleUpdate} noValidate>
          {/* DATOS GENERALES */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Datos generales
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Etiqueta (Opcional)"
                name="etiqueta"
                fullWidth
                value={formData.etiqueta}
                onChange={handleChange}
                // Ya no es required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre del equipo"
                name="nombre_equipo"
                fullWidth
                value={formData.nombre_equipo}
                onChange={handleChange}
                required
                error={!!errors.nombre_equipo}
                helperText={errors.nombre_equipo}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Número de serie"
                name="numero_serie"
                fullWidth
                value={formData.numero_serie}
                onChange={handleChange}
                required
                error={!!errors.numero_serie}
                helperText={errors.numero_serie}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="IP del equipo" name="ip_equipo" fullWidth value={formData.ip_equipo} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Marca"
                name="marca"
                fullWidth
                value={formData.marca}
                onChange={handleChange}
                required
                error={!!errors.marca}
                helperText={errors.marca}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Modelo"
                name="modelo"
                fullWidth
                value={formData.modelo}
                onChange={handleChange}
                required
                error={!!errors.modelo}
                helperText={errors.modelo}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="descripcion"
                fullWidth
                multiline
                minRows={2}
                value={formData.descripcion}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* SOFTWARE */}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Software y licencias
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sistema Operativo</InputLabel>
                <Select
                  name="sistemaOperativoId"
                  value={formData.sistemaOperativoId || ''}
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
            <Grid item xs={12} sm={6}>
              <TextField label="Licencia SO" name="licencia_so" fullWidth value={formData.licencia_so} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Versión Office" name="office_version" fullWidth value={formData.office_version} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Tipo de licencia Office" name="office_tipo_licencia" fullWidth value={formData.office_tipo_licencia} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Serial de Office" name="office_serial" fullWidth value={formData.office_serial} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Clave de Office" name="office_key" fullWidth value={formData.office_key} onChange={handleChange} />
            </Grid>
          </Grid>

          {/* GARANTÍA */}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Garantía
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Número de producto" name="garantia_numero_producto" fullWidth value={formData.garantia_numero_producto} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Inicio de garantía"
                type="date"
                name="garantia_inicio"
                fullWidth
                value={formData.garantia_inicio}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fin de garantía"
                type="date"
                name="garantia_fin"
                fullWidth
                value={formData.garantia_fin}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Próxima Revisión Sugerida"
                name="fecha_proxima_revision"
                type="date"
                value={formData.fecha_proxima_revision}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* ASIGNACIÓN */}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Asignación
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
             <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Usuario asignado</InputLabel>
                <Select
                  name="usuarioId"
                  value={formData.usuarioId || ''}
                  onChange={handleChange}
                  label="Usuario asignado"
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Departamento</InputLabel>
                <Select
                  name="departamentoId"
                  value={formData.departamentoId || ''}
                  onChange={handleChange}
                  label="Departamento"
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* ESTADO */}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Estado
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={isPermanentlyBaja} error={!!errors.estadoId}>
                <InputLabel>Estado del equipo *</InputLabel>
                <Select
                  name="estadoId"
                  value={formData.estadoId || ''}
                  onChange={handleChange}
                  label="Estado del equipo *"
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {deviceStatuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {errors.estadoId && <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>{errors.estadoId}</Typography>}
              </FormControl>
            </Grid>
            
            {/* Campos condicionales para BAJA */}
            <Fade in={formData.estadoId === bajaStatusId} mountOnEnter unmountOnExit>
              <Grid item container xs={12} spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                    <TextField
                      label="Motivo de la Baja"
                      name="motivo_baja"
                      fullWidth
                      value={formData.motivo_baja}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Observaciones de la Baja"
                      name="observaciones_baja"
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.observaciones_baja}
                      onChange={handleChange}
                    />
                  </Grid>
              </Grid>
            </Fade>
          </Grid>

          {/* ACCIONES */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button type="submit" variant="contained">
              Guardar cambios
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default EditDevice;