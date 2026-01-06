import { useContext, useState, useEffect } from "react";
import { MineContext } from "../context/MineContext";
import { FiActivity, FiMapPin, FiCpu, FiBarChart2, FiMap, FiUsers, FiArrowLeft, FiAlertTriangle, FiZap, FiTruck, FiAlertOctagon } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "react-circular-progressbar/dist/styles.css";
import L from "leaflet";

// Sub-components
import TrendGraph from "./TrendGraph";
import LiveSensors from "./LiveSensors";
import NearbyHospitals from "./NearbyHospitals";

// Extracted Dashboard Tabs
import MineOverview from "./MineOverview";
import MineFleet from "./MineFleet";
import RockfallAI from "./RockfallAI";
import MineSafety from "./MineSafety";


// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


export default function MineDashboard({ setPage }) {
  const { activeMine: mine, setActiveMine } = useContext(MineContext);
  const [activeTab, setActiveTab] = useState("overview");

  // --- WORKER STATE MANANGEMENT ---
  // --- WORKER STATE MANANGEMENT ---
  const [workers, setWorkers] = useState([]);
  const API_URL = "https://kavach-backend.onrender.com";

  // Load workers from MongoDB on mount or mine change
  useEffect(() => {
    if (!mine) return;

    const fetchWorkers = async () => {
      try {
        const res = await fetch(`${API_URL}/workers/${encodeURIComponent(mine.name)}`);
        const data = await res.json();

        // If empty, add mock data for demo and save to DB
        if (data.length === 0) {
          const mock = [
            { id: Date.now() + 1, name: "Rajesh Kumar", role: "Excavation", startTime: new Date(Date.now() - 6.5 * 3600000).toISOString(), mine_name: mine.name },
            { id: Date.now() + 2, name: "Amit Singh", role: "Transport", startTime: new Date(Date.now() - 8.5 * 3600000).toISOString(), mine_name: mine.name },
            { id: Date.now() + 3, name: "Sunil Verma", role: "Maintenance", startTime: new Date(Date.now() - 11 * 3600000).toISOString(), mine_name: mine.name },
            { id: Date.now() + 4, name: "Vikram Malhotra", role: "Excavation", startTime: new Date(Date.now() - 2 * 3600000).toISOString(), mine_name: mine.name },
            { id: Date.now() + 5, name: "Rohan Das", role: "Safety", startTime: new Date(Date.now() - 4 * 3600000).toISOString(), mine_name: mine.name },
          ];

          // Seed DB
          for (const w of mock) {
            await fetch(`${API_URL}/workers`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(w)
            });
          }
          setWorkers(mock);
        } else {
          setWorkers(data);
        }
      } catch (error) {
        console.error("Failed to fetch workers:", error);
      }
    };

    fetchWorkers();
  }, [mine]);

  const activeAddWorker = async (worker) => {
    const newWorker = { ...worker, mine_name: mine.name };
    try {
      const res = await fetch(`${API_URL}/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorker)
      });
      if (res.ok) {
        setWorkers(prev => [...prev, newWorker]);
      }
    } catch (error) {
      console.error("Error adding worker:", error);
    }
  }

  const activeEndShift = async (id) => {
    try {
      const res = await fetch(`${API_URL}/workers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWorkers(prev => prev.filter(w => w.id !== id));
      }
    } catch (error) {
      console.error("Error ending shift:", error);
    }
  };


  // --- FLEET STATE (Lifted) ---
  const [vehicles, setVehicles] = useState([]);
  const [collisionAlert, setCollisionAlert] = useState(false);
  const [nearbyAlert, setNearbyAlert] = useState(false);

  // Initial simulated fleet
  useEffect(() => {
    if (!mine) return;
    // Only init if empty (preserve state on tab switch)
    if (vehicles.length === 0) {
      const initialVehicles = [
        { id: "D-101", type: "Dumper", lat: mine.lat + 0.002, lng: mine.lng + 0.002, speed: 35, heading: 45, status: "Active" },
        { id: "D-104", type: "Dumper", lat: mine.lat - 0.002, lng: mine.lng - 0.001, speed: 42, heading: 180, status: "Active" }, // Speeding
        { id: "E-22", type: "Excavator", lat: mine.lat + 0.001, lng: mine.lng - 0.002, speed: 0, heading: 0, status: "Idle" },
        { id: "D-105", type: "Dumper", lat: mine.lat - 0.0005, lng: mine.lng + 0.001, speed: 28, heading: 270, status: "Active" },
      ];
      setVehicles(initialVehicles);
    }
  }, [mine]); // eslint-disable-line react-hooks/exhaustive-deps

  // Movement Simulation & Collision Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(current => {
        if (current.length === 0) return current;
        let collisionDetected = false;
        let proximityDetected = false;

        const updated = current.map(v => {
          if (v.type === "Excavator") return v;
          const moveFactor = 0.00005;
          let dLat = 0, dLng = 0;
          dLat = (Math.random() - 0.5) * moveFactor * (v.speed / 10);
          dLng = (Math.random() - 0.5) * moveFactor * (v.speed / 10);

          let newSpeed = v.speed + Math.floor(Math.random() * 5) - 2;
          if (newSpeed < 0) newSpeed = 0;
          if (newSpeed > 60) newSpeed = 60;

          return { ...v, lat: v.lat + dLat, lng: v.lng + dLng, speed: newSpeed };
        });

        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const v1 = updated[i];
            const v2 = updated[j];
            const dist = Math.sqrt(Math.pow(v1.lat - v2.lat, 2) + Math.pow(v1.lng - v2.lng, 2));
            if (dist < 0.0003) collisionDetected = true;
            else if (dist < 0.0008) proximityDetected = true;
          }
        }
        setCollisionAlert(collisionDetected);
        setNearbyAlert(proximityDetected);
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- RISK STATE ---
  const [risk, setRisk] = useState(null); // This will now hold the AVERAGE risk level
  const [safetyScore, setSafetyScore] = useState(100);

  // Calculate Average Risk & Safety Score from History
  useEffect(() => {
    if (!mine) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/predictions/history?mine_name=${encodeURIComponent(mine.name)}`);
        const history = await res.json();

        if (history.length > 0) {
          // Calculate Average Risk Score
          const totalRiskScore = history.reduce((sum, entry) => sum + (entry.risk_score || entry.score || 0), 0);
          const avgRiskScore = totalRiskScore / history.length;

          // Safety Score = 100 - Average Risk Score
          setSafetyScore(Math.round(100 - avgRiskScore));

          // Determine Aggregate Risk Level
          if (avgRiskScore >= 75) setRisk("High");
          else if (avgRiskScore >= 40) setRisk("Medium");
          else setRisk("Low");
        } else {
          setSafetyScore(100);
          setRisk("Low");
        }
      } catch (error) {
        console.error("Error fetching risk history:", error);
        // Fallback to safe defaults
        setSafetyScore(100);
        setRisk("Low");
      }
    };

    fetchStats();
  }, [mine, activeTab]); // Re-fetch when tab changes (in case prediction was made)

  useEffect(() => {
    // Reset to overview when mine changes
    setActiveTab("overview");
  }, [mine]);

  if (!mine) return null;

  const handleBack = () => {
    setActiveMine(null); // Clear selection
    setPage("Mines");
  };

  const tabs = [
    { id: "overview", label: "Dashboard", icon: <FiActivity /> },
    { id: "fleet", label: "Fleet & AI", icon: <FiTruck /> },
    { id: "analysis", label: "AI Prediction", icon: <FiCpu /> },
    { id: "sensors", label: "Sensors", icon: <FiZap /> },
    { id: "safety", label: "Worker Safety", icon: <FiUsers /> },
    { id: "trends", label: "Trends", icon: <FiBarChart2 /> },
    { id: "hospitals", label: "Map & Hospitals", icon: <FiMap /> },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-dark-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white transition-colors border border-transparent hover:border-dark-700"
            title="Back to All Mines"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{mine.name}</h1>
              <span className="px-2 py-0.5 rounded bg-primary-900/50 text-primary-300 text-xs font-bold uppercase tracking-wide border border-primary-800">Operational</span>
            </div>
            <p className="text-gray-400 flex items-center gap-2 text-sm">
              <FiMapPin className="text-primary-500" /> {mine.location} • Coal India Ltd.
            </p>
          </div>
        </div>

        {/* Tab Navigation - Scrollable on mobile */}
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex bg-dark-900 p-1 rounded-lg border border-dark-800 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-dark-800"
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px] animate-fade-in relative">


        {/* --- Render Extracted Tabs --- */}
        {activeTab === "overview" && (
          <MineOverview
            mine={mine}
            workers={workers}
            risk={risk}
            safetyScore={safetyScore}
            collisionAlert={collisionAlert}
            vehicles={vehicles}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "fleet" && (
          <MineFleet
            mine={mine}
            vehicles={vehicles}
            collisionAlert={collisionAlert}
            nearbyAlert={nearbyAlert}
            risk={risk}
          />
        )}
        {activeTab === "analysis" && (
          <RockfallAI onRiskUpdate={setRisk} />
        )}
        {activeTab === "safety" && (
          <MineSafety
            mine={mine}
            workers={workers}
            onAddWorker={activeAddWorker}
            onEndShift={activeEndShift}
          />
        )}

        {/* Existing Components (unchanged) */}
        {activeTab === "sensors" && <LiveSensors />}
        {activeTab === "trends" && <TrendGraph />}
        {activeTab === "hospitals" && <NearbyHospitals />}

      </div>
    </div>
  );
}
