import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, Box, CircularProgress
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const ConfirmDialog = ({ open, onClose, onConfirm, title, content, type = "delete", isLoading = false }) => {
  const isDelete = type === "delete";

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}
      PaperProps={{ sx: { borderRadius: 3, padding: 1, maxWidth: 450 } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
        {isDelete && (
          <Box sx={{ bgcolor: 'error.50', p: 2, borderRadius: '50%', mb: 1, color: 'error.main' }}>
            <WarningAmberRoundedIcon fontSize="large" />
          </Box>
        )}
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pt: 1 }}>{title}</DialogTitle>
      </Box>

      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center', color: 'text.secondary' }}>{content}</DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
        <Button 
            onClick={onClose} 
            variant="outlined" 
            color="inherit" 
            disabled={isLoading}
            sx={{ borderRadius: 2, px: 3 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isDelete ? "error" : "primary"}
          disableElevation
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {isLoading ? "Procesando..." : (isDelete ? "Sí, Eliminar" : "Confirmar")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;