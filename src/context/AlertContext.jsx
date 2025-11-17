// src/context/AlertContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]); // 👈 CORRECCIÓN: Añadido
  const [warrantyAlertsList, setWarrantyAlertsList] = useState([]);
  const [pendingMaintenancesList, setPendingMaintenancesList] = useState([]);
  const [totalAlertCount, setTotalAlertCount] = useState(0);

  // Esta función calcula todo
  const fetchAlertData = async () => {
    try {
      setLoading(true);
      const [devicesRes, maintenancesRes] = await Promise.all([
        api.get("/devices/get"),
        api.get("/maintenances/get"),
      ]);

      const devicesData = devicesRes.data || []; // 👈 CORRECCIÓN: Renombrada variable
      const maintenances = maintenancesRes.data || [];

      setDevices(devicesData); // 👈 CORRECCIÓN: Guardamos los dispositivos

      // 1. Lógica de Mantenimientos
      const pendingMaint = maintenances.filter((m) => m.estado === "pendiente");
      setPendingMaintenancesList(pendingMaint);

      // 2. Lógica de Garantías
      const today = new Date();
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(today.getDate() + 90);

      const expiringList = [];

      devicesData.forEach((d) => { // 👈 CORRECCIÓN: Usamos devicesData
        // Garantía
        if (d.garantia_fin) {
          const expirationDate = new Date(d.garantia_fin);
          if (expirationDate > today && expirationDate <= ninetyDaysFromNow) {
            expiringList.push(d);
          }
        }
      });

      setWarrantyAlertsList(expiringList);
      
      // 3. Sumar todas las alertas para el ícono de la campana
      setTotalAlertCount(pendingMaint.length + expiringList.length);

      setLoading(false);
    } catch (error) {
      console.error("Error cargando datos de alertas:", error);
      setLoading(false);
    }
  };

  // Cargar datos al iniciar la app
  useEffect(() => {
    fetchAlertData();
  }, []);

  return (
    <AlertContext.Provider
      value={{
        loading,
        devices, // 👈 CORRECCIÓN: Exportamos la lista de dispositivos
        warrantyAlertsList,
        pendingMaintenancesList,
        totalAlertCount,
        refreshAlerts: fetchAlertData,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};