import { useState } from "react";
import {
  FiHome,
  FiCpu,
  FiFileText,
  FiMap,
  FiBarChart2,
  FiActivity
} from "react-icons/fi";

export default function Sidebar({ setPage, currentPage, activeMine }) {
  const [active, setActive] = useState(currentPage || "Mines");

  const menu = [
    { name: "Mines", label: "Home", icon: <FiHome /> },
    // { name: "Dashboard", label: "Global Stats", icon: <FiActivity /> }, // Optional: Global stats
    { name: "Logs", label: "System Logs", icon: <FiFileText /> },
  ];

  const handleClick = (item) => {
    setActive(item.name);
    setPage(item.name);
  };

  return (
    <div className="bg-dark-950 w-64 min-h-screen border-r border-dark-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-dark-800 flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-cover rounded-full" />
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">
            MineSafe
          </h2>
          <p className="text-gray-500 text-xs uppercase tracking-wider">Solutions</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => (
          <button
            key={item.name}
            onClick={() => handleClick(item)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${active === item.name
                ? "bg-primary-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-dark-900"
              }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <p className="text-gray-400 text-xs font-medium">System Online</p>
        </div>
      </div>
    </div>
  );
}


