import React, { useRef, useState } from "react";
import { Button, CircularProgress, Alert, Snackbar } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import api from "../api/axios";

const ImportButton = ({ endpoint, onSuccess, label = "Importar Excel" }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const { message, errors } = res.data;
      
      if (errors && errors.length > 0) {
          console.warn("Errores de importación:", errors);
          setToast({ open: true, msg: `${message}. Revisa la consola para detalles.`, severity: "warning" });
      } else {
          setToast({ open: true, msg: message, severity: "success" });
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setToast({ open: true, msg: "Error al importar el archivo.", severity: "error" });
    } finally {
      setLoading(false);
      // Limpiar input para permitir subir el mismo archivo de nuevo si falló
      e.target.value = null; 
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx, .xls" // Forzamos Excel
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        startIcon={loading ? <CircularProgress size={20} /> : <UploadFileIcon />}
        onClick={() => fileInputRef.current.click()}
        disabled={loading}
        sx={{ ml: 2 }}
      >
        {label}
      </Button>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
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