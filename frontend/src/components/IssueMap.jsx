import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import UserLocation from "./UserLocation";
import "leaflet/dist/leaflet.css";


// =====================================================
// Formatting Helpers
// =====================================================

function formatStatus(status) {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function formatCategory(category) {
  if (!category) return "Other";

  return category
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


// =====================================================
// Marker Helpers
// =====================================================

function getMarkerColor(status) {
  switch (status) {
    case "VERIFIED":
      return "#3b82f6";

    case "ASSIGNED":
      return "#8b5cf6";

    case "IN_PROGRESS":
      return "#f97316";

    case "RESOLVED":
      return "#22a06b";

    case "NEW":
    default:
      return "#e8a317";
  }
}


function getMarkerSize(priority) {
  switch (priority) {
    case "HIGH":
      return 40;

    case "MEDIUM":
      return 34;

    case "LOW":
      return 30;

    default:
      return 34;
  }
}


function createIssueIcon(status, priority) {
  const color = getMarkerColor(status);
  const size = getMarkerSize(priority);

  return L.divIcon({
    className: "nivra-marker-container",

    html: `
      <div
        class="nivra-issue-marker"
        style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
        "
      >
        <span>!</span>
      </div>
    `,

    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}


// =====================================================
// Auto Fit
// =====================================================

function FitMapToIssues({ issues }) {
  const map = useMap();

  useEffect(() => {
    if (!issues.length) return;

    const bounds = L.latLngBounds(
      issues.map((issue) => [
        Number(issue.latitude),
        Number(issue.longitude),
      ])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [issues, map]);

  return null;
}


// =====================================================
// Issue Map
// =====================================================

function IssueMap({onFilteredIssuesChange,onUserLocationChange,}) {
  const defaultCenter = [28.6139, 77.2090];

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");


  // ===================================================
  // Fetch Issues
  // ===================================================

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/issues", {
          params: {
            page: 0,
            size: 100,
          },
        });

        const data = response.data;

        if (Array.isArray(data)) {
          setIssues(data);
        } else if (Array.isArray(data.content)) {
          setIssues(data.content);
        } else {
          setIssues([]);
        }

      } catch (err) {
        console.error("Failed to load issues:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load community issues."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);


  // ===================================================
  // Filter Options
  // ===================================================

  const categories = useMemo(() => {
    return [
      ...new Set(
        issues
          .map((issue) => issue.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [issues]);


  // ===================================================
  // Filter Issues
  // ===================================================

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {

      const matchesStatus =
        statusFilter === "ALL" ||
        issue.status === statusFilter;


      const matchesCategory =
        categoryFilter === "ALL" ||
        issue.category === categoryFilter;


      const matchesPriority =
        priorityFilter === "ALL" ||
        issue.priority === priorityFilter;


      return (
        matchesStatus &&
        matchesCategory &&
        matchesPriority
      );
    });
  }, [
    issues,
    statusFilter,
    categoryFilter,
    priorityFilter,
  ]);


  // ===================================================
  // Only Issues With Coordinates
  // ===================================================

  const mappedIssues = filteredIssues.filter(
    (issue) =>
      issue.latitude !== null &&
      issue.latitude !== undefined &&
      issue.longitude !== null &&
      issue.longitude !== undefined
  );


  // ===================================================
  // Send Filtered Issues To Parent
  // ===================================================

  useEffect(() => {
    if (onFilteredIssuesChange) {
      onFilteredIssuesChange(filteredIssues);
    }
  }, [
    filteredIssues,
    onFilteredIssuesChange,
  ]);


  // ===================================================
  // Reset Filters
  // ===================================================

  const clearFilters = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setPriorityFilter("ALL");
  };


  const hasFilters =
    statusFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    priorityFilter !== "ALL";


  // ===================================================
  // Render
  // ===================================================

  return (
    <div className="issue-map-wrapper">

      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="issue-map"
      >

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <UserLocation
          onLocationChange={onUserLocationChange}
        />


        {/* ==========================================
            Issue Markers
            ========================================== */}

        {mappedIssues.map((issue) => (

          <Marker
            key={issue.id}
            position={[
              Number(issue.latitude),
              Number(issue.longitude),
            ]}
            icon={createIssueIcon(
              issue.status,
              issue.priority
            )}
          >

            <Popup>

              <div className="issue-popup">

                <div className="issue-popup-header">

                  <span className="issue-popup-category">
                    {formatCategory(issue.category)}
                  </span>

                  <span
                    className="issue-popup-status"
                    style={{
                      color: getMarkerColor(issue.status),
                    }}
                  >
                    {formatStatus(issue.status)}
                  </span>

                </div>


                <h3>
                  {issue.title || "Civic Issue"}
                </h3>


                {issue.description && (
                  <p className="issue-popup-description">
                    {issue.description}
                  </p>
                )}


                {issue.priority && (
                  <div className="issue-popup-row">

                    <strong>
                      Priority
                    </strong>

                    <span
                      className={`popup-priority priority-${issue.priority.toLowerCase()}`}
                    >
                      {issue.priority}
                    </span>

                  </div>
                )}


                <div className="issue-popup-row">

                  <strong>
                    Status
                  </strong>

                  <span>
                    {formatStatus(issue.status)}
                  </span>

                </div>


                <div className="issue-popup-row">

                  <strong>
                    Issue ID
                  </strong>

                  <span>
                    #{issue.id}
                  </span>

                </div>


                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt={issue.title || "Civic issue"}
                    className="issue-popup-image"
                  />
                )}

              </div>

            </Popup>

          </Marker>

        ))}

      </MapContainer>


      {/* ==============================================
          Filters
          ============================================== */}

      <div className="map-filters">

        <div className="map-filter-group">

          <label>
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >

            <option value="ALL">
              All Statuses
            </option>

            <option value="NEW">
              New
            </option>

            <option value="VERIFIED">
              Verified
            </option>

            <option value="ASSIGNED">
              Assigned
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

          </select>

        </div>


        <div className="map-filter-group">

          <label>
            Category
          </label>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >

            <option value="ALL">
              All Categories
            </option>

            {categories.map((category) => (

              <option
                key={category}
                value={category}
              >
                {formatCategory(category)}
              </option>

            ))}

          </select>

        </div>


        <div className="map-filter-group">

          <label>
            Priority
          </label>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
          >

            <option value="ALL">
              All Priorities
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>

          </select>

        </div>


        {hasFilters && (

          <button
            type="button"
            className="map-clear-filters"
            onClick={clearFilters}
          >
            Clear
          </button>

        )}

      </div>


      {/* ==============================================
          Filter Count
          ============================================== */}

      <div className="map-result-count">

        Showing{" "}
        <strong>
          {filteredIssues.length}
        </strong>{" "}
        of{" "}
        <strong>
          {issues.length}
        </strong>{" "}
        issues

      </div>


      {/* ==============================================
          Loading
          ============================================== */}

      {loading && (
        <div className="map-status-overlay">

          <div className="map-status-card">

            <span className="map-spinner"></span>

            <span>
              Loading community issues...
            </span>

          </div>

        </div>
      )}


      {/* ==============================================
          Error
          ============================================== */}

      {!loading && error && (
        <div className="map-status-overlay">

          <div className="map-status-card map-error-card">

            <span>
              ⚠️
            </span>

            <span>
              {error}
            </span>

          </div>

        </div>
      )}


      {/* ==============================================
          Empty
          ============================================== */}

      {!loading &&
        !error &&
        filteredIssues.length === 0 && (

          <div className="map-empty-badge">

            <span>
              🔎
            </span>

            No issues match these filters

          </div>
        )}


      {/* ==============================================
          Legend
          ============================================== */}

      <div className="map-legend">

        <div className="map-legend-title">
          Issue Status
        </div>

        <div className="map-legend-item">
          <span
            className="legend-dot"
            style={{ background: "#e8a317" }}
          />
          New
        </div>

        <div className="map-legend-item">
          <span
            className="legend-dot"
            style={{ background: "#3b82f6" }}
          />
          Verified
        </div>

        <div className="map-legend-item">
          <span
            className="legend-dot"
            style={{ background: "#8b5cf6" }}
          />
          Assigned
        </div>

        <div className="map-legend-item">
          <span
            className="legend-dot"
            style={{ background: "#f97316" }}
          />
          In Progress
        </div>

        <div className="map-legend-item">
          <span
            className="legend-dot"
            style={{ background: "#22a06b" }}
          />
          Resolved
        </div>

      </div>

    </div>
  );
}

export default IssueMap;