import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AuthorityDashboard.css";

const STATUS_ORDER = ["NEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

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

function prettyCategory(category) {
  if (!category) return "Civic issue";
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function prettyStatus(status) {
  return STATUS_LABELS[status] || status || "Unknown";
}

function prettyPriority(priority) {
  if (!priority) return "Normal";
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function formatDate(value) {
  if (!value) return "Recently reported";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently reported";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNextStatus(status) {
  const index = STATUS_ORDER.indexOf(status);
  if (index < 0 || index === STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[index + 1];
}

function AuthorityDashboard() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [issuesResponse, workersResponse] = await Promise.all([
        api.get("/issues", {
          params: {
            page: 0,
            size: 100,
          },
        }),
        api.get("/issues/workers"),
      ]);

      const issueData = issuesResponse.data;
      setIssues(issueData?.content || []);
      setWorkers(Array.isArray(workersResponse.data) ? workersResponse.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load authority dashboard data."
      );
    } finally {
      setLoading(false);
      setWorkersLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedIssue?.assignedWorkerId) {
      setSelectedWorker(String(selectedIssue.assignedWorkerId));
    } else {
      setSelectedWorker("");
    }
  }, [selectedIssue]);

  const categories = useMemo(
    () => [...new Set(issues.map((issue) => issue.category).filter(Boolean))],
    [issues]
  );

  const stats = useMemo(() => {
    const total = issues.length;
    const newCount = issues.filter((i) => i.status === "NEW").length;
    const active = issues.filter((i) =>
      ["VERIFIED", "ASSIGNED", "IN_PROGRESS"].includes(i.status)
    ).length;
    const resolved = issues.filter((i) => i.status === "RESOLVED").length;
    const unassigned = issues.filter((i) => !i.assignedWorkerId && i.status !== "RESOLVED").length;

    return { total, newCount, active, resolved, unassigned };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch =
        !query ||
        String(issue.id || "").includes(query) ||
        (issue.title || "").toLowerCase().includes(query) ||
        (issue.description || "").toLowerCase().includes(query) ||
        prettyCategory(issue.category).toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || issue.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || issue.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "ALL" || issue.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [issues, search, statusFilter, priorityFilter, categoryFilter]);

  const workerName = (workerId) => {
    const worker = workers.find(
      (item) => String(item.id) === String(workerId)
    );
    return worker?.name || (workerId ? `Worker #${workerId}` : "Unassigned");
  };

  const openIssue = (issue) => {
    setSelectedIssue(issue);
  };

  const verifyIssue = async () => {
    if (!selectedIssue || selectedIssue.status !== "NEW") return;

    setSaving(true);
    setError("");

    try {
      const response = await api.patch(`/issues/${selectedIssue.id}/status`, {
        status: "VERIFIED",
      });

      updateIssueInState(response.data);
      setSelectedIssue(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not verify this issue."
      );
    } finally {
      setSaving(false);
    }
  };

  const assignWorker = async () => {
    if (!selectedIssue || !selectedWorker) return;

    setSaving(true);
    setError("");

    try {
      const response = await api.patch(`/issues/${selectedIssue.id}/assign`, {
        workerId: Number(selectedWorker),
      });

      let updated = response.data;

      // Assignment is deliberately followed by the normal lifecycle
      // transition when the issue has already been verified.
      if (updated.status === "VERIFIED") {
        const statusResponse = await api.patch(
          `/issues/${updated.id}/status`,
          { status: "ASSIGNED" }
        );
        updated = statusResponse.data;
      }

      updateIssueInState(updated);
      setSelectedIssue(updated);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not assign this issue."
      );
    } finally {
      setSaving(false);
    }
  };

  const moveToNextStatus = async () => {
    if (!selectedIssue) return;

    const nextStatus = getNextStatus(selectedIssue.status);
    if (!nextStatus || nextStatus === "ASSIGNED") return;

    setSaving(true);
    setError("");

    try {
      const response = await api.patch(
        `/issues/${selectedIssue.id}/status`,
        { status: nextStatus }
      );

      updateIssueInState(response.data);
      setSelectedIssue(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update the issue status."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateIssueInState = (updatedIssue) => {
    setIssues((current) =>
      current.map((issue) =>
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
  };

  return (
    <div className="authority-page">
      <div className="authority-header">
        <div>
          <div className="authority-eyebrow">OPERATIONS CENTER</div>
          <h1>Authority Dashboard</h1>
          <p>
            Review civic reports, verify problems, and coordinate resolution
            across your community.
          </p>
        </div>

        <button
          className="authority-refresh"
          onClick={loadData}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="authority-error">
          <span>⚠</span>
          <span>{error}</span>
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      <div className="authority-stats">
        <div className="authority-stat-card">
          <div className="authority-stat-icon">📋</div>
          <div>
            <span>Total reports</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="authority-stat-card attention">
          <div className="authority-stat-icon">🔎</div>
          <div>
            <span>Awaiting verification</span>
            <strong>{stats.newCount}</strong>
          </div>
        </div>

        <div className="authority-stat-card">
          <div className="authority-stat-icon">⚙️</div>
          <div>
            <span>Active cases</span>
            <strong>{stats.active}</strong>
          </div>
        </div>

        <div className="authority-stat-card success">
          <div className="authority-stat-icon">✓</div>
          <div>
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
          </div>
        </div>

        <div className="authority-stat-card warning">
          <div className="authority-stat-icon">👷</div>
          <div>
            <span>Unassigned</span>
            <strong>{stats.unassigned}</strong>
          </div>
        </div>
      </div>

      <section className="authority-workspace">
        <div className="authority-section-heading">
          <div>
            <h2>Issue management</h2>
            <p>{filteredIssues.length} reports match your current filters</p>
          </div>
        </div>

        <div className="authority-filters">
          <div className="authority-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search issue, category or ID..."
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                ×
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {prettyStatus(status)}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="ALL">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {prettyCategory(category)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="authority-empty">
            <div className="authority-spinner" />
            <h3>Loading civic reports</h3>
            <p>Getting the latest issue queue...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="authority-empty">
            <div className="authority-empty-icon">✓</div>
            <h3>No issues found</h3>
            <p>Try changing the filters or search term.</p>
          </div>
        ) : (
          <div className="authority-table-wrap">
            <table className="authority-table">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned worker</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => openIssue(issue)}
                    className="authority-table-row"
                  >
                    <td>
                      <div className="issue-cell">
                        <div className="issue-cell-icon">
                          {CATEGORY_ICONS[issue.category] || "📍"}
                        </div>
                        <div>
                          <strong>{issue.title || "Untitled issue"}</strong>
                          <span>#{issue.id} · {formatDate(issue.createdAt)}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="category-pill">
                        {prettyCategory(issue.category)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`priority-pill priority-${String(
                          issue.priority || "LOW"
                        ).toLowerCase()}`}
                      >
                        {prettyPriority(issue.priority)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-pill status-${String(
                          issue.status || "NEW"
                        ).toLowerCase()}`}
                      >
                        <i />
                        {prettyStatus(issue.status)}
                      </span>
                    </td>

                    <td>
                      <span className="worker-cell">
                        {issue.assignedWorkerId ? (
                          <>
                            <span className="worker-avatar">
                              {workerName(issue.assignedWorkerId)
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                            {workerName(issue.assignedWorkerId)}
                          </>
                        ) : (
                          <span className="unassigned-label">Unassigned</span>
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        className="view-issue-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openIssue(issue);
                        }}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedIssue && (
        <div
          className="authority-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedIssue(null);
          }}
        >
          <aside className="authority-drawer">
            <div className="drawer-header">
              <div>
                <span className="drawer-label">ISSUE #{selectedIssue.id}</span>
                <h2>{selectedIssue.title || "Civic issue"}</h2>
              </div>

              <button
                className="drawer-close"
                onClick={() => setSelectedIssue(null)}
                aria-label="Close issue details"
              >
                ×
              </button>
            </div>

            <div className="drawer-scroll">
              {selectedIssue.imageUrl && (
                <img
                  className="drawer-image"
                  src={selectedIssue.imageUrl}
                  alt={selectedIssue.title || "Issue"}
                />
              )}

              <div className="drawer-status-row">
                <span
                  className={`status-pill status-${String(
                    selectedIssue.status || "NEW"
                  ).toLowerCase()}`}
                >
                  <i />
                  {prettyStatus(selectedIssue.status)}
                </span>

                <span
                  className={`priority-pill priority-${String(
                    selectedIssue.priority || "LOW"
                  ).toLowerCase()}`}
                >
                  {prettyPriority(selectedIssue.priority)} priority
                </span>
              </div>

              <div className="drawer-section">
                <h3>Description</h3>
                <p>
                  {selectedIssue.description || "No description provided."}
                </p>
              </div>

              <div className="drawer-section">
                <h3>Location</h3>
                <div className="location-box">
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
              </div>

              <div className="drawer-section">
                <h3>Progress</h3>
                <div className="drawer-progress">
                  {STATUS_ORDER.map((status, index) => {
                    const currentIndex = STATUS_ORDER.indexOf(
                      selectedIssue.status
                    );

                    return (
                      <div
                        key={status}
                        className={`progress-step ${
                          index <= currentIndex ? "complete" : ""
                        } ${index === currentIndex ? "current" : ""}`}
                      >
                        <span>{index <= currentIndex ? "✓" : index + 1}</span>
                        <label>{prettyStatus(status)}</label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="drawer-section assignment-section">
                <div className="assignment-heading">
                  <div>
                    <h3>Worker assignment</h3>
                    <p>
                      {selectedIssue.assignedWorkerId
                        ? `Currently assigned to ${workerName(
                            selectedIssue.assignedWorkerId
                          )}`
                        : "No worker has been assigned yet."}
                    </p>
                  </div>
                  <span className="assignment-icon">👷</span>
                </div>

                <select
                  value={selectedWorker}
                  onChange={(event) => setSelectedWorker(event.target.value)}
                  disabled={
                    workersLoading ||
                    saving ||
                    !["VERIFIED", "ASSIGNED", "IN_PROGRESS"].includes(
                      selectedIssue.status
                    )
                  }
                >
                  <option value="">
                    {workersLoading ? "Loading workers..." : "Select a worker"}
                  </option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} · {worker.email}
                    </option>
                  ))}
                </select>

                <button
                  className="assign-button"
                  onClick={assignWorker}
                  disabled={
                    saving ||
                    !selectedWorker ||
                    selectedIssue.status === "NEW" ||
                    selectedIssue.status === "RESOLVED"
                  }
                >
                  {saving ? "Saving..." : "Assign worker"}
                </button>
              </div>
            </div>

            <div className="drawer-footer">
              {selectedIssue.status === "NEW" && (
                <button
                  className="drawer-primary"
                  onClick={verifyIssue}
                  disabled={saving}
                >
                  {saving ? "Verifying..." : "✓ Verify issue"}
                </button>
              )}

              {selectedIssue.status === "VERIFIED" && (
                <div className="drawer-hint">
                  Select a worker above to move this issue into assignment.
                </div>
              )}

              {selectedIssue.status === "ASSIGNED" && (
                <button
                  className="drawer-primary"
                  onClick={moveToNextStatus}
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Move to In Progress →"}
                </button>
              )}

              {selectedIssue.status === "IN_PROGRESS" && (
                <button
                  className="drawer-primary"
                  onClick={moveToNextStatus}
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Mark as Resolved ✓"}
                </button>
              )}

              {selectedIssue.status === "RESOLVED" && (
                <div className="resolved-message">
                  ✓ This issue has been resolved.
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default AuthorityDashboard;
