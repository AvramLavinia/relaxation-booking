import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Facilities from "./components/Facilities";
import { fetchActiveBookings } from "./api/bookings";
import RegisterForm from "./auth/regist";
import LoginForm from "./auth/login";
import ResetPasswordForm from "./auth/form";

function AppRoutes({ user, setUser }) {
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  // Try to restore user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
  }, [setUser]);

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem("user", JSON.stringify(userObj));
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
        <Route path="/reset" element={
          <ResetPasswordForm onLogin={() => navigate("/login")} />
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Main app view (user is logged in)
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{
              textAlign: 'center',
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              PingMeLater
            </h2>
            <div>
              <span style={{ marginRight: 12 }}>{user?.email}</span>
              <button onClick={handleLogout}>Logout</button>
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