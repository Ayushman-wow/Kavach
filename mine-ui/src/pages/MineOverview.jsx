import { useState, useEffect } from "react";
import { FiActivity, FiCheckCircle, FiAlertOctagon, FiTruck, FiClock, FiMap, FiUsers, FiDroplet, FiWind, FiThermometer } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getWeather } from "../services/weatherService";

export default function MineOverview({ mine, workers = [], risk, collisionAlert, vehicles = [], setActiveTab, safetyScore = 100 }) {
    // Stats Calculation
    const totalWorkers = workers.length;
    const excavationCount = workers.filter(w => w.role === "Excavation").length;
    const transportCount = workers.filter(w => w.role === "Transport").length;
    const maintenanceCount = workers.filter(w => w.role === "Maintenance").length;
    // Calculate percentages
    const excPct = totalWorkers ? (excavationCount / totalWorkers) * 100 : 0;
    const transPct = totalWorkers ? (transportCount / totalWorkers) * 100 : 0;
    const maintPct = totalWorkers ? (maintenanceCount / totalWorkers) * 100 : 0;

    // Weather State
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        if (mine && mine.lat && mine.lng) {
            getWeather(mine.lat, mine.lng).then(data => {
                setWeather(data);
            });
        }
    }, [mine]);

    // Dynamic Shift Calculation
    const getShift = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 14) return "Shift A (Morning)";
        if (hour >= 14 && hour < 22) return "Shift B (Afternoon)";
        return "Shift C (Night)";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">

            {/* 1. Key Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-1 md:col-span-2 lg:col-span-3">
                {/* Safety Status */}
                <div className="bg-dark-900 border border-dark-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Safety Score</p>
                        <h3 className={`text-xl font-bold mt-1 flex items-center gap-2 ${safetyScore < 50 ? 'text-danger' : safetyScore < 80 ? 'text-warning' : 'text-success'}`} title="Aggregate safety score">
                            <FiCheckCircle /> {safetyScore}%
                        </h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success text-xl">
                        <FiActivity />
                    </div>
                </div>

                {/* Risk Assessment (Linked to Analysis) */}
                <div
                    onClick={() => setActiveTab('analysis')}
                    className={`bg-dark-900 border cursor-pointer hover:border-accent-500 transition-colors ${risk === 'High' ? 'border-danger/50 bg-danger/5' : risk === 'Medium' ? 'border-warning/50 bg-warning/5' : 'border-dark-800'} p-5 rounded-xl flex items-center justify-between shadow-sm`}
                >
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Geotech Risk</p>
                        <h3 className={`text-xl font-bold mt-1 ${risk === 'High' ? 'text-danger' : risk === 'Medium' ? 'text-warning' : 'text-emerald-400'}`}>
                            {risk || "-"}
                        </h3>
                    </div>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${risk === 'High' ? 'bg-danger/10 text-danger' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <FiAlertOctagon />
                    </div>
                </div>

                {/* Fleet Status (Linked to Fleet) */}
                <div
                    onClick={() => setActiveTab('fleet')}
                    className={`bg-dark-900 border cursor-pointer hover:border-primary-500 transition-colors ${collisionAlert ? 'border-danger animate-pulse' : 'border-dark-800'} p-5 rounded-xl flex items-center justify-between shadow-sm`}
                >
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Fleet Status</p>
                        <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                            {collisionAlert ? <span className="text-danger flex items-center gap-1"><FiAlertTriangle /> ALERT</span> : <span>{vehicles.length} Active</span>}
                        </h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl">
                        <FiTruck />
                    </div>
                </div>

                {/* Active Shift */}
                <div className="bg-dark-900 border border-dark-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Shift</p>
                        <h3 className="text-xl font-bold text-white mt-1">{getShift()}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 text-xl">
                        <FiClock />
                    </div>
                </div>
            </div>

            {/* 2. Simple Satellite Map */}
            <div className="lg:col-span-2 bg-dark-900 border border-dark-950 rounded-xl overflow-hidden h-[500px] relative z-0 shadow-lg group">
                <MapContainer
                    center={[mine.lat, mine.lng]}
                    zoom={16}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; Esri'
                    />

                    <Marker position={[mine.lat, mine.lng]}>
                        <Popup>{mine.name} Center</Popup>
                    </Marker>
                </MapContainer>

                {/* Overlay UI */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg text-xs font-mono text-white z-[1000] border border-primary-500/30">
                    <div className="flex items-center gap-2 mb-1">
                        <FiMap className="text-primary-400" />
                        <span className="font-bold text-primary-400">SATELLITE ORBIT</span>
                    </div>
                    <div className="text-[10px] text-gray-400">Esri World Imagery • Real-time Feed</div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Workers */}
                <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                            <FiUsers className="text-primary-500" />
                            <h3 className="text-white font-bold text-sm uppercase">Worker Distribution</h3>
                        </div>
                        <span className="text-xs text-white bg-primary-600 px-2 py-0.5 rounded font-mono">Total: {totalWorkers}</span>
                    </div>
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Zone A (Excavation)</span>
                                <span className="text-white font-bold">{excavationCount}</span>
                            </div>
                            <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-primary-600 to-primary-400 h-full" style={{ width: `${excPct}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Zone B (Transport)</span>
                                <span className="text-white font-bold">{transportCount}</span>
                            </div>
                            <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-teal-500 to-teal-400 h-full" style={{ width: `${transPct}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Maintenance Crew</span>
                                <span className="text-white font-bold">{maintenanceCount}</span>
                            </div>
                            <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-full" style={{ width: `${maintPct}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Environment Summary */}
                <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-white font-bold text-sm uppercase mb-4 flex items-center gap-2">
                        <FiActivity className="text-accent-500" /> Env. Conditions
                    </h3>
                    <div className="flex items-center justify-between">
                        <div className="text-center">
                            <FiDroplet className="mx-auto mb-2 text-blue-400 text-lg" />
                            <div className="text-lg font-bold text-white leading-none">
                                {weather ? `${weather.humidity}%` : "--"}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Humidity</div>
                        </div>
                        <div className="h-8 w-[1px] bg-dark-700"></div>
                        <div className="text-center">
                            <FiWind className="mx-auto mb-2 text-gray-300 text-lg" />
                            <div className="text-lg font-bold text-white leading-none">
                                {weather ? `${weather.wind}` : "--"}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Wind (km/h)</div>
                        </div>
                        <div className="h-8 w-[1px] bg-dark-700"></div>
                        <div className="text-center">
                            <FiThermometer className="mx-auto mb-2 text-red-400 text-lg" />
                            <div className="text-lg font-bold text-white leading-none">
                                {weather ? `${weather.temp}°` : "--"}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Temp</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
