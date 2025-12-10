import React, { useRef, useState } from "react";
import { Button, CircularProgress, Alert, Snackbar } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import api from "../api/axios";

const ImportButton = ({ endpoint, onSuccess, label = "Importar Excel", extraData = {} }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    Object.keys(extraData).forEach(key => {
        if (extraData[key]) {
            formData.append(key, extraData[key]);
        }
    });

    setLoading(true);
    try {
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Extraemos también 'warnings' y 'successCount' de la respuesta del Backend
      const { message, errors, warnings, successCount } = res.data;
      
      // Construimos el mensaje base si no viene uno explícito
      let finalMessage = message || `Proceso finalizado. Registros importados: ${successCount || 0}.`;
      let finalSeverity = "success";

      if (errors && errors.length > 0) {
          console.warn("Errores de importación:", errors);
          finalMessage = `${message || 'Error'}. Hubo fallos críticos. Revisa la consola.`;
          finalSeverity = "error";
      } else if (warnings && warnings.length > 0) {
          // --- LÓGICA DE ALERTA SOLICITADA ---
          // Si hay advertencias (ej: usuarios no encontrados), mostramos alerta naranja
          console.warn("Advertencias de importación (Usuarios no encontrados):", warnings);
          finalMessage = `Importación exitosa (${successCount}), pero con ALERTAS: ${warnings.length} equipos tienen usuarios no encontrados en el sistema (Ver consola F12).`;
          finalSeverity = "warning";
      } else {
          // Éxito total sin advertencias
          finalSeverity = "success";
      }

      setToast({ open: true, msg: finalMessage, severity: finalSeverity });
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Error al importar el archivo.";
      setToast({ open: true, msg: errMsg, severity: "error" });
    } finally {
      setLoading(false);
      e.target.value = null; 
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx, .xls"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
        onClick={() => fileInputRef.current.click()}
        disabled={loading}
        sx={{ ml: 2 }}
      >
        {label}
      </Button>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={8000} // Aumenté un poco el tiempo para leer las advertencias
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ImportButton;