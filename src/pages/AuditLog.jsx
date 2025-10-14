// src/pages/AuditLog.jsx
import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import api from "../api/axios";

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await api.get("/audit/");
        setLogs(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError("Error al cargar la bitácora de cambios.");
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, []);

  const formatData = (data) => {
    if (!data) return "N/A";
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Bitácora de Cambios
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Recurso</TableCell>
              <TableCell>ID Recurso</TableCell>
              <TableCell>Datos Anteriores</TableCell>
              <TableCell>Datos Nuevos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{log.user?.username || 'N/A'}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell>{log.resourceId}</TableCell>
                  <TableCell>
                    <pre>{formatData(log.oldData)}</pre>
                  </TableCell>
                  <TableCell>
                    <pre>{formatData(log.newData)}</pre>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay registros de auditoría.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditLog;