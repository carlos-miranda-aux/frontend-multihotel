import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 1. Importaciones de Material UI
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// 2. Importar el tema desde la nueva ubicación
import theme from "./theme/theme"; // 👈 RUTA ACTUALIZADA


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AlertProvider>
          {/* 3. Envolver la app con el ThemeProvider */}
          <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Normaliza estilos y aplica el fondo base */}
            <App />
          </ThemeProvider>
        </AlertProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);