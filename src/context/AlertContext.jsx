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

      // 👈 CORRECCIÓN: Hacemos las peticiones con 'limit=1' para obtener solo el total
      // O mejor, pedimos todos para las alertas. Esto es un punto a optimizar a futuro,
      // pero por ahora lo haremos funcionar pidiendo todos los datos (máx 1000).
      
      const [devicesRes, maintenancesRes] = await Promise.all([
        api.get("/devices/get?page=1&limit=1000"), // Pide hasta 1000 dispositivos
        api.get("/maintenances/get?status=pendiente&limit=1000") // Pide hasta 1000 mantenimientos pendientes
      ]);

      // 👈 CORRECCIÓN: Leer la nueva estructura de datos (res.data.data)
      const devicesData = devicesRes.data.data || [];
      const maintenances = maintenancesRes.data.data || [];

      setDevices(devicesData); // Guarda la lista de dispositivos (para Home.jsx)

      // 1. Lógica de Mantenimientos
      // Ya no necesitamos filtrar, la API lo hizo
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
      // 👈 CORRECCIÓN: Usamos el totalCount de la API para ser exactos
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
        refreshAlerts: fetchAlertData,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};