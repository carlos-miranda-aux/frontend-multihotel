import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [warrantyAlertsList, setWarrantyAlertsList] = useState([]);
  const [pendingMaintenancesList, setPendingMaintenancesList] = useState([]);
  const [pendingRevisionsList, setPendingRevisionsList] = useState([]);
  const [totalAlertCount, setTotalAlertCount] = useState(0);

  // Esta función calcula todo
  const fetchAlertData = async () => {
    try {
      setLoading(true);
      const [devicesRes, maintenancesRes] = await Promise.all([
        api.get("/devices/get"),
        api.get("/maintenances/get"),
      ]);

      // 👇 --- INICIA LA CORRECCIÓN --- 👇
      // Si la API no devuelve datos, usamos un array vacío como fallback
      const devices = devicesRes.data || [];
      const maintenances = maintenancesRes.data || [];
      // 👆 --- TERMINA LA CORRECCIÓN --- 👆

      // 1. Lógica de Mantenimientos
      const pendingMaint = maintenances.filter((m) => m.estado === "pendiente");
      setPendingMaintenancesList(pendingMaint);

      // 2. Lógica de Garantías y Revisiones
      const today = new Date();
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(today.getDate() + 90);

      const expiringList = [];
      const revisionList = [];

      devices.forEach((d) => {
        // Garantía
        if (d.garantia_fin) {
          const expirationDate = new Date(d.garantia_fin);
          if (expirationDate > today && expirationDate <= ninetyDaysFromNow) {
            expiringList.push(d);
          }
        }
        // Revisión
        if (d.fecha_proxima_revision) {
          const revisionDate = new Date(d.fecha_proxima_revision);
          if (revisionDate < today) {
            revisionList.push(d);
          }
        }
      });

      setWarrantyAlertsList(expiringList);
      setPendingRevisionsList(revisionList);
      
      // 3. Sumar todas las alertas para el ícono de la campana
      setTotalAlertCount(pendingMaint.length + expiringList.length + revisionList.length);

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
        warrantyAlertsList,
        pendingMaintenancesList,
        pendingRevisionsList,
        totalAlertCount,
        refreshAlerts: fetchAlertData,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};