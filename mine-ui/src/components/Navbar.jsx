import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiZap, FiAlertTriangle, FiBell, FiX, FiCheckCircle, FiInfo } from "react-icons/fi";
import { MineContext } from "../context/MineContext";

export default function Navbar() {
  const { notifications, removeNotification, clearNotifications } = useContext(MineContext);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-strong border-b border-dark-800 px-6 py-4 flex justify-between items-center shadow-3d sticky top-0 z-40">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent"
        >
          Kavach
        </motion.h1>
        <p className="text-mineTextMuted text-xs mt-1 flex items-center gap-2">
          <FiZap className="text-primary-500 text-sm" />
          A open cast mine safety solution
        </p>
      </div>

      <div className="flex items-center gap-6">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl bg-dark-850 border border-dark-700 hover:bg-dark-800 text-mineTextPrimary transition-colors"
          >
            <FiBell className="text-xl" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-dark-900 animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-dark-700 flex justify-between items-center bg-dark-950">
                  <h3 className="font-bold text-sm text-white">Notifications ({notifications.length})</h3>
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="text-xs text-primary-400 hover:text-primary-300">Clear All</button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No new alerts</div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map(n => (
                        <div key={n.id} className="p-3 border-b border-dark-800 hover:bg-dark-800 transition-colors flex gap-3 relative group">
                          <div className={`mt-1 text-lg ${n.type === 'critical' || n.type === 'High' ? 'text-red-500' : n.type === 'Medium' ? 'text-amber-500' : 'text-primary-500'}`}>
                            {n.type === 'critical' || n.type === 'High' ? <FiAlertTriangle /> : <FiInfo />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-200 leading-tight">{n.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.time.toLocaleTimeString()}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date & Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-dark-850 px-4 py-2 rounded-xl border border-dark-700"
        >
          <div className="flex items-center gap-2 text-mineTextSecondary">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <FiClock className="text-primary-500 text-lg" />
            </motion.div>
            <div className="text-right">
              <p className="text-xs text-mineTextMuted">{date}</p>
              <p className="text-sm font-mono font-semibold text-mineTextPrimary">{time}</p>
            </div>
          </div>
        </motion.div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 bg-dark-850 px-4 py-2 rounded-xl border border-success/30">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-success rounded-full shadow-glow-cyan"
          />
          <span className="text-xs font-medium text-success">Live</span>
        </div>

        {/* SOS Button */}
        <button
          onClick={() => {
            if (window.confirm("CRITICAL: ACTIVATE EMERGENCY SOS SIGNAL?")) {
              alert("SOS SIGNAL SENT TO HQ AND EMERGENCY SERVICES!");
            }
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition-all shadow-lg hover:shadow-red-900/50 font-bold tracking-wider"
        >
          <FiAlertTriangle className="text-xl" />
          <span>SOS</span>
        </button>
      </div>
    </div>
  );
}

