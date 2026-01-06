import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function MinesMap({ setPage, setActiveMine }) {

  const mines = [
    { id: 1, name: "Talcher Coal Mine", state: "Odisha", lat: 20.9749, lng: 85.1333, risk: "Medium" },
    { id: 2, name: "Jharia Coal Mine", state: "Jharkhand", lat: 23.7250, lng: 86.4445, risk: "High" },
    { id: 3, name: "Korba Mine", state: "Chhattisgarh", lat: 22.3284, lng: 82.6768, risk: "Low" },
    { id: 4, name: "Raniganj Mine", state: "West Bengal", lat: 23.6420, lng: 87.1407, risk: "Low" }
  ];

  const iconColor = (risk) =>
    risk === "High" ? "red" :
      risk === "Medium" ? "orange" : "green";

  const getIcon = (risk) => L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor(risk)}.png`,
    iconSize: [30, 45],
    iconAnchor: [12, 41]
  });

  const openMine = (mine) => {
    localStorage.setItem("activeMine", JSON.stringify(mine));
    setActiveMine(mine);
    setPage("MineDashboard");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-mineAccent">🗺 Mine Map View</h1>
      <p className="text-gray-400 mb-3">Click a mine marker to open Dashboard</p>

      <MapContainer center={[22.9, 85.0]} zoom={5} style={{ height: "80vh", borderRadius: "10px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {mines.map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={getIcon(m.risk)}
            eventHandlers={{ click: () => openMine(m) }}>

            <Popup>
              <b>{m.name}</b><br />
              {m.state}<br />
              <span style={{ color: m.risk === "High" ? "red" : m.risk === "Medium" ? "orange" : "lime" }}>
                Risk: {m.risk}
              </span><br />
              <button onClick={() => openMine(m)} style={{ marginTop: "5px" }} className="bg-mineAccent px-2 py-1 rounded text-black">
                Open Dashboard
              </button>
            </Popup>

          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
