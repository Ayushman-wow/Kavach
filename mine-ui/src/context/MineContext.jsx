import { createContext, useState, useEffect } from "react";

export const MineContext = createContext();

export function MineProvider({ children }) {

  // Load selected mine if page refreshed
  const [activeMine, setActiveMine] = useState(
    JSON.parse(localStorage.getItem("activeMine")) || null
  );

  // Save to localStorage whenever changed
  useEffect(() => {
    if (activeMine) {
      localStorage.setItem("activeMine", JSON.stringify(activeMine));
    }
  }, [activeMine]);

  // Global Notifications System
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [{ id, type, message, time: new Date() }, ...prev]);

    // Auto remove after 5 seconds if not critical (optional, but good for UX)
    if (type !== 'critical') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 8000);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <MineContext.Provider value={{ activeMine, setActiveMine, notifications, addNotification, removeNotification, clearNotifications }}>
      {children}
    </MineContext.Provider>
  );
}
