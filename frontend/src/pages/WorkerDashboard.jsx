import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./WorkerDashboard.css";

const STATUS_ORDER = ["ASSIGNED", "IN_PROGRESS", "RESOLVED"];

const STATUS_LABELS = {
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

function prettyCategory(category) {
  if (!category) return "Civic issue";

  return category
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function prettyPriority(priority) {
  if (!priority) return "Normal";
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function formatDate(value) {
  if (!value) return "Recently assigned";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently assigned";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function WorkerDashboard() {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadIssues = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/issues/assigned");
      setIssues(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your assigned issues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const stats = useMemo(() => ({
    total: issues.length,
    assigned: issues.filter(i => i.status === "ASSIGNED").length,
    inProgress: issues.filter(i => i.status === "IN_PROGRESS").length,
    resolved: issues.filter(i => i.status === "RESOLVED").length,
  }), [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const statusMatch =
        statusFilter === "ALL" || issue.status === statusFilter;

      const priorityMatch =
        priorityFilter === "ALL" || issue.priority === priorityFilter;

      return statusMatch && priorityMatch;
    });
  }, [issues, statusFilter, priorityFilter]);

  const moveToNextStatus = async () => {
    if (!selectedIssue) return;

    const currentIndex = STATUS_ORDER.indexOf(selectedIssue.status);

    if (currentIndex < 0 || currentIndex === STATUS_ORDER.length - 1) {
      return;
    }

    const nextStatus = STATUS_ORDER[currentIndex + 1];

    setSaving(true);
    setError("");

    try {
      const response = await api.patch(
        `/issues/${selectedIssue.id}/status`,
        { status: nextStatus }
      );

      setIssues(current =>
        current.map(issue =>
          issue.id === response.data.id ? response.data : issue
        )
      );

      setSelectedIssue(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not update this issue."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="worker-page">
      <div className="worker-header">
        <div>
          <div className="worker-eyebrow">FIELD OPERATIONS</div>
          <h1>My Assigned Issues</h1>
          <p>
            Manage the civic issues assigned to you and keep their progress
            up to date.
          </p>
        </div>

        <button
          className="worker-refresh"
          onClick={loadIssues}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="worker-error">
          <span>⚠</span>
          <span>{error}</span>
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      <div className="worker-stats">
        <div className="worker-stat">
          <div className="worker-stat-icon">📋</div>
          <div>
            <span>Total assigned</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="worker-stat">
          <div className="worker-stat-icon assigned">👷</div>
          <div>
            <span>Assigned</span>
            <strong>{stats.assigned}</strong>
          </div>
        </div>

        <div className="worker-stat">
          <div className="worker-stat-icon progress">⚙️</div>
          <div>
            <span>In progress</span>
            <strong>{stats.inProgress}</strong>
          </div>
        </div>

        <div className="worker-stat">
          <div className="worker-stat-icon resolved">✓</div>
          <div>
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
          </div>
        </div>
      </div>

      <section className="worker-workspace">
        <div className="worker-section-heading">
          <div>
            <h2>Work queue</h2>
            <p>{filteredIssues.length} issues shown</p>
          </div>

          <div className="worker-filters">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="worker-empty">
            <div className="worker-spinner" />
            <h3>Loading your work queue</h3>
            <p>Getting the latest assignments...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="worker-empty">
            <div className="worker-empty-icon">✓</div>
            <h3>No assigned issues</h3>
            <p>
              {issues.length === 0
                ? "New assignments from an authority will appear here."
                : "Try changing the filters."}
            </p>
          </div>
        ) : (
          <div className="worker-issue-grid">
            {filteredIssues.map(issue => (
              <button
                key={issue.id}
                className={`worker-issue-card ${
                  issue.status === "RESOLVED" ? "resolved" : ""
                }`}
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="worker-card-image-wrap">
                  {issue.imageUrl ? (
                    <img
                      src={issue.imageUrl}
                      alt={issue.title || "Civic issue"}
                      className="worker-card-image"
                    />
                  ) : (
                    <div className="worker-card-placeholder">
                      {CATEGORY_ICONS[issue.category] || "📍"}
                    </div>
                  )}

                  <span
                    className={`status-pill status-${String(
                      issue.status || "ASSIGNED"
                    ).toLowerCase()}`}
                  >
                    <i />
                    {STATUS_LABELS[issue.status] || issue.status}
                  </span>
                </div>

                <div className="worker-card-body">
                  <div className="worker-card-category">
                    {CATEGORY_ICONS[issue.category] || "📍"}{" "}
                    {prettyCategory(issue.category)}
                  </div>

                  <h3>{issue.title || "Untitled issue"}</h3>

                  <p>
                    {issue.description || "No description provided."}
                  </p>

                  <div className="worker-card-footer">
                    <span>
                      #{issue.id} · {formatDate(issue.createdAt)}
                    </span>

                    <span
                      className={`priority-pill priority-${String(
                        issue.priority || "LOW"
                      ).toLowerCase()}`}
                    >
                      {prettyPriority(issue.priority)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedIssue && (
        <div
          className="worker-modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setSelectedIssue(null);
            }
          }}
        >
          <aside className="worker-drawer">
            <div className="worker-drawer-header">
              <div>
                <span className="worker-drawer-label">
                  ASSIGNED ISSUE #{selectedIssue.id}
                </span>
                <h2>{selectedIssue.title || "Civic issue"}</h2>
              </div>

              <button
                className="worker-close"
                onClick={() => setSelectedIssue(null)}
                aria-label="Close issue"
              >
                ×
              </button>
            </div>

            <div className="worker-drawer-scroll">
              {selectedIssue.imageUrl && (
                <img
                  className="worker-drawer-image"
                  src={selectedIssue.imageUrl}
                  alt={selectedIssue.title || "Issue"}
                />
              )}

              <div className="worker-status-row">
                <span
                  className={`status-pill status-${String(
                    selectedIssue.status || "ASSIGNED"
                  ).toLowerCase()}`}
                >
                  <i />
                  {STATUS_LABELS[selectedIssue.status] || selectedIssue.status}
                </span>

                <span
                  className={`priority-pill priority-${String(
                    selectedIssue.priority || "LOW"
                  ).toLowerCase()}`}
                >
                  {prettyPriority(selectedIssue.priority)} priority
                </span>
              </div>

              <section className="worker-detail-section">
                <h3>Issue details</h3>
                <p>
                  {selectedIssue.description || "No description provided."}
                </p>
              </section>

              <section className="worker-detail-section">
                <h3>Location</h3>
                <div className="worker-location-box">
                  <span>📍</span>
                  <div>
                    <strong>Reported coordinates</strong>
                    <small>
                      {selectedIssue.latitude != null
                        ? `${Number(selectedIssue.latitude).toFixed(5)}, ${Number(
                            selectedIssue.longitude
                          ).toFixed(5)}`
                        : "Location unavailable"}
                    </small>
                  </div>
                </div>
              </section>

              <section className="worker-detail-section">
                <h3>Work progress</h3>

                <div className="worker-progress">
                  {STATUS_ORDER.map((status, index) => {
                    const currentIndex = STATUS_ORDER.indexOf(
                      selectedIssue.status
                    );

                    return (
                      <div
                        key={status}
                        className={`worker-progress-step ${
                          index <= currentIndex ? "complete" : ""
                        } ${
                          index === currentIndex ? "current" : ""
                        }`}
                      >
                        <span>
                          {index <= currentIndex ? "✓" : index + 1}
                        </span>
                        <label>{STATUS_LABELS[status]}</label>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="worker-drawer-footer">
              {selectedIssue.status === "ASSIGNED" && (
                <button
                  className="worker-primary"
                  onClick={moveToNextStatus}
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Start work →"}
                </button>
              )}

              {selectedIssue.status === "IN_PROGRESS" && (
                <button
                  className="worker-primary"
                  onClick={moveToNextStatus}
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Mark as resolved ✓"}
                </button>
              )}

              {selectedIssue.status === "RESOLVED" && (
                <div className="worker-resolved">
                  ✓ This issue has been marked as resolved.
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default WorkerDashboard;
