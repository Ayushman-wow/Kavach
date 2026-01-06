import { useContext, useState } from "react";
import { MineContext } from "../context/MineContext";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function NearbyHospitals() {
  const { activeMine } = useContext(MineContext);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fix Leaflet's default icon path issues
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  if (!activeMine)
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <h2 className="text-xl font-bold text-danger">Select a Mine First</h2>
        <p className="text-gray-400">Please select a mine from the Mines page to find nearby hospitals.</p>
      </div>
    );

  const fetchHospitals = async () => {
    setLoading(true);
    setHasSearched(true);
    const { lat, lng } = activeMine;

    // Overpass API Query (fetch hospitals within 25km radius)
    const url = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="hospital"](around:25000,${lat},${lng});out;`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setHospitals(data.elements);
    } catch (e) {
      alert("Error fetching hospital data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Nearby Hospitals</h1>
          <p className="text-gray-400 text-sm">Emergency services near <span className="text-primary-400 font-semibold">{activeMine.name}</span></p>
        </div>
        <button
          onClick={fetchHospitals}
          className="btn btn-primary flex items-center gap-2"
          disabled={loading}
        >
          {loading ? "Searching..." : "🔍 Scan for Hospitals"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 bg-dark-900 border border-dark-850 rounded-xl overflow-hidden shadow-sm h-[500px] relative z-0">
          <MapContainer
            center={[activeMine.lat, activeMine.lng]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Mine Location */}
            <Marker position={[activeMine.lat, activeMine.lng]}>
              <Popup>
                <div className="text-center">
                  <b className="block text-primary-600 mb-1">{activeMine.name}</b>
                  <span className="text-xs text-gray-500">Target Mine Location</span>
                </div>
              </Popup>
            </Marker>

            {/* Radius Circle */}
            <Circle
              center={[activeMine.lat, activeMine.lng]}
              radius={25000}
              pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.1, weight: 1 }}
            />

            {/* Hospital Markers */}
            {hospitals.map((h, i) => (
              <Marker key={i} position={[h.lat, h.lon]}>
                <Popup>
                  <strong className="block text-sm mb-1">{h.tags.name || "Unnamed Hospital"}</strong>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-500 hover:underline"
                  >
                    Open in Google Maps
                  </a>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* List View */}
        <div className="bg-dark-900 border border-dark-850 rounded-xl p-4 h-[500px] overflow-y-auto">
          <h3 className="font-semibold text-white mb-4 sticky top-0 bg-dark-900 pb-2 border-b border-dark-800">
            Detected Facilities ({hospitals.length})
          </h3>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Scanning satellite data...</div>
          ) : hospitals.length > 0 ? (
            <div className="space-y-3">
              {hospitals.map((h, i) => (
                <div key={i} className="p-3 bg-dark-950 border border-dark-800 rounded-lg hover:border-primary-500/50 transition-colors">
                  <h4 className="font-medium text-white text-sm mb-1">{h.tags.name || "Unnamed Medical Facility"}</h4>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Lat: {h.lat.toFixed(3)}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-400 hover:text-primary-300"
                    >
                      Navigate →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              {hasSearched ? "No hospitals found within 25km range." : "Click search to find hospitals nearby."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
