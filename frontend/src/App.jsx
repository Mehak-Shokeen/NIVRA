import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";

import api from "./services/api";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import IssueMap from "./components/IssueMap";
import NearbyIssues from "./components/NearbyIssues";
import ReportIssue from "./pages/ReportIssue";
import MyIssues from "./pages/MyIssues";
import Notifications from "./pages/Notifications";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import "./index.css";


// ===============================
// Nivra Logo
// ===============================

function NivraLogo() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div>
        <div className="brand-name">Nivra</div>
        <div className="brand-tagline">
          Network for Issue Visibility, Response &amp; Awareness
        </div>
      </div>
    </div>
  );
}


// ===============================
// Role Helpers
// ===============================

function getRoleLabel(role) {
  switch (role) {
    case "CITIZEN":
      return "Citizen";

    case "WORKER":
      return "Worker";

    case "AUTHORITY":
      return "Authority";

    case "ADMIN":
      return "Administrator";

    default:
      return "User";
  }
}


function getRoleIcon(role) {
  switch (role) {
    case "CITIZEN":
      return "👤";

    case "WORKER":
      return "🔧";

    case "AUTHORITY":
      return "🏛️";

    case "ADMIN":
      return "⚙️";

    default:
      return "👤";
  }
}


// ===============================
// Role Based Navigation
// ===============================

function getNavigation(role) {
  switch (role) {
    case "CITIZEN":
      return [
        {
          label: "Map",
          icon: "🗺️",
          path: "/dashboard",
        },
        {
          label: "Report Issue",
          icon: "➕",
          path: "/report",
        },
        {
          label: "My Issues",
          icon: "📋",
          path: "/my-issues",
        },
        {
          label: "Notifications",
          icon: "🔔",
          path: "/notifications",
        },
        {
          label: "Profile",
          icon: "👤",
          path: "/dashboard",
        },
      ];

    case "WORKER":
      return [
        {
          label: "Map",
          icon: "🗺️",
          path: "/dashboard",
        },
        {
          label: "Assigned Issues",
          icon: "📋",
          path: "/worker",
        },
        {
          label: "Notifications",
          icon: "🔔",
          path: "/notifications",
        },
        {
          label: "Profile",
          icon: "👤",
          path: "/dashboard",
        },
      ];

    case "AUTHORITY":
      return [
        {
          label: "Map",
          icon: "🗺️",
          path: "/dashboard",
        },
        {
          label: "All Issues",
          icon: "📋",
          path: "/authority",
        },
        {
          label: "Assign Workers",
          icon: "👷",
          path: "/authority",
        },
        {
          label: "Analytics",
          icon: "📊",
          path: "/analytics",
        },
        {
          label: "Notifications",
          icon: "🔔",
          path: "/notifications",
        },
        {
          label: "Profile",
          icon: "👤",
          path: "/dashboard",
        },
      ];

    case "ADMIN":
      return [
        {
          label: "Dashboard",
          icon: "🏠",
          path: "/admin",
        },
        {
          label: "All Issues",
          icon: "📋",
          path: "/authority",
        },
        {
          label: "Users",
          icon: "👥",
          path: "/admin",
        },
        {
          label: "Analytics",
          icon: "📊",
          path: "/analytics",
        },
        {
          label: "Notifications",
          icon: "🔔",
          path: "/notifications",
        },
        {
          label: "Profile",
          icon: "👤",
          path: "/dashboard",
        },
      ];

    default:
      return [];
  }
}


// ===============================
// Login Page
// ===============================

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-left">

        <NivraLogo />

        <div className="auth-content">

          <div className="auth-badge">
            CIVIC ISSUE MANAGEMENT
          </div>

          <h1>
            Make your
            <span> community better.</span>
          </h1>

          <p>
            Report civic issues, track their progress,
            and help build a cleaner, safer and stronger
            community.
          </p>

          <div className="auth-features">

            <div className="auth-feature">
              <div className="feature-icon">📍</div>

              <div>
                <strong>Report Local Issues</strong>
                <span>
                  Report problems around your community.
                </span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="feature-icon">🔎</div>

              <div>
                <strong>Track Progress</strong>
                <span>
                  Know exactly what is happening with your report.
                </span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="feature-icon">🌱</div>

              <div>
                <strong>Create Change</strong>
                <span>
                  Work together for a better tomorrow.
                </span>
              </div>
            </div>

          </div>

        </div>

        <div className="auth-footer">
          © 2026 Nivra · Stronger Communities. Brighter Tomorrow.
        </div>

      </div>


      <div className="auth-right">

        <div className="auth-card">

          <div className="auth-card-header">
            <h2>Welcome back</h2>

            <p>
              Sign in to continue to Nivra
            </p>
          </div>


          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />


            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />


            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>


          <div className="auth-switch">

            Don't have an account?

            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              Create one
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


