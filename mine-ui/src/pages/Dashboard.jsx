import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiUsers, FiCloudRain, FiShield, FiTrendingUp, FiBarChart } from "react-icons/fi";


export default function Dashboard() {
  const [totalActiveWorkers, setTotalActiveWorkers] = useState(0);

  useEffect(() => {
    const calculateWorkers = () => {
      let total = 0;
      // Iterate all local storage keys to find worker lists
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("workers_")) {
          try {
            const workers = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(workers)) {
              total += workers.length;
            }
          } catch (e) {
            console.error("Error parsing worker data", e);
          }
        }
      }
      // If 0, fallback to a sensible default or keep 0
      setTotalActiveWorkers(total || 47); // Keep 47 as visual fallback if no data yet (fresh load)
    };

    calculateWorkers();

    // Optional: listen for storage events if needed for multi-tab sync, 
    // but for single page navigation, we just calc on mount.
    // If we want real-time updates when coming back from mine page:
    window.addEventListener('storage', calculateWorkers);
    return () => window.removeEventListener('storage', calculateWorkers);
  }, []);

  const stats = [
    {
      title: "Rockfall Alerts",
      value: "⚠ 02",
      subtitle: "Immediate attention required",
      icon: FiAlertTriangle,
      color: "danger",
      bgColor: "bg-danger/10",
      iconColor: "text-danger",
      borderColor: "border-danger",
      shadowColor: "shadow-glow-danger",
      status: "Critical",
      critical: true
    },
    {
      title: "Active Workers",
      value: totalActiveWorkers.toString(),
      subtitle: "On-site personnel",
      icon: FiUsers,
      color: "primary",
      bgColor: "bg-primary-500/10",
      iconColor: "text-primary-500",
      borderColor: "border-primary-500",
      shadowColor: "shadow-glow-cyan",
      status: "Active"
    },
    {
      title: "Weather Status",
      value: "Stable",
      subtitle: "Favorable conditions",
      icon: FiCloudRain,
      color: "success",
      bgColor: "bg-success/10",
      iconColor: "text-success",
      borderColor: "border-success",
      shadowColor: "shadow-glow-cyan",
      status: "Updated"
    },
    {
      title: "Safety Score",
      value: "94%",
      subtitle: "Above target threshold",
      icon: FiShield,
      color: "accent",
      bgColor: "bg-accent-500/10",
      iconColor: "text-accent-500",
      borderColor: "border-accent-500",
      shadowColor: "shadow-glow-blue",
      status: "Good"
    },
    {
      title: "Predictions Made",
      value: "1,247",
      subtitle: "This month",
      icon: FiTrendingUp,
      color: "info",
      bgColor: "bg-info/10",
      iconColor: "text-info",
      borderColor: "border-info",
      shadowColor: "shadow-glow-cyan",
      status: "Tracking"
    },
    {
      title: "Accuracy Rate",
      value: "99.7%",
      subtitle: "AI prediction accuracy",
      icon: FiBarChart,
      color: "primary",
      bgColor: "bg-primary-500/10",
      iconColor: "text-primary-500",
      borderColor: "border-primary-500",
      shadowColor: "shadow-glow-cyan",
      status: "Optimal"
    }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-500 bg-clip-text text-transparent">
          Mine Overview Dashboard
        </h1>
        <p className="text-mineTextSecondary text-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          Real-time monitoring of mine safety metrics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className={`bg-dark-900 border border-dark-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${stat.critical ? 'animate-glowPulse' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div
                className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <stat.icon className={`${stat.iconColor} text-2xl`} />
              </motion.div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full bg-dark-850 border ${stat.borderColor} ${stat.iconColor}`}>
                {stat.status}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-mineTextSecondary text-sm font-medium">{stat.title}</p>
              <motion.h2
                className={`${stat.iconColor} text-5xl font-bold`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
              >
                {stat.value}
              </motion.h2>
              <p className="text-xs text-mineTextMuted">{stat.subtitle}</p>
            </div>

            {/* Progress bar for some cards */}
            {(stat.title.includes("Score") || stat.title.includes("Accuracy")) && (
              <div className="mt-4">
                <div className="h-2 bg-dark-850 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: stat.value }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`h-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-400 rounded-full`}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
      >
        <div className="glass-strong p-6 rounded-2xl border border-dark-800 hover:border-primary-500/50 transition-all">
          <h3 className="text-xl font-bold text-mineTextPrimary mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { time: "2 min ago", event: "New sensor data received", status: "success" },
              { time: "15 min ago", event: "Rockfall prediction updated", status: "warning" },
              { time: "1 hour ago", event: "Worker check-in completed", status: "info" }
            ].map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-dark-850 rounded-lg border border-dark-700"
              >
                <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-success' :
                  activity.status === 'warning' ? 'bg-warning' : 'bg-info'
                  }`} />
                <div className="flex-1">
                  <p className="text-sm text-mineTextPrimary">{activity.event}</p>
                  <p className="text-xs text-mineTextMuted">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-strong p-6 rounded-2xl border border-dark-800 hover:border-accent-500/50 transition-all">
          <h3 className="text-xl font-bold text-mineTextPrimary mb-4">System Health</h3>
          <div className="space-y-4">
            {[
              { name: "AI Model", status: 99, color: "primary" },
              { name: "Sensors", status: 97, color: "success" },
              { name: "Network", status: 100, color: "accent" }
            ].map((system, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-mineTextSecondary">{system.name}</span>
                  <span className={`text-${system.color}-500 font-semibold`}>{system.status}%</span>
                </div>
                <div className="h-2 bg-dark-850 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${system.status}%` }}
                    transition={{ duration: 1, delay: 1.2 + i * 0.1 }}
                    className={`h-full bg-gradient-to-r from-${system.color}-500 to-${system.color}-400`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

