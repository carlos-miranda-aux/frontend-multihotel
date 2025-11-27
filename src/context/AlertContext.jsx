// src/context/AlertContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

export const AlertContext = createContext();

// Helper function to check if a day is a weekend
const isBusinessDay = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
}

// Helper function to calculate 5 business days from now
const getFiveBusinessDaysFromNow = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    let businessDaysCount = 0;
    let targetDate = new Date(today);
    
    while (businessDaysCount < 5) {
        targetDate.setDate(targetDate.getDate() + 1);
        if (isBusinessDay(targetDate)) {
            businessDaysCount++;
        }
    }
    // Retornamos la fecha límite (al final del 5to día hábil a partir de hoy)
    targetDate.setHours(23, 59, 59, 999); 
    return targetDate;
}

export const AlertProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [warrantyAlertsList, setWarrantyAlertsList] = useState([]);
  // Lista filtrada (solo 5 días hábiles) para el widget de tareas críticas y Topbar
  const [pendingMaintenancesList, setPendingMaintenancesList] = useState([]); 
  // Contiene el conteo total para el KPI superior del Dashboard
  const [totalPendingMaintenancesCount, setTotalPendingMaintenancesCount] = useState(0); 
  // Contiene la suma de alertas de garantía y mantenimientos (filtrados) para la campana del Topbar
  const [totalAlertCount, setTotalAlertCount] = useState(0); 
  
  const [pandaStatus, setPandaStatus] = useState({
      totalActiveDevices: 0,
      devicesWithPanda: 0,
      devicesWithoutPanda: 0,
      expiredWarrantiesCount: 0 
  });

  const fetchAlertData = async () => {
    try {
      setLoading(true);

      // Peticiones al backend
      const [devicesRes, maintenancesRes, pandaStatusRes] = await Promise.all([
        api.get("/devices/get?page=1&limit=1000"), 
        api.get("/maintenances/get?status=pendiente&limit=1000"), // Traemos TODAS las pendientes
        api.get("/devices/get/panda-status") 
      ]);

      const devicesData = devicesRes.data.data || [];
      const allPendingMaintenances = maintenancesRes.data.data || []; // Lista completa de pendientes
      const totalPendingCount = maintenancesRes.data.totalCount || 0; // Conteo TOTAL de pendientes

      setDevices(devicesData); 
      setPandaStatus(pandaStatusRes.data); 

      // Guardar el conteo TOTAL para el KPI del Dashboard
      setTotalPendingMaintenancesCount(totalPendingCount); 

      // 1. Lógica de Mantenimientos (FILTRADO POR 5 DÍAS HÁBILES)
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      const fiveBusinessDaysFromNow = getFiveBusinessDaysFromNow();
      
      const criticalMaintenances = allPendingMaintenances.filter(m => {
          if (!m.fecha_programada) return false;
          
          const scheduledDate = new Date(m.fecha_programada);
          // Solo incluir si la fecha programada es HOY o posterior,
          // Y menor o igual a la fecha límite calculada (5to día hábil al final del día).
          const isDue = scheduledDate.getTime() >= today.getTime() && scheduledDate.getTime() <= fiveBusinessDaysFromNow.getTime();
          
          // Además, solo mostrar si es un día hábil (para evitar que un fin de semana se cuele en la lista crítica)
          return isDue && isBusinessDay(scheduledDate);
      });

      // Ordenar por fecha programada más cercana
      criticalMaintenances.sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada));

      // Almacenamos SOLO las críticas para el widget del Dashboard y el Topbar.
      setPendingMaintenancesList(criticalMaintenances); 
      
      // 2. Lógica de Garantías (Por Vencer - 90 días)
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
      // totalAlertCount (para la campana del Topbar) = Mantenimientos CRÍTICOS (filtrados) + Alertas de Garantía
      setTotalAlertCount(criticalMaintenances.length + expiringList.length);

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
        pendingMaintenancesList, // Lista filtrada (5 días hábiles)
        totalPendingMaintenancesCount, // Conteo TOTAL (sin filtrar) para el KPI
        totalAlertCount, // Conteo filtrado (para la campana)
        pandaStatus, 
        refreshAlerts: fetchAlertData,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};