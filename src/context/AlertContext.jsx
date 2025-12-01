// src/context/AlertContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export const AlertContext = createContext();

const isBusinessDay = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
}

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
    targetDate.setHours(23, 59, 59, 999); 
    return targetDate;
}

const _fetchAlertLogic = async () => {
    try {
        // 1. Petición optimizada al backend
        const [statsRes, maintenancesRes] = await Promise.all([
            api.get("/devices/get/dashboard-stats"), 
            api.get("/maintenances/get?status=pendiente&limit=1000") 
        ]);

        const statsData = statsRes.data || {};
        const allPendingMaintenances = maintenancesRes.data.data || [];
        const totalPendingCount = maintenancesRes.data.totalCount || 0;
        
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

        return {
            dashboardStats: statsData, 
            pendingMaintenancesList: criticalMaintenances,
            totalPendingMaintenancesCount: totalPendingCount,
            totalAlertCount: criticalMaintenances.length + (statsData.warrantyAlertsList?.length || 0),
            warrantyAlertsList: statsData.warrantyAlertsList || []
        };
    } catch (error) {
        console.error("Error en lógica de alertas:", error);
        return null;
    }
};

export const AlertProvider = ({ children }) => {
  const [loading, setLoading] = useState(true); 
  
  const [alertState, setAlertState] = useState({
      dashboardStats: {
          kpis: { 
              totalActiveDevices: 0, 
              devicesWithPanda: 0, 
              devicesWithoutPanda: 0, 
              monthlyDisposals: 0 
          },
          warrantyStats: { 
              expired: 0, 
              risk: 0, 
              safe: 0 
          },
          warrantyAlertsList: []
      },
      warrantyAlertsList: [],
      pendingMaintenancesList: [],
      totalPendingMaintenancesCount: 0,
      totalAlertCount: 0,
  });

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true); 
      const newState = await _fetchAlertLogic();
      if (newState) setAlertState(newState);
    } catch (error) {
      console.error("Error cargando datos de alertas:", error);
    } finally {
      setLoading(false); 
    }
  }, []);
  
  const refreshAlerts = useCallback(async () => {
      try {
          const newState = await _fetchAlertLogic();
          if (newState) setAlertState(newState);
      } catch (error) {
          console.error("Error refrescando alertas:", error);
      }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <AlertContext.Provider
      value={{
        loading,
        ...alertState,
        refreshAlerts, 
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};