import { useState } from "react";
import { MineProvider } from "./context/MineContext";

// Pages
import Mines from "./pages/Mines";
import MineDashboard from "./pages/MineDashboard";
import TrendGraph from "./pages/TrendGraph";
import Logs from "./pages/Logs";
import LiveSensors from "./pages/LiveSensors";
import NearbyHospitals from "./pages/NearbyHospitals";

// Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function App() {
  const [page, setPage] = useState("Mines");

  return (
    <MineProvider>
      <div className="flex min-h-screen bg-dark-950 text-white overflow-hidden font-sans antialiased">
        <Sidebar setPage={setPage} currentPage={page} />

        <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
          <Navbar />

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent">
            {page === "Mines" && <Mines setPage={setPage} />}
            {page === "MineDashboard" && <MineDashboard setPage={setPage} />}
            {page === "TrendGraph" && <TrendGraph />}
            {page === "Logs" && <Logs />}
            {page === "Live Sensors" && <LiveSensors />}
            {page === "NearbyHospitals" && <NearbyHospitals />}
            {/* Fallback or other pages if needed */}
          </div>
        </div>
      </div>
    </MineProvider>
  );
}


