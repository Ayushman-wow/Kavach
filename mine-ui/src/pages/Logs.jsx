import { useState, useEffect } from "react";
import axios from "axios";
import { FiFileText, FiRefreshCw, FiTrash2, FiXCircle } from "react-icons/fi";

const API_URL = "http://localhost:8000";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch logs from Backend
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/predictions/history`);
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    try {
      await axios.delete(`${API_URL}/predictions/${id}`);
      setLogs(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      console.error("Failed to delete log:", err);
    }
  };

  const clearAllLogs = async () => {
    if (!window.confirm("WARNING: This will delete ALL history logs. Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/predictions/clear`);
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-primary-500 gap-3">
        <FiRefreshCw className="animate-spin text-2xl" /> Loading History...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <FiFileText className="text-6xl text-dark-800" />
        <h2 className="text-2xl font-bold text-gray-500">No Logs Recorded</h2>
        <p className="text-gray-600">Run predictions in the dashboard to generate activity logs.</p>
        <button onClick={fetchLogs} className="text-primary-400 hover:text-primary-300">Refresh</button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">System Activity Logs</h1>
          <span className="bg-dark-800 text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Total: {logs.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={clearAllLogs} className="flex items-center gap-2 px-3 py-2 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors text-sm font-bold">
            <FiXCircle /> Clear History
          </button>
          <button onClick={fetchLogs} className="p-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors text-white">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-dark-800 bg-dark-900 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-dark-950 text-xs uppercase tracking-wider text-gray-400 border-b border-dark-800">
            <tr>
              <th className="p-4 font-semibold">Mine Location</th>
              <th className="p-4 font-semibold">Risk Assessment</th>
              <th className="p-4 font-semibold">Timestamp</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800 text-sm">
            {logs.map((l) => {
              const risk = l.risk_level || l.risk || "Unknown";
              const time = l.timestamp ? new Date(l.timestamp).toLocaleString() : (l.time || "Unknown Time");
              const mineName = l.mine_name || l.mine || "Unknown Mine";

              return (
                <tr key={l._id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="p-4 text-white font-medium">{mineName}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                      ${risk === "High" ? "bg-danger/10 text-danger border border-danger/20" :
                        risk === "Medium" ? "bg-warning/10 text-warning border border-warning/20" :
                          "bg-success/10 text-success border border-success/20"}`
                    }>
                      {risk}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({l.risk_score || l.score || 0}%)
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 font-mono">{time}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteLog(l._id)}
                      className="text-gray-500 hover:text-danger transition-colors p-1"
                      title="Delete Entry"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

