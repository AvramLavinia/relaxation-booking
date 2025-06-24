import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Facilities from "./components/Facilities";
import { fetchActiveBookings } from "./api/bookings";
import RegisterForm from "./auth/regist";
import LoginForm from "./auth/login";
import ResetPasswordForm from "./auth/form";

function AppRoutes({ user, setUser }) {
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
  }, [setUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = (userObj) => {
    const normalizedUser = {
      ...userObj,
      name: userObj.name || userObj.displayName || userObj.email?.split("@")[0],
    };
    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    navigate("/");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleShowBookings = async () => {
    const active = await fetchActiveBookings();
    setBookings(active);
    setShowBookings(true);
  };

  const handleDarkModeToggle = () => {
    document.body.classList.toggle("dark-mode");
  };

  const menuButtonStyle = {
    width: "100%",
    padding: "10px",
    textAlign: "left",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    borderBottom: "1px solid #eee"
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={
          <LoginForm
            onLogin={handleLogin}
            onRegister={() => navigate("/register")}
            onReset={() => navigate("/reset")}
          />
        } />
        <Route path="/register" element={
          <RegisterForm
            onSuccess={() => navigate("/login")}
            onLogin={() => navigate("/login")}
          />
        } />
        <Route path="/reset" element={<ResetPasswordForm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div style={{
          maxWidth: '600px',
          margin: '20px auto',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 0 8px rgba(0,0,0,0.1)',
          fontFamily: 'sans-serif',
          background: '#fff'
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px"
          }}>
            <h2 style={{
              margin: 0,
              marginBottom: "12px",
              fontSize: "24px",
              fontWeight: "600"
            }}>
              PingMeLater
            </h2>
            <div ref={menuRef} style={{ position: "relative" }}>
              <span style={{ marginRight: 12 }}>{user?.email?.split("@endava.com")[0]}</span>
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                style={{
                  fontSize: "1.25rem",
                  padding: "0.4rem 0.8rem",
                  backgroundColor: isMenuOpen ? "#f472b6" : "#facc15", // yellow default, pink when open
                  color: "#000",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontWeight: "500",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                ☰
              </button>
              {isMenuOpen && (
                <div style={{
                  position: "absolute",
                  top: "2.5rem",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  zIndex: 999,
                  minWidth: "180px"
                }}>
                  <button onClick={handleDarkModeToggle} style={menuButtonStyle}>Toggle Dark Mode</button>
                  <button style={menuButtonStyle}>Change Email</button>
                  <button onClick={handleLogout} style={{ ...menuButtonStyle, color: "red" }}>Logout</button>
                </div>
              )}
            </div>
          </div>

          <Facilities user={user} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px'
          }}>
            <button
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid black',
                backgroundColor: 'white',
                cursor: 'pointer',
                margin: '0 5px',
                fontWeight: 'bold'
              }}
              onClick={handleShowBookings}
            >
              My Bookings
            </button>
            <button style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid black',
              backgroundColor: 'white',
              cursor: 'pointer',
              margin: '0 5px',
              fontWeight: 'bold'
            }}>
              Organize Tournament
            </button>
          </div>

          {showBookings && (
            <div
              style={{
                position: "fixed",
                top: "30%",
                left: "50%",
                transform: "translate(-50%, -30%)",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "2rem",
                zIndex: 1000,
              }}
            >
              <h3>My Bookings</h3>
              <ul>
                {bookings.length === 0 ? (
                  <li>No active bookings.</li>
                ) : (
                  bookings
                    .filter(b => b.user_email === user.email)
                    .map((b) => (
                      <li key={b.id}>
                        {b.facility_slug} booked by {b.user_email} from {b.start_time} to {b.end_time}
                      </li>
                    ))
                )}
              </ul>
              <button onClick={() => setShowBookings(false)}>Close</button>
            </div>
          )}
        </div>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <AppRoutes user={user} setUser={setUser} />
    </Router>
  );
}

export default App;