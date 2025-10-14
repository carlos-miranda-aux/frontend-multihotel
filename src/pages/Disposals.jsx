// src/pages/Disposals.jsx
import React, { useEffect, useState, useContext } from "react"; // 👈 Agrega useContext
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton // 👈 Agrega IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // 👈 Agrega EditIcon
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext"; // 👈 Agrega AuthContext
import { useNavigate } from "react-router-dom"; // 👈 Agrega useNavigate

const Disposals = () => {
  const [disposals, setDisposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext); // 👈 Obtener información del usuario
  const navigate = useNavigate();

  useEffect(() => {
    fetchDisposals();
  }, []);

  const fetchDisposals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/disposals/get");
      setDisposals(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching disposals:", err);
      setError("Error al cargar la lista de bajas.");
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/inventory/edit/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Equipos dados de Baja
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Etiqueta</TableCell>
              <TableCell>N° Serie</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Fecha de Baja</TableCell>
              {/* 📌 Muestra la columna de acciones solo si el usuario tiene permisos */}
              {(user?.role === "ADMIN" || user?.role === "EDITOR") && <TableCell>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {disposals.length > 0 ? (
              disposals.map((disposal) => (
                <TableRow key={disposal.id}>
                  <TableCell>{disposal.etiqueta || 'N/A'}</TableCell>
                  <TableCell>{disposal.numero_serie || 'N/A'}</TableCell>
                  <TableCell>{disposal.tipo?.nombre || 'N/A'}</TableCell>
                  <TableCell>{disposal.estado?.nombre || 'N/A'}</TableCell>
                  <TableCell>{disposal.motivo || 'N/A'}</TableCell>
                  <TableCell>{disposal.observaciones || 'N/A'}</TableCell>
                  {/* 📌 Muestra la fecha de baja si existe */}
                  <TableCell>
                    {disposal.fecha_baja ? new Date(disposal.fecha_baja).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  {/* 📌 Muestra el botón de editar solo si el usuario tiene permisos */}
                  {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(disposal.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay equipos dados de baja.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Disposals;