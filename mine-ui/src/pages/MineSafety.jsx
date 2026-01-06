import { useState, useEffect } from "react";
import { FiUsers, FiAlertTriangle, FiClock } from "react-icons/fi";

export default function MineSafety({ mine, workers, onAddWorker, onEndShift }) {
    const [newWorker, setNewWorker] = useState({ name: "", role: "Excavation", startTime: "" });
    const [showAddForm, setShowAddForm] = useState(false);

    // Timer for updating UI relative times
    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    const addWorker = (e) => {
        e.preventDefault();
        if (!newWorker.name || !newWorker.startTime) return;

        // Ensure start time isn't in future
        if (new Date(newWorker.startTime) > new Date()) {
            alert("Start time cannot be in the future!");
            return;
        }

        const worker = {
            id: Date.now(),
            name: newWorker.name,
            role: newWorker.role,
            startTime: newWorker.startTime
        };

        onAddWorker(worker);

        setNewWorker({ name: "", role: "Excavation", startTime: "" });
        setShowAddForm(false);
    };

    const endShift = (id) => {
        if (window.confirm("End this worker's shift? This will remove them from the active monitoring list.")) {
            onEndShift(id);
        }
    };

    const getStatus = (startTime) => {
        const start = new Date(startTime);
        const now = new Date();
        const hours = (now - start) / (1000 * 60 * 60);

        if (hours > 10) return { level: "Critical", color: "text-danger", bg: "bg-danger/10 border-danger/30", label: "Fatigue Alert" };
        if (hours > 8) return { level: "Warning", color: "text-warning", bg: "bg-warning/10 border-warning/30", label: "Overtime" };
        return { level: "Safe", color: "text-success", bg: "bg-success/10 border-success/30", label: "Active" };
    };

    const formatDuration = (startTime) => {
        const start = new Date(startTime);
        const now = new Date();
        const diff = now - start;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${h}h ${m}m`;
    };

    const stats = {
        total: workers.length,
        critical: workers.filter(w => getStatus(w.startTime).level === "Critical").length,
        warning: workers.filter(w => getStatus(w.startTime).level === "Warning").length
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Statistics Logic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Workers</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
                    </div>
                    <div className="h-10 w-10 bg-primary-900/30 rounded-full flex items-center justify-center text-primary-400"><FiUsers size={20} /></div>
                </div>
                <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Fatigue Alerts</p>
                        <h3 className="text-2xl font-bold text-danger mt-1">{stats.critical}</h3>
                    </div>
                    <div className="h-10 w-10 bg-danger/10 rounded-full flex items-center justify-center text-danger"><FiAlertTriangle size={20} /></div>
                </div>
                <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 shadow-sm flex items-center justify-between cursor-pointer hover:bg-dark-800 transition-colors" onClick={() => setShowAddForm(!showAddForm)}>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Management</p>
                        <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                            {showAddForm ? "Cancel Adding" : "Add Worker"}
                        </h3>
                    </div>
                    <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center text-success">
                        {showAddForm ? "x" : "+"}
                    </div>
                </div>
            </div>

            {/* Add Worker Form */}
            {showAddForm && (
                <div className="bg-dark-900 p-6 rounded-xl border border-dark-800 shadow-lg animate-fade-in">
                    <h3 className="text-lg font-bold text-white mb-4">Register New Worker Shift</h3>
                    <form onSubmit={addWorker} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Worker Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-dark-950 border border-dark-700 rounded-lg p-2.5 text-white focus:border-primary-500 focus:outline-none"
                                placeholder="Sumit Shaw"
                                value={newWorker.name}
                                onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Department</label>
                            <select
                                className="w-full bg-dark-950 border border-dark-700 rounded-lg p-2.5 text-white focus:border-primary-500 focus:outline-none"
                                value={newWorker.role}
                                onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                            >
                                <option>Excavation</option>
                                <option>Transport</option>
                                <option>Maintenance</option>
                                <option>Engineering</option>
                                <option>Safety</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Shift Start Time</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full bg-dark-950 border border-dark-700 rounded-lg p-2.5 text-white focus:border-primary-500 focus:outline-none"
                                value={newWorker.startTime}
                                onChange={(e) => setNewWorker({ ...newWorker, startTime: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-4 rounded-lg transition-colors shadow-lg">
                            Start Shift
                        </button>
                    </form>
                </div>
            )}

            {/* Worker List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map((worker) => {
                    const status = getStatus(worker.startTime);
                    return (
                        <div key={worker.id} className={`bg-dark-900 border ${status.level === "Critical" ? "border-danger/50 animate-pulse-slow" : "border-dark-800"} p-5 rounded-xl shadow-sm relative overflow-hidden group`}>
                            {status.level === "Critical" && (
                                <div className="absolute top-0 right-0 bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10">FATIGUE WARNING</div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-dark-800 flex items-center justify-center text-gray-400 border border-dark-700 font-bold">
                                        {worker.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{worker.name}</h4>
                                        <p className="text-xs text-gray-500">{worker.role}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold border ${status.bg} ${status.color}`}>
                                    {status.label}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 flex items-center gap-2"><FiClock /> Shift Duration</span>
                                    <span className="font-mono font-bold text-white text-lg">{formatDuration(worker.startTime)}</span>
                                </div>

                                {/* Progress Bar for Shift (assuming 10h is max safe-ish limit visualization) */}
                                <div className="w-full bg-dark-950 h-2 rounded-full overflow-hidden border border-dark-800">
                                    <div
                                        className={`h-full ${status.level === 'Critical' ? 'bg-danger' : status.level === 'Warning' ? 'bg-warning' : 'bg-success'}`}
                                        style={{ width: `${Math.min(((new Date() - new Date(worker.startTime)) / (1000 * 60 * 60)) / 10 * 100, 100)}%` }}
                                    ></div>
                                </div>

                                <div className="pt-3 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Started: {new Date(worker.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <button
                                        onClick={() => endShift(worker.id)}
                                        className="text-xs text-red-400 hover:text-red-300 font-medium border border-red-900/30 hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                                    >
                                        End Shift
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
