import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [warrantyAlertsList, setWarrantyAlertsList] = useState([]);
  const [pendingMaintenancesList, setPendingMaintenancesList] = useState([]);
  // const [pendingRevisionsList, setPendingRevisionsList] = useState([]); // 👈 ELIMINADO
  const [totalAlertCount, setTotalAlertCount] = useState(0);

  // Esta función calcula todo
  const fetchAlertData = async () => {
    try {
      setLoading(true);
      const [devicesRes, maintenancesRes] = await Promise.all([
        api.get("/devices/get"),
        api.get("/maintenances/get"),
      ]);

      const devices = devicesRes.data || [];
      const maintenances = maintenancesRes.data || [];

      // 1. Lógica de Mantenimientos
      const pendingMaint = maintenances.filter((m) => m.estado === "pendiente");
      setPendingMaintenancesList(pendingMaint);

      // 2. Lógica de Garantías
      const today = new Date();
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(today.getDate() + 90);

      const expiringList = [];
      // const revisionList = []; // 👈 ELIMINADO

      devices.forEach((d) => {
        // Garantía
        if (d.garantia_fin) {
          const expirationDate = new Date(d.garantia_fin);
          if (expirationDate > today && expirationDate <= ninetyDaysFromNow) {
            expiringList.push(d);
          }
        }
        // Lógica de Revisión ELIMINADA de aquí
      });

      setWarrantyAlertsList(expiringList);
      // setPendingRevisionsList(revisionList); // 👈 ELIMINADO
      
      // 3. Sumar todas las alertas para el ícono de la campana
      //    (Quitamos revisionList.length)
      setTotalAlertCount(pendingMaint.length + expiringList.length); // 👈 MODIFICADO

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
        // pendingRevisionsList, // 👈 ELIMINADO
        totalAlertCount,
        refreshAlerts: fetchAlertData,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};