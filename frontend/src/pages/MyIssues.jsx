import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./MyIssues.css";

const STATUS_META = {
  NEW: { label: "New", className: "status-new", description: "Your report has been received." },
  VERIFIED: { label: "Verified", className: "status-verified", description: "The issue has been verified." },
  ASSIGNED: { label: "Assigned", className: "status-assigned", description: "A worker has been assigned." },
  IN_PROGRESS: { label: "In Progress", className: "status-progress", description: "Work is currently underway." },
  RESOLVED: { label: "Resolved", className: "status-resolved", description: "The issue has been resolved." },
};

const STATUS_ORDER = Object.keys(STATUS_META);

function formatStatus(status) {
  return STATUS_META[status]?.label || status?.replaceAll("_", " ") || "Unknown";
}

function formatCategory(category) {
  if (!category) return "Uncategorized";
  return category.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPriority(priority) {
  if (!priority) return "Normal";
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function IssueCard({ issue, onOpen }) {
  const status = STATUS_META[issue.status] || {
    label: formatStatus(issue.status),
    className: "status-new",
  };

  return (
    <article className="my-issue-card">
      <div className="my-issue-image">
        {issue.imageUrl ? (
          <img src={issue.imageUrl} alt={issue.title || "Reported civic issue"} />
        ) : (
          <div className="my-issue-image-placeholder"><span>📍</span></div>
        )}

        <span className={`issue-status-badge ${status.className}`}>
          <span className="status-dot" />
          {status.label}
        </span>
      </div>

      <div className="my-issue-card-body">
        <div className="my-issue-card-top">
          <span className="issue-category">{formatCategory(issue.category)}</span>
          <span className={`issue-priority priority-${(issue.priority || "MEDIUM").toLowerCase()}`}>
            {formatPriority(issue.priority)}
          </span>
        </div>

        <h3>{issue.title || "Untitled issue"}</h3>

        <p className="my-issue-description">
          {issue.description || "No description was provided."}
        </p>

        <div className="my-issue-location">
          <span>📍</span>
          <span>
            {issue.latitude != null && issue.longitude != null
              ? `${Number(issue.latitude).toFixed(4)}, ${Number(issue.longitude).toFixed(4)}`
              : "Location unavailable"}
          </span>
        </div>

        <button type="button" className="view-issue-button" onClick={() => onOpen(issue)}>
          View Details <span>→</span>
        </button>
      </div>
    </article>
  );
}

function IssueDetailsModal({ issue, onClose }) {
  if (!issue) return null;

  const status = STATUS_META[issue.status] || {
    label: formatStatus(issue.status),
    className: "status-new",
    description: "",
  };

  const currentIndex = STATUS_ORDER.indexOf(issue.status);

  return (
    <div className="issue-modal-backdrop" onClick={onClose}>
      <div className="issue-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="issue-modal-close" onClick={onClose} aria-label="Close issue details">
          ×
        </button>

        {issue.imageUrl && (
          <div className="issue-modal-image">
            <img src={issue.imageUrl} alt={issue.title || "Issue"} />
          </div>
        )}

        <div className="issue-modal-content">
          <div className="issue-modal-badges">
            <span className={`issue-status-badge ${status.className}`}>
              <span className="status-dot" />
              {status.label}
            </span>
            <span className="issue-category">{formatCategory(issue.category)}</span>
          </div>

          <h2>{issue.title || "Untitled issue"}</h2>

          <p className="issue-modal-description">
            {issue.description || "No description was provided."}
          </p>

          <div className="issue-detail-grid">
            <div><span>Priority</span><strong>{formatPriority(issue.priority)}</strong></div>
            <div><span>Issue ID</span><strong>#{issue.id}</strong></div>
            <div><span>Latitude</span><strong>{issue.latitude != null ? Number(issue.latitude).toFixed(6) : "—"}</strong></div>
            <div><span>Longitude</span><strong>{issue.longitude != null ? Number(issue.longitude).toFixed(6) : "—"}</strong></div>
          </div>

          <div className="issue-progress">
            <div className="issue-progress-heading">
              <div>
                <span>Current status</span>
                <strong>{status.label}</strong>
              </div>
              <span className="issue-progress-description">{status.description}</span>
            </div>

            <div className="progress-track">
              {STATUS_ORDER.map((statusKey, index) => (
                <div
                  key={statusKey}
                  className={`progress-step ${index <= currentIndex ? "completed" : ""} ${index === currentIndex ? "current" : ""}`}
                >
                  <span className="progress-dot">{index < currentIndex ? "✓" : ""}</span>
                  <span>{STATUS_META[statusKey].label}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="modal-done-button" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default function MyIssues() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    let mounted = true;

    const fetchMyIssues = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/issues/my");
        if (mounted) setIssues(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
            "Unable to load your reported issues. Please try again."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMyIssues();
    return () => { mounted = false; };
  }, []);

  const filteredIssues = useMemo(() => {
    if (activeFilter === "ALL") return issues;
    if (activeFilter === "ACTIVE") return issues.filter((issue) => issue.status !== "RESOLVED");
    return issues.filter((issue) => issue.status === "RESOLVED");
  }, [issues, activeFilter]);

  const activeCount = issues.filter((issue) => issue.status !== "RESOLVED").length;
  const resolvedCount = issues.filter((issue) => issue.status === "RESOLVED").length;

  return (
    <div className="my-issues-page">
      <div className="my-issues-header">
        <div>
          <button type="button" className="back-to-dashboard" onClick={() => navigate("/dashboard")}>
            ← Back to Map
          </button>
          <div className="my-issues-eyebrow">YOUR REPORTS</div>
          <h1>My Issues</h1>
          <p>Keep track of the civic problems you&apos;ve reported and follow their progress.</p>
        </div>

        <button type="button" className="report-new-button" onClick={() => navigate("/report")}>
          <span>＋</span> Report New Issue
        </button>
      </div>

      {!loading && !error && (
        <div className="my-issues-summary">
          <div className="summary-card">
            <div className="summary-icon">📋</div>
            <div><span>Total Reports</span><strong>{issues.length}</strong></div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔄</div>
            <div><span>Active Issues</span><strong>{activeCount}</strong></div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✓</div>
            <div><span>Resolved</span><strong>{resolvedCount}</strong></div>
          </div>
        </div>
      )}

      <div className="my-issues-toolbar">
        <div>
          <h2>Reported Issues</h2>
          <span>
            {loading ? "Loading your reports..." : `${filteredIssues.length} ${filteredIssues.length === 1 ? "issue" : "issues"}`}
          </span>
        </div>

        <div className="issue-filters">
          {[
            ["ALL", "All"],
            ["ACTIVE", "Active"],
            ["RESOLVED", "Resolved"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={activeFilter === value ? "active" : ""}
              onClick={() => setActiveFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="my-issues-loading">
          <div className="loading-spinner" />
          <h3>Loading your reports</h3>
          <p>Fetching your latest civic issues...</p>
        </div>
      )}

      {!loading && error && (
        <div className="my-issues-error">
          <div className="error-icon">!</div>
          <h3>Couldn&apos;t load your issues</h3>
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}

      {!loading && !error && filteredIssues.length === 0 && (
        <div className="my-issues-empty">
          <div className="empty-illustration">🌱</div>
          <h3>{issues.length === 0 ? "You haven&apos;t reported anything yet" : "No issues match this filter"}</h3>
          <p>
            {issues.length === 0
              ? "See something that needs attention? Put it on the Nivra map and help your community."
              : "Try another filter to see your other reports."}
          </p>
          {issues.length === 0 && (
            <button type="button" className="report-new-button" onClick={() => navigate("/report")}>
              <span>＋</span> Report an Issue
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredIssues.length > 0 && (
        <div className="my-issues-grid">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onOpen={setSelectedIssue} />
          ))}
        </div>
      )}

      <IssueDetailsModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </div>
  );
}