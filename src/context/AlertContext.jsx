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
  // 👇 NUEVO ESTADO: Conteo de Panda
  const [pandaStatus, setPandaStatus] = useState({
      totalActiveDevices: 0,
      devicesWithPanda: 0,
      devicesWithoutPanda: 0
  });

  const fetchAlertData = async () => {
    try {
      setLoading(true);

      // Peticiones al backend, incluyendo el nuevo endpoint para Panda
      const [devicesRes, maintenancesRes, pandaStatusRes] = await Promise.all([
        api.get("/devices/get?page=1&limit=1000"), // Pide hasta 1000 dispositivos
        api.get("/maintenances/get?status=pendiente&limit=1000"), // Pide hasta 1000 mantenimientos pendientes
        api.get("/devices/get/panda-status") // 👈 NUEVA PETICIÓN
      ]);

      const devicesData = devicesRes.data.data || [];
      const maintenances = maintenancesRes.data.data || [];

      setDevices(devicesData); // Guarda la lista de dispositivos (para Home.jsx)
      setPandaStatus(pandaStatusRes.data); // 👈 Guardar estado de Panda

      // 1. Lógica de Mantenimientos
      setPendingMaintenancesList(maintenances);

      // 2. Lógica de Garantías
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(today.getDate() + 90);
      ninetyDaysFromNow.setHours(0, 0, 0, 0);

      const expiringList = [];

      devicesData.forEach((d) => {
        if (d.garantia_fin) {
          const expirationDate = new Date(d.garantia_fin);
          if (expirationDate >= today && expirationDate <= ninetyDaysFromNow) {
            expiringList.push(d);
          }
        }
      });

      setWarrantyAlertsList(expiringList);
      
      // 3. Sumar todas las alertas
      const totalPendingMaint = maintenancesRes.data.totalCount || 0;
      setTotalAlertCount(totalPendingMaint + expiringList.length);

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
        pandaStatus, // 👈 Exponer el estado de Panda
        refreshAlerts: fetchAlertData,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};