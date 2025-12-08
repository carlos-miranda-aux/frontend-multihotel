// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 1. Importaciones de Material UI
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// 2. Importar el tema desde la nueva ubicación
import theme from "./theme/theme";

// 👇 3. Importar el ErrorBoundary
import ErrorBoundary from "./components/common/ErrorBoundary";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter> 
        {/* 👇 Envolvemos el contexto de Auth y la App con el Boundary */}
        <ErrorBoundary>
          <AuthProvider>
            <AlertProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline /> 
                <App />
              </ThemeProvider>
            </AlertProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);