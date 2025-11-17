// src/context/AlertContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [warrantyAlertsList, setWarrantyAlertsList] = useState([]);
  const [pendingMaintenancesList, setPendingMaintenancesList] = useState([]);
  const [totalAlertCount, setTotalAlertCount] = useState(0);

  const fetchAlertData = async () => {
    try {
      setLoading(true);
      const [devicesRes, maintenancesRes] = await Promise.all([
        api.get("/devices/get"),
        api.get("/maintenances/get"),
      ]);

      const devicesData = devicesRes.data || [];
      const maintenances = maintenancesRes.data || [];

      setDevices(devicesData); 

      // 1. Lógica de Mantenimientos (sin cambios)
      const pendingMaint = maintenances.filter((m) => m.estado === "pendiente");
      setPendingMaintenancesList(pendingMaint);

      // 2. Lógica de Garantías (CORREGIDA)
      
      // 👈 CORRECCIÓN 1: Normaliza "hoy" a la medianoche local
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(today.getDate() + 90);
      ninetyDaysFromNow.setHours(0, 0, 0, 0); // También normaliza

      const expiringList = [];

      devicesData.forEach((d) => {
        if (d.garantia_fin) {
          const expirationDate = new Date(d.garantia_fin);
          // 👈 CORRECCIÓN 2: Compara la fecha de expiración (que es local)
          // Usamos >= para incluir las que vencen HOY
          if (expirationDate >= today && expirationDate <= ninetyDaysFromNow) {
            expiringList.push(d);
          }
        }
      });

      setWarrantyAlertsList(expiringList);
      
      // 3. Sumar todas las alertas
      setTotalAlertCount(pendingMaint.length + expiringList.length);

      setLoading(false);
    } catch (error) {
      console.error("Error cargando datos de alertas:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertData();
  }, []);

  return (
    <AlertContext.Provider
      value={{
        loading,
        devices, 
        warrantyAlertsList,
        pendingMaintenancesList,
        totalAlertCount,
        refreshAlerts: fetchAlertData, // 👈 CORRECCIÓN: Exponemos la función
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};