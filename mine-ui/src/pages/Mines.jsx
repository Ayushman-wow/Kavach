import { useContext, useEffect, useState } from "react";
import { MineContext } from "../context/MineContext";
import { API_URL } from "../config";
import { FiMapPin, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import axios from "axios";



export default function Mines({ setPage }) {
  const { setActiveMine } = useContext(MineContext);
  const [workerCounts, setWorkerCounts] = useState({});

  const mines = [
    { id: 1, name: "Talcher Coal Mine", subtitle: "Odisha, India", lat: 20.9749, lng: 85.1333, risk: "Medium" },
    { id: 2, name: "Jharia Coal Mine", subtitle: "Jharkhand, India", lat: 23.7250, lng: 86.4445, risk: "High" },
    { id: 3, name: "Korba Mine", subtitle: "Chhattisgarh, India", lat: 22.3284, lng: 82.6768, risk: "Low" },
    { id: 4, name: "Raniganj Mine", subtitle: "West Bengal, India", lat: 23.6420, lng: 87.1407, risk: "Low" }
  ];

  useEffect(() => {
    const fetchWorkerCounts = async () => {
      const counts = {};
      for (const mine of mines) {
        try {
          const res = await axios.get(`${API_URL}/workers/${encodeURIComponent(mine.name)}`);
          counts[mine.name] = res.data.length;
        } catch (err) {
          console.error(`Error fetching workers for ${mine.name}:`, err);
          counts[mine.name] = 0;
        }
      }
      setWorkerCounts(counts);
    };
    fetchWorkerCounts();
  }, []);

  const openMine = (mine) => {
    try {
      localStorage.setItem("activeMine", JSON.stringify(mine));
      setActiveMine(mine);
      setPage("MineDashboard");
    } catch (err) {
      console.error("Error opening mine:", err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Select a Mine</h1>
        <p className="text-gray-400 max-w-2xl">
          Choose a site to access the safety dashboard.
        </p>
      </div>

      {/* Mine Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {mines.map((mine) => (
          <div
            key={mine.id}
            onClick={() => openMine(mine)}
            className="bg-dark-900 border border-dark-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer group hover:border-primary-500/50"
            role="button"
            tabIndex={0}
          >
            <div className="block pointer-events-none">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors mb-1">
                    {mine.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FiMapPin /> {mine.subtitle}
                  </div>
                </div>

                {/* Risk Badge */}
                <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1.5
                  ${mine.risk === "High" ? "bg-danger/20 text-danger border border-danger/30" :
                    mine.risk === "Medium" ? "bg-warning/20 text-warning border border-warning/30" :
                      "bg-success/20 text-success border border-success/30"}`}
                >
                  <FiAlertCircle /> {mine.risk} Risk
                </div>
              </div>

              {/* Stats Preview */}
              <div className="flex gap-4 mb-6">
                <div className="bg-dark-950 px-3 py-2 rounded-lg border border-dark-800 flex-1">
                  <span className="text-xs text-gray-500 block">Sensors</span>
                  <span className="font-mono text-primary-400 font-semibold">24/24 Online</span>
                </div>
                <div className="bg-dark-950 px-3 py-2 rounded-lg border border-dark-800 flex-1">
                  <span className="text-xs text-gray-500 block">Active Workers</span>
                  <span className="font-mono text-white font-semibold">
                    {workerCounts[mine.name] !== undefined ? workerCounts[mine.name] : "-"}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-dark-800">
                <button
                  className="text-xs text-gray-400 font-medium uppercase tracking-wider hover:text-white transition-colors pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    openMine(mine);
                  }}
                >
                  Access Dashboard
                </button>
                <div className="w-8 h-8 rounded-full bg-dark-950 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-primary-600 transition-all">
                  <FiArrowRight />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

