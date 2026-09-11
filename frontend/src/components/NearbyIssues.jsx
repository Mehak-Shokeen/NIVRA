import { useEffect, useState } from "react";
import api from "../services/api";


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


function getStatusClass(status) {
  switch (status) {
    case "VERIFIED":
      return "status-verified";

    case "ASSIGNED":
      return "status-assigned";

    case "IN_PROGRESS":
      return "status-progress";

    case "RESOLVED":
      return "status-resolved";

    case "NEW":
    default:
      return "status-new";
  }
}


function NearbyIssues({
  filteredIssues = [],
  userLocation,
}) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const radius = 500;


  // ===================================================
  // Fetch When Location Changes
  // ===================================================

  useEffect(() => {
    if (!userLocation) {
      return;
    }


    const fetchNearbyIssues = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/issues/nearby",
          {
            params: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              radius,
            },
          }
        );


        const data = response.data;


        if (Array.isArray(data)) {
          setIssues(data);
        } else if (Array.isArray(data.content)) {
          setIssues(data.content);
        } else {
          setIssues([]);
        }

      } catch (err) {
        console.error(
          "Failed to load nearby issues:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Unable to load nearby issues."
        );

      } finally {
        setLoading(false);
      }
    };


    fetchNearbyIssues();

  }, [userLocation]);


  // ===================================================
  // Apply Map Filters
  // ===================================================

  const visibleNearbyIssues =
    issues.filter((nearbyIssue) =>
      filteredIssues.some(
        (issue) => issue.id === nearbyIssue.id
      )
    );


  // ===================================================
  // Render
  // ===================================================

  return (
    <aside className="nearby-issues">

      <div className="nearby-header">

        <div>

          <h2>
            Nearby Issues
          </h2>

          <p>
            Within {radius}m of your location
          </p>

        </div>

        <span className="nearby-count">
          {visibleNearbyIssues.length}
        </span>

      </div>


      {!userLocation && (
        <div className="nearby-empty">

          <div className="nearby-empty-icon">
            📍
          </div>

          <strong>
            Finding your location...
          </strong>

          <span>
            Allow location access to see civic
            issues near you.
          </span>

        </div>
      )}


      {userLocation &&
        loading && (

          <div className="nearby-loading">

            <span className="map-spinner"></span>

            <span>
              Finding nearby issues...
            </span>

          </div>
        )}


      {userLocation &&
        !loading &&
        error && (

          <div className="nearby-error">
            ⚠️ {error}
          </div>
        )}


      {userLocation &&
        !loading &&
        !error &&
        visibleNearbyIssues.length === 0 && (

          <div className="nearby-empty">

            <div className="nearby-empty-icon">
              📍
            </div>

            <strong>
              No nearby issues
            </strong>

            <span>
              No reported issues were found within
              {` ${radius}m `}of your location.
            </span>

          </div>
        )}


      {userLocation &&
        !loading &&
        !error &&
        visibleNearbyIssues.length > 0 && (

          <div className="nearby-list">

            {visibleNearbyIssues.map((issue) => (

              <button
                key={issue.id}
                className="nearby-issue-card"
                type="button"
              >

                <div className="nearby-issue-marker">

                  <span
                    className={`nearby-status-dot ${getStatusClass(
                      issue.status
                    )}`}
                  ></span>

                </div>


                <div className="nearby-issue-content">

                  <div className="nearby-issue-top">

                    <span className="nearby-category">
                      {formatCategory(issue.category)}
                    </span>

                    <span className="nearby-distance">
                      Nearby
                    </span>

                  </div>


                  <h3>
                    {issue.title || "Civic Issue"}
                  </h3>


                  {issue.description && (
                    <p>
                      {issue.description}
                    </p>
                  )}


                  <div className="nearby-issue-bottom">

                    <span
                      className={`nearby-status ${getStatusClass(
                        issue.status
                      )}`}
                    >
                      {formatStatus(issue.status)}
                    </span>


                    {issue.priority && (
                      <span className="nearby-priority">
                        {issue.priority}
                      </span>
                    )}

                  </div>

                </div>

              </button>

            ))}

          </div>
        )}

    </aside>
  );
}


export default NearbyIssues;