// ===============================
// Register Page
// ===============================

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(name, email, password);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-left">

        <NivraLogo />

        <div className="auth-content">

          <div className="auth-badge">
            JOIN NIVRA
          </div>

          <h1>
            Be part of
            <span> the change.</span>
          </h1>

          <p>
            Create an account and help your community
            identify, track and resolve civic issues.
          </p>

          <div className="auth-features">

            <div className="auth-feature">
              <div className="feature-icon">📍</div>

              <div>
                <strong>Report Issues</strong>
                <span>
                  Put problems on the map.
                </span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="feature-icon">🤝</div>

              <div>
                <strong>Stay Involved</strong>
                <span>
                  Follow issues that matter to you.
                </span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="feature-icon">🌱</div>

              <div>
                <strong>Build Better Communities</strong>
                <span>
                  Every report can make a difference.
                </span>
              </div>
            </div>

          </div>

        </div>

        <div className="auth-footer">
          © 2026 Nivra
        </div>

      </div>


      <div className="auth-right">

        <div className="auth-card">

          <div className="auth-card-header">
            <h2>Create account</h2>

            <p>
              Join Nivra today
            </p>
          </div>


          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            <label>Full Name</label>

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />


            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />


            <label>Password</label>

            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={6}
              required
            />


            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>


          <div className="auth-switch">

            Already have an account?

            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Sign in
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


// ===============================
// Sidebar
// ===============================

function Sidebar() {
  const { user, logout } = useAuth();

  const navigation = getNavigation(user?.role);

  return (
    <aside className="sidebar">

      <div className="sidebar-top">

        <NivraLogo />


        <div className="role-badge">

          <span>
            {getRoleIcon(user?.role)}
          </span>

          <div>
            <strong>
              {getRoleLabel(user?.role)}
            </strong>

            <small>
              {user?.email}
            </small>
          </div>

        </div>


        <nav className="sidebar-nav">

          {navigation.map((item, index) => (

            <NavLink
              key={`${item.label}-${index}`}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >

              <span className="sidebar-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </NavLink>

          ))}

        </nav>

      </div>


      <div className="sidebar-bottom">

        <button
          className="sidebar-logout"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>

      </div>

    </aside>
  );
}


// ===============================
// Dashboard Header
// ===============================

function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">

      <div>
        <div className="topbar-title">
          Nivra
        </div>

        <div className="topbar-subtitle">
          {getRoleLabel(user?.role)} Dashboard
        </div>
      </div>


      <div className="topbar-right">

        <button
          className="notification-button"
          onClick={() => navigate("/notifications")}
          aria-label="Open notifications"
        >
          🔔
        </button>


        <div className="topbar-user">

          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <strong>{user?.name}</strong>

            <span>
              {getRoleLabel(user?.role)}
            </span>
          </div>

        </div>


        <button
          className="top-logout"
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}

// ===============================
// Dashboard Map Preview
// ===============================

function DashboardMapPreview() {
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [userLocation, setUserLocation] = useState(null);


  return (
    <div className="dashboard-map-section">

      <div className="section-header">

        <div>
          <h2>Community Issues</h2>

          <p>
            Explore reported issues around your community.
          </p>
        </div>

        <span className="map-coming">
          Live Community Map
        </span>

      </div>


      <div className="map-dashboard-layout">

        <div className="map-main">

          <IssueMap
            onFilteredIssuesChange={setFilteredIssues}
            onUserLocationChange={setUserLocation}
          />

        </div>


        <NearbyIssues
          filteredIssues={filteredIssues}
          userLocation={userLocation}
        />

      </div>

    </div>
  );
}

// ===============================
// Role-specific Dashboard Content
// ===============================

function CitizenDashboard() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchMyIssues = async () => {
      try {
        const response = await api.get("/issues/my");
        setIssues(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load dashboard issue stats:", error);
      }
    };

    fetchMyIssues();
  }, []);

  const myIssuesCount = issues.length;

  const inProgressCount = issues.filter(
    (issue) => issue.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = issues.filter(
    (issue) => issue.status === "RESOLVED"
  ).length;

  return (
    <>
      <div className="welcome-section">

        <div>
          <h1>Good to see you! 👋</h1>

          <p>
            Help make your community a better place.
          </p>
        </div>

        <button
          className="dashboard-report-button"
          onClick={() => navigate("/report")}
        >
          <span>＋</span>
          Report Issue
        </button>

      </div>


      <div className="stats-grid">

        <div className="stat-card">
          <span className="stat-icon">📋</span>

          <div>
            <span>My Issues</span>
            <strong>{myIssuesCount}</strong>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">🔄</span>

          <div>
            <span>In Progress</span>
            <strong>{inProgressCount}</strong>
          </div>
        </div>


        <div className="stat-card">
          <span className="stat-icon">✅</span>

          <div>
            <span>Resolved</span>
            <strong>{resolvedCount}</strong>
          </div>
        </div>

      </div>


      <DashboardMapPreview />

    </>
  );
}
// ===============================
// Dashboard
// ===============================

function Dashboard() {
  const { user } = useAuth();

  const renderDashboard = () => {

    switch (user?.role) {

      case "CITIZEN":
        return <CitizenDashboard />;

      case "WORKER":
        return <WorkerDashboard />;

      case "AUTHORITY":
        return <AuthorityDashboard />;

      case "ADMIN":
        return <AdminDashboard />;

      default:
        return (
          <div className="empty-state">
            Unable to determine user role.
          </div>
        );
    }
  };


  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <DashboardHeader />

        <div className="dashboard-content">
          {renderDashboard()}
        </div>

      </main>

    </div>
  );
}


// ===============================
// App
// ===============================

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <ReportIssue />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-issues"
        element={
          <ProtectedRoute>
            <MyIssues />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/worker"
        element={
          <ProtectedRoute>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/authority"
        element={
          <ProtectedRoute>
            <AuthorityDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


// ===============================
// Export
// ===============================

export default App;










