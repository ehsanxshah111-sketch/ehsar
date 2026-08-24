import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/activity-logs")
      .then(({ data }) => setLogs(data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load activity log"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading activity log…</p>;

  return (
    <div>
      <h1 className="text-2xl font-display uppercase tracking-widest2 mb-2">Activity Log</h1>
      <p className="text-sm text-gray-500 mb-6">
        A record of recent admin actions - logins, product/banner changes, order and payment updates.
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {logs.length === 0 ? (
        <p className="text-gray-500">No activity recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log._id} className="admin-card p-4 flex justify-between items-start gap-4">
              <div>
                <p className="text-sm font-medium">{log.action}</p>
                {log.details && <p className="text-xs text-gray-500 mt-1">{log.details}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{log.adminUsername}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
