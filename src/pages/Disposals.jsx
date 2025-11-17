// src/pages/Disposals.jsx
import React, { useEffect, useState, useContext } from "react";
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
  IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Disposals = () => {
  const [disposals, setDisposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDisposals();
  }, []);

  const fetchDisposals = async () => {
    try {
      setLoading(true);
      // Esta ruta obtiene los 'Devices' con estado "Baja"
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
    // Navega al 'EditDevice' para añadir/editar la nota
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
              <TableCell>Motivo</TableCell> {/* 👈 CORRECCIÓN */}
              <TableCell>Observaciones</TableCell> {/* 👈 CORRECCIÓN */}
              <TableCell>Fecha de Baja</TableCell>
              {(user?.rol === "ADMIN" || user?.rol === "EDITOR") && <TableCell>Acciones</TableCell>}
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
                  {/* 👈 CORRECCIÓN: Lee los nuevos campos de la BD */}
                  <TableCell>{disposal.motivo_baja || 'N/A'}</TableCell>
                  <TableCell>{disposal.observaciones_baja || 'N/A'}</TableCell>
                  <TableCell>
                    {disposal.fecha_baja ? new Date(disposal.fecha_baja).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  {(user?.rol === "ADMIN" || user?.rol === "EDITOR") && (
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
                <TableCell colSpan={8} align="center"> {/* 👈 ColSpan actualizado a 8 */}
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