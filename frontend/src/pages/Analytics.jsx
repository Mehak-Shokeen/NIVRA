import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Analytics.css";

const STATUS_LABELS = {
  NEW: "New",
  VERIFIED: "Verified",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

const CATEGORY_ICONS = {
  POTHOLE: "🕳️",
  STREETLIGHT: "💡",
  GARBAGE: "🗑️",
  SIDEWALK: "🚶",
  TRAFFIC_SIGNAL: "🚦",
  WATER_LEAKAGE: "💧",
  ILLEGAL_DUMPING: "♻️",
  PUBLIC_PROPERTY: "🏗️",
};

function prettyLabel(value) {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/analytics");
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load analytics right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const maxCategory = useMemo(
    () =>
      Math.max(
        ...(data?.byCategory || []).map((item) => item.value),
        1
      ),
    [data]
  );

  const maxStatus = useMemo(
    () =>
      Math.max(
        ...(data?.byStatus || []).map((item) => item.value),
        1
      ),
    [data]
  );

  const maxPriority = useMemo(
    () =>
      Math.max(
        ...(data?.byPriority || []).map((item) => item.value),
        1
      ),
    [data]
  );

  const maxActivity = useMemo(
    () =>
      Math.max(
        ...(data?.activityTrend || []).map((item) => item.value),
        1
      ),
    [data]
  );

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner" />
          <h2>Loading civic intelligence</h2>
          <p>Crunching the latest issue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <div>⚠️</div>
          <h2>Analytics unavailable</h2>
          <p>{error}</p>
          <button onClick={loadAnalytics}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <div className="analytics-eyebrow">CIVIC INTELLIGENCE</div>
          <h1>Analytics</h1>
          <p>
            Understand issue patterns, resolution performance, and
            where your community needs attention.
          </p>
        </div>

        <button
          className="analytics-refresh"
          onClick={loadAnalytics}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="analytics-stat-grid">
        <div className="analytics-stat-card">
          <span className="analytics-stat-icon">📋</span>
          <div>
            <span>Total issues</span>
            <strong>{data.totalIssues}</strong>
          </div>
        </div>

        <div className="analytics-stat-card warning">
          <span className="analytics-stat-icon">🔎</span>
          <div>
            <span>Awaiting verification</span>
            <strong>{data.newIssues}</strong>
          </div>
        </div>

        <div className="analytics-stat-card active">
          <span className="analytics-stat-icon">⚙️</span>
          <div>
            <span>Active issues</span>
            <strong>{data.activeIssues}</strong>
          </div>
        </div>

        <div className="analytics-stat-card success">
          <span className="analytics-stat-icon">✓</span>
          <div>
            <span>Resolved</span>
            <strong>{data.resolvedIssues}</strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <span className="analytics-stat-icon">📈</span>
          <div>
            <span>Resolution rate</span>
            <strong>{data.resolutionRate}%</strong>
          </div>
        </div>
      </div>

      <div className="analytics-grid two-column">
        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <span className="analytics-card-kicker">DISTRIBUTION</span>
              <h2>Issues by category</h2>
            </div>
            <span className="analytics-card-icon">🗂️</span>
          </div>

          <div className="bar-list">
            {(data.byCategory || []).map((item) => (
              <div className="bar-row" key={item.label}>
                <div className="bar-label">
                  <span>
                    {CATEGORY_ICONS[item.label] || "📍"}{" "}
                    {prettyLabel(item.label)}
                  </span>
                  <strong>{item.value}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(item.value / maxCategory) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <span className="analytics-card-kicker">LIFECYCLE</span>
              <h2>Issues by status</h2>
            </div>
            <span className="analytics-card-icon">🔄</span>
          </div>

          <div className="bar-list">
            {(data.byStatus || []).map((item) => (
              <div className="bar-row" key={item.label}>
                <div className="bar-label">
                  <span>{STATUS_LABELS[item.label] || prettyLabel(item.label)}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className={`bar-fill status-fill status-${String(
                      item.label
                    ).toLowerCase()}`}
                    style={{
                      width: `${(item.value / maxStatus) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="analytics-grid three-column">
        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <span className="analytics-card-kicker">URGENCY</span>
              <h2>Priority mix</h2>
            </div>
            <span className="analytics-card-icon">🚦</span>
          </div>

          <div className="priority-list">
            {(data.byPriority || []).map((item) => (
              <div className="priority-row" key={item.label}>
                <div>
                  <span className={`priority-dot priority-${String(item.label).toLowerCase()}`} />
                  {prettyLabel(item.label)}
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <span className="analytics-card-kicker">PERFORMANCE</span>
              <h2>Resolution time</h2>
            </div>
            <span className="analytics-card-icon">⏱️</span>
          </div>

          <div className="resolution-highlight">
            <strong>
              {data.averageResolutionHours == null
                ? "—"
                : `${data.averageResolutionHours}h`}
            </strong>
            <span>Average time from first recorded status change to resolution</span>
          </div>

          <div className="mini-metric">
            <span>Unassigned active issues</span>
            <strong>{data.unassignedIssues}</strong>
          </div>
        </section>

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <span className="analytics-card-kicker">RECENT ACTIVITY</span>
              <h2>Status activity</h2>
            </div>
            <span className="analytics-card-icon">📅</span>
          </div>

          <div className="activity-chart">
            {(data.activityTrend || []).map((item) => (
              <div className="activity-column" key={item.label}>
                <div className="activity-value">{item.value}</div>
                <div className="activity-track">
                  <div
                    className="activity-bar"
                    style={{
                      height: `${Math.max(
                        8,
                        (item.value / maxActivity) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="analytics-grid two-column">
        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <span className="analytics-card-kicker">OPERATIONS</span>
              <h2>Worker workload</h2>
              <p>Assigned, active, and resolved cases by worker.</p>
            </div>
            <span className="analytics-card-icon">👷</span>
          </div>

          {data.workerWorkload?.length ? (
            <div className="worker-table-wrap">
              <table className="worker-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Assigned</th>
                    <th>Active</th>
                    <th>Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {data.workerWorkload.map((worker) => (
                    <tr key={worker.id}>
                      <td>
                        <div className="worker-name">
                          <span>
                            {worker.name?.charAt(0)?.toUpperCase() || "W"}
                          </span>
                          {worker.name}
                        </div>
                      </td>
                      <td>{worker.totalAssigned}</td>
                      <td>{worker.active}</td>
                      <td className="resolved-number">{worker.resolved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="analytics-empty">No worker assignment data yet.</div>
          )}
        </section>

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <span className="analytics-card-kicker">GEOSPATIAL</span>
              <h2>Issue hotspots</h2>
              <p>Clusters containing two or more reported issues.</p>
            </div>
            <span className="analytics-card-icon">📍</span>
          </div>

          {data.hotspots?.length ? (
            <div className="hotspot-list">
              {data.hotspots.map((hotspot, index) => (
                <div className="hotspot-row" key={`${hotspot.latitude}-${hotspot.longitude}`}>
                  <span className="hotspot-rank">{index + 1}</span>
                  <div>
                    <strong>
                      {hotspot.latitude.toFixed(2)},{" "}
                      {hotspot.longitude.toFixed(2)}
                    </strong>
                    <span>Approximate location cluster</span>
                  </div>
                  <b>{hotspot.issueCount}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-empty">
              Not enough clustered location data yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Analytics;
