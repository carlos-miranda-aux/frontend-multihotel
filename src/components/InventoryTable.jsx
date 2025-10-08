// src/components/InventoryTable.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import axios from "../api/axios"; // tu instancia de axios
import { useNavigate } from "react-router-dom";

const InventoryTable = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterDepto, setFilterDepto] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await axios.get("/devices/get");
      setDevices(res.data);
      setFilteredDevices(res.data);
    } catch (err) {
      console.error("Error al obtener dispositivos:", err);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    filterData(e.target.value, filterType, filterEstado, filterDepto);
  };

  const handleFilter = (type, estado, depto) => {
    setFilterType(type);
    setFilterEstado(estado);
    setFilterDepto(depto);
    filterData(search, type, estado, depto);
  };

  const filterData = (searchValue, type, estado, depto) => {
    let temp = [...devices];

    if (searchValue) {
      temp = temp.filter(
        (d) =>
          d.etiqueta?.toLowerCase().includes(searchValue.toLowerCase()) ||
          d.numero_serie?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    if (type) temp = temp.filter((d) => d.tipo?.nombre === type);
    if (estado) temp = temp.filter((d) => d.estado?.nombre === estado);
    if (depto) temp = temp.filter((d) => d.departamento?.nombre === depto);

    setFilteredDevices(temp);
  };

  const handleEdit = (id) => {
    navigate(`/devices/${id}`);
  };

  const handleExport = () => {
    window.open("/api/devices/export/inactivos", "_blank");
  };

  // Extraer listas únicas para filtros
  const tipos = [...new Set(devices.map((d) => d.tipo?.nombre).filter(Boolean))];
  const estados = [...new Set(devices.map((d) => d.estado?.nombre).filter(Boolean))];
  const departamentos = [...new Set(devices.map((d) => d.departamento?.nombre).filter(Boolean))];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Inventario de Equipos</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Buscar por etiqueta o N° serie"
          value={search}
          onChange={handleSearch}
          size="small"
        />
        <FormControl size="small">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => handleFilter(e.target.value, filterEstado, filterDepto)}
            label="Tipo"
          >
            <MenuItem value="">Todos</MenuItem>
            {tipos.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Estado</InputLabel>
          <Select
            value={filterEstado}
            onChange={(e) => handleFilter(filterType, e.target.value, filterDepto)}
            label="Estado"
          >
            <MenuItem value="">Todos</MenuItem>
            {estados.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Departamento</InputLabel>
          <Select
            value={filterDepto}
            onChange={(e) => handleFilter(filterType, filterEstado, e.target.value)}
            label="Departamento"
          >
            <MenuItem value="">Todos</MenuItem>
            {departamentos.map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="secondary" onClick={handleExport}>
          Exportar inactivos
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Etiqueta</TableCell>
              <TableCell>N° Serie</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Sistema Operativo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDevices.map((device, index) => (
              <TableRow key={device.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{device.etiqueta}</TableCell>
                <TableCell>{device.numero_serie}</TableCell>
                <TableCell>{device.tipo?.nombre}</TableCell>
                <TableCell>{device.marca}</TableCell>
                <TableCell>{device.modelo}</TableCell>
                <TableCell>{device.estado?.nombre}</TableCell>
                <TableCell>{device.usuario?.nombre}</TableCell>
                <TableCell>{device.departamento?.nombre}</TableCell>
                <TableCell>{device.sistema_operativo?.nombre}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(device.id)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredDevices.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No hay dispositivos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryTable;
