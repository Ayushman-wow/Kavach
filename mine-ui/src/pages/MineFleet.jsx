import { FiMap, FiAlertOctagon, FiTruck, FiAlertTriangle } from "react-icons/fi";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";

export default function MineFleet({ mine, vehicles, collisionAlert, nearbyAlert, risk }) {
    // Logic lifted to parent
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in h-[600px]">
            {/* Left: Map View */}
            <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden relative shadow-md">
                <MapContainer
                    center={[mine.lat, mine.lng]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                >
                    <TileLayer url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']} />

                    {/* Mine Center */}
                    <Marker position={[mine.lat, mine.lng]}>
                        <Popup className="text-black">Mine HQ</Popup>
                    </Marker>



                    {/* Fleet Markers */}
                    {vehicles.map(v => (
                        <Marker
                            key={v.id}
                            position={[v.lat, v.lng]}
                            icon={new L.DivIcon({
                                className: 'bg-transparent',
                                html: `<div class="relative">
                                          <div class="${v.type === 'Excavator' ? 'bg-yellow-500' : 'bg-blue-500'} w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-bold text-black">${v.id.charAt(0)}</div>
                                          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-[9px] px-1 rounded whitespace-nowrap">${v.id}</div>
                                       </div>`
                            })}
                        >
                            <Popup>
                                <div className="text-black">
                                    <strong>{v.id}</strong><br />
                                    Type: {v.type}<br />
                                    Speed: {v.speed} km/h
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Simulated Controls Overlay */}
                <div className="absolute top-4 left-4 z-[1000] bg-dark-950/90 backdrop-blur border border-dark-700 p-3 rounded-lg text-xs">
                    <h4 className="text-white font-bold mb-1 flex items-center gap-2"><FiMap /> Fleet GPS System</h4>
                    <p className="text-gray-400">Tracking {vehicles.length} heavy machinery units.</p>
                    <div className="mt-2 flex gap-2">
                        <span className="flex items-center gap-1 text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Dumper</span>
                        <span className="flex items-center gap-1 text-yellow-500"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Excavator</span>
                    </div>
                </div>

                {/* COLLISION ALERT OVERLAY */}
                {(collisionAlert || nearbyAlert) && (
                    <div className={`absolute top-4 right-4 z-[1000] px-4 py-3 rounded-xl border shadow-2xl animate-pulse 
                        ${collisionAlert ? "bg-red-600 border-red-400 text-white" : "bg-yellow-500 border-yellow-300 text-black"}`}>
                        <div className="flex items-center gap-3">
                            <FiAlertOctagon className="text-3xl" />
                            <div>
                                <h3 className="font-bold text-lg uppercase leading-none">{collisionAlert ? "COLLISION RISK!" : "PROXIMITY ALERT"}</h3>
                                <p className="text-xs opacity-90 font-mono mt-1">Vehicles defined within unsafe radius.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Fleet Stats */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-4 flex flex-col gap-4 shadow-sm overflow-y-auto">
                <div className="border-b border-dark-800 pb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2"><FiTruck className="text-primary-500" /> Fleet Status</h3>
                    <p className="text-xs text-gray-500">Real-time telemetry and speed monitoring.</p>
                </div>

                <div className="space-y-3">
                    {vehicles.map(v => (
                        <div key={v.id} className="bg-dark-950 border border-dark-800 p-3 rounded-lg flex items-center justify-between group hover:border-dark-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${v.type === 'Excavator' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                    {v.type === 'Excavator' ? <FiTruck /> : <FiTruck />}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{v.id} <span className="text-gray-500 text-xs font-normal">({v.type})</span></h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${v.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                        <span className="text-xs text-gray-400">{v.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`text-lg font-mono font-bold ${v.speed > 40 ? "text-red-500 animate-pulse" : "text-white"}`}>
                                    {v.speed} <span className="text-xs text-gray-500">km/h</span>
                                </div>
                                {v.speed > 40 && <span className="text-[10px] text-red-500 font-bold uppercase block">Overspeed</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-4 border-t border-dark-800">
                    <div className="bg-dark-950 p-3 rounded-lg text-center">
                        <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Safety Index</span>
                        <div className="flex items-center justify-center gap-2">
                            <span className={`text-2xl font-bold ${collisionAlert ? "text-red-500" : nearbyAlert ? "text-yellow-500" : "text-green-500"}`}>
                                {collisionAlert ? "CRITICAL" : nearbyAlert ? "MODERATE" : "OPTIMAL"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
