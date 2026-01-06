import { useState, useContext } from "react";
import axios from "axios";
import { FiActivity, FiCpu, FiBarChart2 } from "react-icons/fi";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { MineContext } from "../context/MineContext";

export default function RockfallAI({ onRiskUpdate }) {
  const { activeMine, addNotification } = useContext(MineContext);
  const mine = activeMine || JSON.parse(localStorage.getItem("activeMine")) || { name: "Unknown Mine" };

  const [isPredicting, setIsPredicting] = useState(false);
  const [risk, setRisk] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [connectionError, setConnectionError] = useState(false);

  // Initial form state matches the user requirements
  const [form, setForm] = useState({
    slope_angle_deg: 40,
    rainfall_mm_24h: 50,
    rock_strength_mpa: 100,
    seismic_events_24h: 2,
    soil_moisture_pct: 30,
    crack_width_mm: 15,
    mine_depth_m: 200,
    blasting_activity: 0,
    past_incidents: 0,
    zone: "Zone 1"
  });

  const fieldConfig = [
    { key: "slope_angle_deg", label: "Slope Angle", min: 20, max: 79, unit: "°" },
    { key: "rainfall_mm_24h", label: "Rainfall (24h)", min: 0, max: 199, unit: "mm" },
    { key: "rock_strength_mpa", label: "Rock Strength", min: 20, max: 199, unit: "MPa" },
    { key: "seismic_events_24h", label: "Seismic Events", min: 0, max: 49, unit: "events" },
    { key: "soil_moisture_pct", label: "Soil Moisture", min: 10, max: 99, unit: "%" },
    { key: "crack_width_mm", label: "Crack Width", min: 0, max: 199, unit: "mm" },
    { key: "mine_depth_m", label: "Mine Depth", min: 10, max: 799, unit: "m" },
    { key: "past_incidents", label: "Past Incidents", min: 0, max: 19, unit: "count" },
    { key: "blasting_activity", label: "Blasting Activity", type: "checkbox" },
  ];

  const update = (key, val) => {
    setForm(prev => ({ ...prev, [key]: Number(val) }));
  };

  const updateCheckbox = (key, checked) => {
    setForm(prev => ({ ...prev, [key]: checked ? 1 : 0 }));
  };

  const predict = async () => {
    setIsPredicting(true);
    setRisk(null);
    setRiskScore(0);
    setConnectionError(false);
    // Clear parent dashboard risk state while analyzing
    if (onRiskUpdate) onRiskUpdate(null);

    try {
      const payload = {
        ...form,
        mine_name: mine.name
      };

      const res = await axios.post("http://127.0.0.1:8000/predict", payload);

      const result = res.data.risk_level;
      const score = res.data.risk_score;

      setRisk(result);
      setRiskScore(score);

      // Trigger Notification
      if (result === "High") {
        addNotification("High", `CRITICAL: High Rockfall Risk detected in ${form.zone} at ${mine.name}! Score: ${score}%`);
      } else if (result === "Medium") {
        addNotification("Medium", `Warning: Elevated risk in ${form.zone} at ${mine.name}. Score: ${score}%`);
      }

      // Update parent dashboard with new risk level
      if (onRiskUpdate) onRiskUpdate(result);

      // Log the prediction locally (persisting logic from Dashboard)
      const newLog = {
        mine: mine.name,
        time: new Date().toLocaleString(),
        risk: result,
        score: score,
        note: "AI Prediction (Standalone)",
        ...form
      };
      const existingLogs = JSON.parse(localStorage.getItem("mineLogs")) || [];
      localStorage.setItem("mineLogs", JSON.stringify([newLog, ...existingLogs]));

    } catch (error) {
      console.error("Prediction failed:", error);
      setConnectionError(true);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in p-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Geotechnical Assessment</h3>
              <p className="text-xs text-gray-500 mt-1">Adjust parameters to simulate risk scenarios.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={form.zone}
                onChange={(e) => setForm(prev => ({ ...prev, zone: e.target.value }))}
                className="bg-dark-800 border-none text-xs font-bold text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="Zone 1">Zone 1</option>
                <option value="Zone 2">Zone 2</option>
                <option value="Zone 3">Zone 3</option>
              </select>
              <span className="hidden md:inline text-xs font-bold text-primary-300 bg-primary-900/30 px-3 py-1 rounded-full border border-primary-800/50">8 Active Factors</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {fieldConfig.map((field) => (
              <div key={field.key} className={field.type === 'checkbox' ? "col-span-1 md:col-span-2" : ""}>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">{field.label}</label>
                  {field.type !== 'checkbox' && (
                    <span className="text-xs text-primary-400 font-mono font-bold bg-dark-950 px-2 py-0.5 rounded border border-dark-800">
                      {form[field.key]} {field.unit && <span className="text-gray-500 ml-1">{field.unit}</span>}
                    </span>
                  )}
                </div>

                {field.type === 'checkbox' ? (
                  <label className="flex items-center space-x-3 cursor-pointer p-3 bg-dark-800 rounded-xl border border-dark-700 hover:border-dark-600 transition-all">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form[field.key] === 1}
                        onChange={e => updateCheckbox(field.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-300">
                      {form[field.key] === 1 ? "Active Blasting Operations" : "No Blasting Activity"}
                    </span>
                  </label>
                ) : (
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    value={form[field.key]}
                    onChange={e => update(field.key, e.target.value)}
                    className="w-full appearance-none bg-dark-800 h-2 rounded-full accent-primary-500 cursor-pointer hover:accent-primary-400 transition-colors"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-dark-800">
            <button
              onClick={predict}
              disabled={isPredicting}
              className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg flex justify-center gap-2 items-center text-lg
                                ${isPredicting
                  ? "bg-dark-800 text-gray-500 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-500 text-white shadow-primary-900/20 hover:shadow-primary-600/20"
                }`}
            >
              {isPredicting ? <FiActivity className="animate-spin" /> : <FiCpu />}
              {isPredicting ? "Analyzing Geotechnical Data..." : "Run Prediction Model"}
            </button>
          </div>
        </div>
      </div>

      {/* Result Panel */}
      <div className="bg-dark-900 border border-dark-800 p-8 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden h-full shadow-sm">

        {connectionError ? (
          <div className="text-red-500 relative z-10 animate-fade-in">
            <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <FiActivity className="text-4xl text-red-500" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Backend Disconnected</h4>
            <p className="text-sm max-w-[200px] mx-auto text-gray-400">Unable to reach the AI server.</p>
            <p className="text-xs max-w-[200px] mx-auto text-red-400 mt-2 font-mono bg-red-950/30 p-2 rounded border border-red-900/50">Connection Refused (ECONNREFUSED)</p>
          </div>
        ) : !risk ? (
          <div className="text-gray-500 relative z-10">
            <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-700">
              <FiBarChart2 className="text-4xl opacity-40" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Ready to Analyze</h4>
            <p className="text-sm max-w-[200px] mx-auto text-gray-400">Adjust parameters and run the model to view safety predictions.</p>
          </div>
        ) : (
          <div className="space-y-8 w-full relative z-10 animate-fade-in">
            <div style={{ width: 200, height: 200, margin: "0 auto" }}>
              <CircularProgressbar
                value={riskScore}
                text={`${riskScore}%`}
                styles={buildStyles({
                  pathColor: risk === "High" ? "#ef4444" : risk === "Medium" ? "#f59e0b" : "#10b981",
                  textColor: "#fff",
                  textSize: "16px",
                  trailColor: "#1f2937",
                  pathTransitionDuration: 1.0
                })}
              />
            </div>

            <div className={`p-4 rounded-xl border ${risk === "High" ? "bg-danger/10 border-danger/30" :
              risk === "Medium" ? "bg-warning/10 border-warning/30" :
                "bg-success/10 border-success/30"
              }`}>
              <h4 className={`text-2xl font-bold mb-1 ${risk === "High" ? "text-danger" :
                risk === "Medium" ? "text-warning" :
                  "text-success"
                }`}>{risk} Risk</h4>

              <div className="h-px bg-white/10 my-3"></div>

              <p className="text-sm text-gray-300">
                {risk === "High" ? "CRITICAL: Evacuate sector immediately. Structural integrity compromised." :
                  risk === "Medium" ? "WARNING: Monitor sensors closely. Increased seismic activity detected." :
                    "SAFE: Operations normal. All parameters within safety limits."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
