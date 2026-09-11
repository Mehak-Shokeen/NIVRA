import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Notifications.css";

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getNotificationIcon(message = "") {
  const text = message.toLowerCase();

  if (text.includes("assigned")) return "👷";
  if (text.includes("resolved")) return "✅";
  if (text.includes("in_progress") || text.includes("in progress")) return "🔧";
  if (text.includes("verified")) return "✓";
  if (text.includes("rejected")) return "⚠️";

  return "🔔";
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/notifications");
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("We couldn't load your notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((notification) => !notification.read);
    }

    if (filter === "READ") {
      return notifications.filter((notification) => notification.read);
    }

    return notifications;
  }, [filter, notifications]);

  const markRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      setMarkingAll(true);
      await api.patch("/notifications/read-all");
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setError("We couldn't update your notifications. Please try again.");
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = async (notification) => {
    if (!notification.read) {
      await markRead(notification.id);
    }

    if (notification.issueId) {
      navigate("/dashboard");
    }
  };

  return (
    <section className="notifications-page">
      <div className="notifications-hero">
        <div>
          <p className="page-eyebrow">Stay informed</p>
          <h1>Notifications</h1>
          <p>
            Keep track of important updates about your civic issues and work.
          </p>
        </div>

        <div className="notification-summary-card">
          <span className="notification-summary-icon">🔔</span>
          <div>
            <strong>{unreadCount}</strong>
            <span>unread</span>
          </div>
        </div>
      </div>

      <div className="notifications-toolbar">
        <div className="notification-filters">
          {[
            ["ALL", "All"],
            ["UNREAD", "Unread"],
            ["READ", "Read"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
              {value === "UNREAD" && unreadCount > 0 && (
                <span>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mark-all-button"
          onClick={markAllRead}
          disabled={markingAll || unreadCount === 0}
        >
          {markingAll ? "Updating..." : "Mark all as read"}
        </button>
      </div>

      {error && (
        <div className="notification-error">
          <span>⚠️</span>
          <span>{error}</span>
          <button type="button" onClick={loadNotifications}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="notifications-loading">
          <div className="notification-spinner" />
          <p>Loading your notifications...</p>
        </div>
      ) : visibleNotifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="empty-bell">🔔</div>
          <h2>
            {filter === "ALL" ? "You're all caught up" : `No ${filter.toLowerCase()} notifications`}
          </h2>
          <p>
            {filter === "ALL"
              ? "When something important happens, you'll see it here."
              : "Try another notification filter."}
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {visibleNotifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={`notification-card ${notification.read ? "read" : "unread"}`}
              onClick={() => openNotification(notification)}
            >
              <div className="notification-card-icon">
                {getNotificationIcon(notification.message)}
              </div>

              <div className="notification-card-content">
                <div className="notification-card-topline">
                  <span className="notification-label">
                    {notification.issueId
                      ? `Issue #${notification.issueId}`
                      : "Nivra update"}
                  </span>
                  <span className="notification-time">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>

                <p>{notification.message}</p>

                {notification.issueId && (
                  <span className="notification-action">
                    View issue →
                  </span>
                )}
              </div>

              {!notification.read && <span className="unread-dot" />}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
