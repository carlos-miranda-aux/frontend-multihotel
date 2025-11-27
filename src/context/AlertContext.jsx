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

// Lógica base de fetching, recibe los setters para actualizar el estado
const _fetchAlertLogic = async (setters) => {
    const { 
        setDevices, setPandaStatus, setTotalPendingMaintenancesCount,
        setPendingMaintenancesList, setWarrantyAlertsList, setTotalAlertCount
    } = setters;
    
    const [devicesRes, maintenancesRes, pandaStatusRes] = await Promise.all([
        api.get("/devices/get?page=1&limit=1000"), 
        api.get("/maintenances/get?status=pendiente&limit=1000"), 
        api.get("/devices/get/panda-status") 
    ]);

    const devicesData = devicesRes.data.data || [];
    const allPendingMaintenances = maintenancesRes.data.data || []; 
    const totalPendingCount = maintenancesRes.data.totalCount || 0; 

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
        const isDue = scheduledDate.getTime() >= today.getTime() && scheduledDate.getTime() <= fiveBusinessDaysFromNow.getTime();
        
        return isDue && isBusinessDay(scheduledDate);
    });

    criticalMaintenances.sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada));

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
    
    // 3. Sumar todas las alertas (solo críticas para la campana)
    setTotalAlertCount(criticalMaintenances.length + expiringList.length);
};


export const AlertProvider = ({ children }) => {
  const [loading, setLoading] = useState(true); // Usado solo para el estado inicial de la página
  const [devices, setDevices] = useState([]);
  const [warrantyAlertsList, setWarrantyAlertsList] = useState([]);
  const [pendingMaintenancesList, setPendingMaintenancesList] = useState([]); 
  const [totalPendingMaintenancesCount, setTotalPendingMaintenancesCount] = useState(0); 
  const [totalAlertCount, setTotalAlertCount] = useState(0); 
  
  const [pandaStatus, setPandaStatus] = useState({
      totalActiveDevices: 0,
      devicesWithPanda: 0,
      devicesWithoutPanda: 0,
      expiredWarrantiesCount: 0 
  });
  
  // Colección de setters para pasar a la lógica base
  const setters = { 
      setDevices, setPandaStatus, setTotalPendingMaintenancesCount,
      setPendingMaintenancesList, setWarrantyAlertsList, setTotalAlertCount
  };

  // Función para la carga inicial (maneja el estado de 'loading' de la página)
  const fetchInitialData = async () => {
    try {
      setLoading(true); // Activa el spinner de la página
      await _fetchAlertLogic(setters);
    } catch (error) {
      console.error("Error cargando datos de alertas:", error);
    } finally {
      setLoading(false); // Desactiva el spinner de la página
    }
  };
  
  // Función para el refresco manual (NO toca el estado 'loading' para evitar el flicker)
  const refreshAlerts = async () => {
      try {
          await _fetchAlertLogic(setters);
      } catch (error) {
          console.error("Error refrescando alertas:", error);
      }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <AlertContext.Provider
      value={{
        loading,
        devices, 
        warrantyAlertsList,
        pendingMaintenancesList, 
        totalPendingMaintenancesCount, 
        totalAlertCount, 
        pandaStatus, 
        refreshAlerts: refreshAlerts, // 👈 Se expone la función que NO causa flicker
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};