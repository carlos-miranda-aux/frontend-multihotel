import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A6274', // Nuevo color corporativo (Slate Blue)
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#34495e', // Tono oscuro complementario
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
    background: {
      default: '#f4f6f8', // Fondo general gris muy suave
      paper: '#ffffff',   // Fondo de tarjetas blanco
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    }
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    // Sobrescribir estilos globales de componentes
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        // Eliminamos el 'hover' hardcoded anterior para que MUI use el nuevo primary automáticamente
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#222222',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    }
  },
});

export default theme;