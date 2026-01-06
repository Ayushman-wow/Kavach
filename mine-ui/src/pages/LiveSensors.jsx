import { useEffect, useState, useContext } from "react";
import { MineContext } from "../context/MineContext";
import { FiActivity, FiThermometer, FiWind, FiZap, FiDroplet } from "react-icons/fi";


export default function LiveSensors() {
  const { activeMine } = useContext(MineContext);

  if (!activeMine)
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-xl font-bold text-danger mb-2">No Mine Selected</h2>
        <p className="text-gray-400">Select a mine from the dashboard to view sensor data.</p>
      </div>
    );

  const [data, setData] = useState({
    methane: 0,
    carbon_monoxide: 0,
    oxygen: 0,
    pm2_5: 0,
    pm10: 0,
    temperature: 0,
    vibration: 0
  });

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/sensors/live");
        if (res.ok) {
          const data = await res.json();
          setData(data);
        }
      } catch (err) {
        console.error("Failed to fetch live sensors:", err);
        // Reset to safe default if connection lost
        setData({ methane: 0, carbon_monoxide: 0, oxygen: 21, pm2_5: 0, pm10: 0, temperature: 0, vibration: 0 });
      }
    };

    // Poll every 2.5s
    const interval = setInterval(fetchSensors, 2500);
    fetchSensors(); // Initial call

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FiActivity /> Live Sensor Matrix
        </h1>
        <p className="text-gray-400 font-mono text-sm">
          Source: <span className="text-primary-400">{activeMine.name}</span> — Real-time telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <SensorCard
          label="Methane (CH₄)"
          value={data.methane}
          unit="%"
          threshold={1.5}
          icon={FiWind}
        // description prop removed
        />
        <SensorCard
          label="Carbon Monoxide"
          value={data.carbon_monoxide}
          unit="ppm"
          threshold={25}
          icon={FiWind}
        />
        <SensorCard
          label="Oxygen (O₂)"
          value={data.oxygen}
          unit="%"
          threshold={19.0}
          reverseThreshold={true}
          icon={FiWind}
        />
        <SensorCard
          label="PM 2.5"
          value={data.pm2_5}
          unit="µg/m³"
          threshold={75}
          icon={FiDroplet}
        />
        <SensorCard
          label="PM 10"
          value={data.pm10}
          unit="µg/m³"
          threshold={100}
          icon={FiDroplet}
        />
        <SensorCard
          label="Temperature"
          value={data.temperature}
          unit="°C"
          threshold={55}
          icon={FiThermometer}
        />
        <SensorCard
          label="Seismic Vibration"
          value={data.vibration}
          unit="Mw"
          threshold={4.0}
          icon={FiZap}
        />
      </div>
    </div>
  );
}

function SensorCard({ label, value, unit, threshold, reverseThreshold, icon: Icon }) {
  const isHigh = reverseThreshold ? value < threshold : value > threshold;

  // Calculate percentage for progress bar (clamped 0-100)
  let percent = 0;
  if (reverseThreshold) {
    percent = Math.min((value / 25) * 100, 100);
  } else {
    percent = Math.min((value / (threshold * 1.5)) * 100, 100);
  }

  return (
    <div
      className={`bg-dark-900 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border transition-colors ${isHigh ? 'border-danger/50' : 'border-dark-700'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${isHigh ? 'bg-danger/20 text-danger' : 'bg-dark-800 text-primary-400'}`}>
          <Icon className="text-2xl" />
        </div>
        <div className={`w-3 h-3 rounded-full ${isHigh ? 'bg-danger animate-pulse' : 'bg-success'}`} />
      </div>

      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</h3>
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-bold font-mono ${isHigh ? 'text-danger' : 'text-white'}`}>
          {value}
        </span>
        <span className="text-gray-500 font-medium">{unit}</span>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-dark-900 h-1.5 mt-4 rounded-full overflow-hidden">
        <div
          style={{ width: `${percent}%` }}
          className={`h-full transition-all duration-500 ${isHigh ? 'bg-danger' : 'bg-primary-500'}`}
        />
      </div>
    </div>
  );
}
