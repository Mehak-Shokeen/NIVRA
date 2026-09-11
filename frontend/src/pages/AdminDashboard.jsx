import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

const ROLE_OPTIONS = ["ALL", "CITIZEN", "WORKER", "AUTHORITY", "ADMIN"];

function roleLabel(role) {
  return {
    CITIZEN: "Citizen",
    WORKER: "Worker",
    AUTHORITY: "Authority",
    ADMIN: "Administrator",
  }[role] || role;
}

function roleIcon(role) {
  return { CITIZEN: "👤", WORKER: "🔧", AUTHORITY: "🏛️", ADMIN: "⚙️" }[role] || "👤";
}

function StatCard({ icon, label, value, detail }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
      return;
    }

    const loadSummary = async () => {
      try {
        const response = await api.get("/admin/summary");
        setSummary(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load admin summary.");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (role !== "ALL") params.role = role;

        const response = await api.get("/admin/users", { params });
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load users.");
      } finally {
        setUsersLoading(false);
      }
    };

    const timer = setTimeout(loadUsers, 250);
    return () => clearTimeout(timer);
  }, [user, search, role]);

  const userDistribution = useMemo(() => {
    if (!summary) return [];
    return [
      ["CITIZEN", summary.citizens],
      ["WORKER", summary.workers],
      ["AUTHORITY", summary.authorities],
      ["ADMIN", summary.admins],
    ];
  }, [summary]);

  const handleRoleChange = async (targetUser, nextRole) => {
    if (targetUser.role === nextRole) return;
    if (targetUser.id === user.id && nextRole !== "ADMIN") return;

    setUpdatingId(targetUser.id);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch(`/admin/users/${targetUser.id}/role`, {
        role: nextRole,
      });

      setUsers((current) =>
        current.map((item) => item.id === targetUser.id ? response.data : item)
      );

      const summaryResponse = await api.get("/admin/summary");
      setSummary(summaryResponse.data);
      setSuccess(`${targetUser.name}'s role was changed to ${roleLabel(nextRole)}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (user?.role !== "ADMIN") return null;

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <div className="admin-eyebrow">SYSTEM ADMINISTRATION</div>
          <h1>Admin Dashboard <span>⚙️</span></h1>
          <p>Manage users, monitor the civic ecosystem, and keep Nivra running smoothly.</p>
        </div>
        <div className="admin-hero-actions">
          <button className="admin-outline-button" onClick={() => navigate("/analytics")}>View Analytics</button>
          <button className="admin-primary-button" onClick={() => navigate("/authority")}>Manage Issues</button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">⚠️ {error}</div>}
      {success && <div className="admin-alert admin-alert-success">✓ {success}</div>}

      <section className="admin-stats-grid">
        <StatCard icon="👥" label="Total Users" value={loading ? "—" : summary?.totalUsers ?? 0} detail="All registered accounts" />
        <StatCard icon="📋" label="Total Issues" value={loading ? "—" : summary?.totalIssues ?? 0} detail="Across Nivra" />
        <StatCard icon="🔄" label="Active Issues" value={loading ? "—" : summary?.activeIssues ?? 0} detail="Currently being handled" />
        <StatCard icon="✅" label="Resolved" value={loading ? "—" : summary?.resolvedIssues ?? 0} detail="Successfully closed" />
      </section>

      <section className="admin-overview-grid">
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div><h2>User distribution</h2><p>Accounts by system role</p></div>
            <span className="admin-total-pill">{summary?.totalUsers ?? 0} users</span>
          </div>
          <div className="role-bars">
            {userDistribution.map(([key, count]) => {
              const percentage = summary?.totalUsers ? Math.round((count / summary.totalUsers) * 100) : 0;
              return (
                <div className="role-row" key={key}>
                  <div className="role-row-top"><span>{roleIcon(key)} {roleLabel(key)}</span><strong>{count}</strong></div>
                  <div className="role-track"><div className="role-fill" style={{ width: `${percentage}%` }} /></div>
                  <small>{percentage}% of users</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-panel admin-health-panel">
          <div className="admin-panel-heading"><div><h2>Platform snapshot</h2><p>Current operational state</p></div></div>
          <div className="snapshot-list">
            <div><span className="snapshot-dot green" /><span>New reports</span><strong>{summary?.newIssues ?? 0}</strong></div>
            <div><span className="snapshot-dot blue" /><span>Active reports</span><strong>{summary?.activeIssues ?? 0}</strong></div>
            <div><span className="snapshot-dot purple" /><span>Resolved reports</span><strong>{summary?.resolvedIssues ?? 0}</strong></div>
          </div>
          <button className="text-action" onClick={() => navigate("/analytics")}>Open full analytics →</button>
        </div>
      </section>

      <section className="admin-panel admin-users-panel">
        <div className="admin-panel-heading admin-users-heading">
          <div><h2>User management</h2><p>Search accounts and control their Nivra role.</p></div>
          <span className="admin-total-pill">{users.length} shown</span>
        </div>

        <div className="admin-filters">
          <div className="admin-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." /></div>
          <select value={role} onChange={(e) => setRole(e.target.value)}>{ROLE_OPTIONS.map((item) => <option key={item} value={item}>{item === "ALL" ? "All roles" : roleLabel(item)}</option>)}</select>
        </div>

        <div className="admin-user-table-wrap">
          {usersLoading ? (
            <div className="admin-table-state"><div className="admin-spinner" />Loading users...</div>
          ) : users.length === 0 ? (
            <div className="admin-table-state"><div className="admin-empty-icon">👥</div><strong>No users found</strong><span>Try another search or role filter.</span></div>
          ) : (
            <table className="admin-user-table">
              <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Account ID</th><th>Action</th></tr></thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td><div className="user-cell"><div className="user-avatar">{item.name?.charAt(0)?.toUpperCase() || "U"}</div><div><strong>{item.name}</strong>{item.id === user.id && <small>You</small>}</div></div></td>
                    <td className="email-cell">{item.email}</td>
                    <td><span className={`role-chip role-${item.role.toLowerCase()}`}>{roleIcon(item.role)} {roleLabel(item.role)}</span></td>
                    <td className="id-cell">#{item.id}</td>
                    <td>
                      <select className="role-select" value={item.role} disabled={updatingId === item.id || item.id === user.id} onChange={(e) => handleRoleChange(item, e.target.value)}>
                        {ROLE_OPTIONS.slice(1).map((option) => <option key={option} value={option}>{roleLabel(option)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
