// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // 👈 IMPORTANTE: Agregar esto
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 1. Importaciones de Material UI
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// 2. Importar el tema desde la nueva ubicación
import theme from "./theme/theme";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* 👇 Envolver todo con BrowserRouter */}
      <BrowserRouter> 
        <AuthProvider>
          <AlertProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline /> 
              <App />
            </ThemeProvider>
          </AlertProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);