import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error crítico capturado:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default', p: 3 }}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center', borderRadius: 3 }}>
            <Box sx={{ color: 'error.main', mb: 2 }}>
                <BugReportIcon sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              ¡Ups! Algo salió mal.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Ha ocurrido un error inesperado en la aplicación. No te preocupes, ya hemos sido notificados.
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 3, bgcolor: 'grey.100', p: 1, borderRadius: 1, fontFamily: 'monospace' }}>
                {this.state.error?.toString()}
            </Typography>
            <Button variant="contained" color="primary" onClick={this.handleReload}>
              Recargar Página
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;