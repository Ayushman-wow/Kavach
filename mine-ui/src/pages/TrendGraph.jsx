import { useContext, useEffect, useState } from "react";
import { MineContext } from "../context/MineContext";
import { Line, Bar } from "react-chartjs-2";
import { FiTrendingUp, FiActivity, FiClock, FiTrash2, FiLayers, FiDownload } from "react-icons/fi";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from "chart.js";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const API_URL = "https://kavach-backend.onrender.com";

export default function TrendGraph() {
  const { activeMine } = useContext(MineContext);
  const [logs, setLogs] = useState([]);
  const [selectedView, setSelectedView] = useState("Combined");
  const [loading, setLoading] = useState(false);

  // Fetch from API
  const fetchTrends = async () => {
    if (!activeMine) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/predictions/history`, {
        params: { mine_name: activeMine.name }
      });
      // API returns newest first usually, but check sort
      // We need oldest to newest for graphs
      const sorted = res.data.reverse();
      setLogs(sorted);
    } catch (err) {
      console.error("Error fetching trends:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [activeMine]);

  const clearHistory = async () => {
    if (!activeMine) return;
    if (!window.confirm(`Clear all history for ${activeMine.name}?`)) return;

    try {
      await axios.delete(`${API_URL}/predictions/clear`, {
        params: { mine_name: activeMine.name }
      });
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  }

  const downloadReport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.text(`Safety Audit Report: ${activeMine.name}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Summary Statistics
    const total = logs.length;
    const highRisk = logs.filter(l => (l.risk_level || l.risk) === "High").length;
    const mediumRisk = logs.filter(l => (l.risk_level || l.risk) === "Medium").length;

    doc.text(`Total Assessments: ${total}`, 14, 45);
    doc.text(`High Risk Alerts: ${highRisk}`, 14, 52);
    doc.setTextColor(highRisk > 0 ? 255 : 0, 0, 0); // Red if high risk exists
    if (highRisk > 0) doc.text("STATUS: ACTION REQUIRED", 80, 52);
    doc.setTextColor(0, 0, 0); // Reset

    // Logs Table
    const tableRows = logs.slice().reverse().map(log => [
      log.timestamp ? new Date(log.timestamp).toLocaleString() : (log.time || "N/A"),
      log.zone || "Zone 1",
      log.risk_level || log.risk,
      (log.risk_score || log.score) + "%",
      log.slope_angle_deg || log.slope_angle || "-"
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Time', 'Zone', 'Risk Level', 'Score', 'Slope (deg)']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }, // Green header
      styles: { fontSize: 10 },
    });

    doc.save(`Safety_Report_${activeMine.name}_${Date.now()}.pdf`);
  };

  // --- Data Processing for Zones ---
  const getZoneData = (zoneName) => {
    return logs.filter(l => (l.zone || "Zone 1") === zoneName);
  };

  const zone1 = getZoneData("Zone 1");
  const zone2 = getZoneData("Zone 2");
  const zone3 = getZoneData("Zone 3");

  const createChartData = (data, label, color, bgColor) => ({
    labels: data.map(l => l.timestamp ? new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (l.time || "N/A")),
    datasets: [{
      label: label,
      data: data.map(l => l.risk_score || l.score || 0),
      borderColor: color,
      backgroundColor: bgColor,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: true
    }]
  });

  const chartOptionsSmall = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { display: false },
      y: { min: 0, max: 100, display: false } // clean look
    }
  };

  const chartOptionsLarge = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxTicksLimit: 10 },
        grid: { color: "#33415522" }
      },
      y: {
        min: 0,
        max: 100,
        ticks: { color: "#94a3b8", callback: v => `${v}%` },
        grid: { color: "#33415522" },
        title: { display: true, text: 'Risk Score (%)', color: '#64748b' }
      }
    },
    plugins: {
      legend: { labels: { color: "#cbd5e1", usePointStyle: true, boxWidth: 6 } },
    }
  };

  // --- Combined LINE Chart (Index Based, not Time based) ---
  // Aligning all zones by their sequence index (1st prediction, 2nd prediction...)
  // 'logs' is already sorted oldest -> newest because we did res.data.reverse() in fetch
  // So zoneX arrays are also oldest -> newest.

  const z1Data = zone1.map(z => z.risk_score || z.score || 0);
  const z2Data = zone2.map(z => z.risk_score || z.score || 0);
  const z3Data = zone3.map(z => z.risk_score || z.score || 0);

  const maxLen = Math.max(z1Data.length, z2Data.length, z3Data.length);
  const sequenceLabels = Array.from({ length: maxLen }, (_, i) => `${i + 1}`);

  const combinedLineData = {
    labels: sequenceLabels,
    datasets: [
      {
        label: 'Zone 1',
        data: z1Data,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 2,
        fill: false // Line only for cleaner comparison
      },
      {
        label: 'Zone 2',
        data: z2Data,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 2,
        fill: false
      },
      {
        label: 'Zone 3',
        data: z3Data,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 2,
        fill: false
      }
    ]
  };

  // Single Zone Data (Line Charts, strictly time based)
  const getSingleZoneChartData = (zoneData, label, color, bg) => {
    return {
      labels: zoneData.map(l => l.timestamp ? new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"),
      datasets: [{
        label: label,
        data: zoneData.map(l => l.risk_score || l.score || 0),
        borderColor: color,
        backgroundColor: bg,
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    }
  };


  if (!activeMine) return <div className="p-10 text-center text-gray-400">Select a mine first.</div>;
  if (loading) return <div className="p-10 text-center text-primary-500">Loading Trends...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiLayers className="text-primary-500" /> Multi-Zone Risk Analysis
          </h1>
          <p className="text-gray-400 text-sm">Real-time geotechnical trends across different mine sectors.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadReport} className="text-xs flex items-center gap-2 px-3 py-2 bg-primary-900/20 hover:bg-primary-900/40 text-primary-400 hover:text-white border border-primary-900/50 rounded-lg transition-colors">
            <FiDownload /> Download Report
          </button>
          <button onClick={clearHistory} className="text-xs flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-red-900/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors">
            <FiTrash2 /> Reset Data
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-dark-700 rounded-xl">
          <p className="text-gray-500">No predictions recorded yet. Go to "AI Prediction" tab to simulate risks.</p>
        </div>
      ) : (
        <>
          {/* Top Row: 3 Small Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-sky-400">Zone 1</span>
                <span className="text-xs text-gray-500">{zone1.length} Records</span>
              </div>
              <div className="h-24">
                {zone1.length > 0 ? <Line data={createChartData(zone1, 'Zone 1', '#0ea5e9', 'rgba(14, 165, 233, 0.1)')} options={chartOptionsSmall} />
                  : <div className="h-full flex items-center justify-center text-xs text-dark-700 font-mono">NO DATA</div>}
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-purple-400">Zone 2</span>
                <span className="text-xs text-gray-500">{zone2.length} Records</span>
              </div>
              <div className="h-24">
                {zone2.length > 0 ? <Line data={createChartData(zone2, 'Zone 2', '#a855f7', 'rgba(168, 85, 247, 0.1)')} options={chartOptionsSmall} />
                  : <div className="h-full flex items-center justify-center text-xs text-dark-700 font-mono">NO DATA</div>}
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-800 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-green-400">Zone 3</span>
                <span className="text-xs text-gray-500">{zone3.length} Records</span>
              </div>
              <div className="h-24">
                {zone3.length > 0 ? <Line data={createChartData(zone3, 'Zone 3', '#22c55e', 'rgba(34, 197, 94, 0.1)')} options={chartOptionsSmall} />
                  : <div className="h-full flex items-center justify-center text-xs text-dark-700 font-mono">NO DATA</div>}
              </div>
            </div>
          </div>

          {/* Main Large Graph */}
          <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2"><FiTrendingUp /> Combined Zone Analysis</h3>

              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="bg-dark-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-dark-700 outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="Combined">Combined (Line View)</option>
                <option value="Zone 1">Zone 1 (Line)</option>
                <option value="Zone 2">Zone 2 (Line)</option>
                <option value="Zone 3">Zone 3 (Line)</option>
              </select>
            </div>

            <div className="h-[350px]">
              {selectedView === "Combined" ? (
                <Line data={combinedLineData} options={chartOptionsLarge} />
              ) : selectedView === "Zone 1" ? (
                <Line data={getSingleZoneChartData(zone1, 'Zone 1', '#0ea5e9', 'rgba(14, 165, 233, 0.5)')} options={chartOptionsLarge} />
              ) : selectedView === "Zone 2" ? (
                <Line data={getSingleZoneChartData(zone2, 'Zone 2', '#a855f7', 'rgba(168, 85, 247, 0.5)')} options={chartOptionsLarge} />
              ) : (
                <Line data={getSingleZoneChartData(zone3, 'Zone 3', '#22c55e', 'rgba(34, 197, 94, 0.5)')} options={chartOptionsLarge} />
              )}
            </div>
          </div>

          {/* History Table (Optional/Compacted) */}
          <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
            <div className="bg-dark-950 px-6 py-3 border-b border-dark-800">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Recent Alerts</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-dark-800">
                  {logs.slice().reverse().map((log, i) => (
                    <tr key={i} className="text-sm hover:bg-dark-800/50">
                      <td className="p-4 text-gray-400 font-mono text-xs">{log.timestamp ? new Date(log.timestamp).toLocaleString() : log.time}</td>
                      <td className="p-4 font-bold text-white">{log.zone || "Zone 1"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${log.risk_level === "High" ? "text-red-400 border-red-900 bg-red-900/10" :
                          log.risk_level === "Medium" ? "text-amber-400 border-amber-900 bg-amber-900/10" :
                            "text-emerald-400 border-emerald-900 bg-emerald-900/10"
                          }`}>
                          {log.risk_level} Risk ({log.risk_score}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
