import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Facilities from "./components/Facilities";
import { fetchActiveBookings } from "./api/bookings";
import RegisterForm from "./auth/regist";
import LoginForm from "./auth/login";
import ResetPasswordForm from "./auth/form";
import logo from "./assets/endava_logo.png";
import TournamentsHome from "./components/TournamentsHome";
import MyInvitations from "./components/MyInvitations";
import BookingModal from "./components/BookingModal";
import BookingCalendar from "./components/Calendar";

function AppRoutes({ user, setUser }) {
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showReservationsPopup, setShowReservationsPopup] = useState(false);
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
 
  // Helper for reservations filtering
  const getReservationsForDate = (date) => {
    if (!date) return [];
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const selectedDateStr = `${yyyy}-${mm}-${dd}`;
    return bookings.filter(b => b.start_time.startsWith(selectedDateStr));
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
    <>
      {/* LOGO stânga sus */}
      <div style={{
        position: "fixed",
        top: 24,
        left: 32,
        zIndex: 2000,
        display: "flex",
        alignItems: "center"
      }}>
        <img src={logo} alt="Endava Logo" style={{ height: 60 }} />
      </div>
 
      {/* MENU dreapta sus */}
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: 24,
          right: 32,
          zIndex: 2000,
          display: "flex",
          alignItems: "center"
        }}
      >
        <span style={{ marginRight: 12 }}>{user?.email?.split("@endava.com")[0]}</span>
        <button
          onClick={() => setIsMenuOpen(prev => !prev)}
          style={{
            fontSize: "1.25rem",
            padding: "0.4rem 0.8rem",
            backgroundColor: isMenuOpen ? "#f472b6" : "#facc15",
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
 
      {/* Caseta centrală */}
      <Routes>
        <Route path="/" element={
          <div style={{
            minHeight: "100vh",
            background: "#f5f7fa",
            width: "100vw",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif"
          }}>
            <div style={{
              display: "flex",
              flexDirection: "row",
              gap: "48px",
              maxWidth: "1200px",
              width: "100%",
              marginTop: "48px",
            }}>
              {/* Facilities Column */}
              <div style={{
                flex: 2,
                background: "#fff",
                borderRadius: "24px",
                boxShadow: "0 4px 24px rgba(44,62,80,0.10)",
                padding: "32px 32px 24px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "420px",
                maxWidth: "520px",
              }}>
                <h1 style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#1a237e",
                  marginBottom: "1.5rem",
                  letterSpacing: "1px"
                }}>
                  PingMeLater
                </h1>
                <h2 style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1a237e",
                  marginBottom: "1.2rem",
                  letterSpacing: "1px"
                }}>
                  Facilities
                </h2>
                <Facilities
                  user={user}
                  bookings={bookings}
                  onBook={facility => setSelectedFacility(facility)}
                />
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  marginTop: "2rem"
                }}>
                  <button
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#ffa23a",
                      color: "#fff",
                      cursor: "pointer",
                      marginRight: "12px",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      boxShadow: "0 2px 8px rgba(44,62,80,0.08)",
                      transition: "background 0.2s"
                    }}
                    onClick={handleShowBookings}
                  >
                    My Bookings
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#1a237e",
                      color: "#fff",
                      cursor: "pointer",
                      marginLeft: "12px",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      boxShadow: "0 2px 8px rgba(44,62,80,0.08)",
                      transition: "background 0.2s"
                    }}
                    onClick={() => navigate("/tournaments")}
                  >
                    Organize Tournament
                  </button>
                </div>
              </div>
              {/* Calendar & Reservations Column */}
              <div style={{
                flex: 1,
                background: "#fff",
                borderRadius: "24px",
                boxShadow: "0 4px 24px rgba(44,62,80,0.10)",
                padding: "32px 24px",
                minWidth: "340px",
                maxWidth: "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px"
              }}>
                {/* Calendar Section */}
                <div style={{
                  width: "100%",
                  marginBottom: "16px",
                  paddingBottom: "16px",
                  borderBottom: "1.5px solid #f5f7fa"
                }}>
                  <BookingCalendar
                    reservations={bookings}
                    onDateSelect={date => setSelectedDate(date)}
                    showReservations={false}
                  />
                </div>
                {/* Hours/Reservations Section */}
                <div style={{
                  width: "100%",
                  maxHeight: "320px",
                  overflowY: "auto",
                  paddingRight: "8px"
                }}>
                  <h3 style={{
                    fontWeight: "700",
                    fontSize: "1.1rem",
                    color: "#1a237e",
                    marginBottom: "12px"
                  }}>
                    Reservations for {selectedDate ? selectedDate.toLocaleDateString("en-GB") : "—"}
                  </h3>
                  {(() => {
                    const yyyy = selectedDate?.getFullYear();
                    const mm = String(selectedDate?.getMonth() + 1).padStart(2, "0");
                    const dd = String(selectedDate?.getDate()).padStart(2, "0");
                    const selectedDateStr = selectedDate ? `${yyyy}-${mm}-${dd}` : null;
                    const reservationsForDate = bookings.filter(b => b.start_time.startsWith(selectedDateStr));
                    if (!selectedDate) return <div style={{ color: "#888", textAlign: "center" }}>No date selected.</div>;
                    if (reservationsForDate.length === 0) {
                      return <div style={{ color: "#888", textAlign: "center" }}>No reservations for this day.</div>;
                    }
                    return (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {reservationsForDate.map((b, i) => {
                          const start = new Date(b.start_time);
                          const end = new Date(b.end_time);
                          return (
                            <li key={i} style={{
                              marginBottom: 10,
                              background: "#fff7f7",
                              border: "1px solid #ffe0e0",
                              borderRadius: 8,
                              padding: "10px 14px"
                            }}>
                              <b>{b.facility_slug.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</b>
                              <br />
                              {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              <br />
                              <span style={{ color: "#b91c1c" }}>{b.user_email}</span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })()}
                </div>
              </div>
            </div>
            {/* Bookings Modal, etc. */}
            {showBookings && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.12)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setShowBookings(false)} // <-- close on overlay click
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "32px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                    padding: "2.5rem 2rem 2rem 2rem",
                    minWidth: "370px",
                    maxWidth: "90vw",
                    maxHeight: "80vh", // <-- limit height
                    overflowY: "auto", // <-- make scrollable
                    textAlign: "center",
                    position: "relative"
                  }}
                  onClick={e => e.stopPropagation()} // <-- prevent closing when clicking inside modal
                >
                  <h2 style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    margin: "0 0 2rem 0",
                    letterSpacing: "-1px"
                  }}>My Bookings</h2>
                  {bookings.filter(b => b.user_email === user.email).length === 0 ? (
                    <div style={{ color: "#888", fontSize: "1.1rem", marginBottom: "2rem" }}>No active bookings.</div>
                  ) : (
                    bookings
                      .filter(b => b.user_email === user.email)
                      .map((b) => {
                        const start = new Date(b.start_time);
                        const end = new Date(b.end_time);
 
                        // Icon for facility
                        let icon = null;
                        if (b.facility_slug === "ping-pong") icon = "🏓";
                        else if (b.facility_slug === "fussball") icon = "👥";
                        else if (b.facility_slug === "ps5") icon = "🎮";
                        else if (b.facility_slug === "chair") icon = "💺";
 
                        // Pretty name
                        const prettyName = b.facility_slug
                          .replace("-", " ")
                          .replace(/\b\w/g, l => l.toUpperCase());
 
                        return (
                          <div
                            key={b.id}
                            style={{
                              background: "#fff",
                              border: "1.5px solid #eee",
                              borderRadius: "24px",
                              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                              padding: "1.5rem 1.5rem 1.2rem 1.5rem",
                              margin: "0 auto 2rem auto",
                              maxWidth: 420,
                              display: "flex",
                              alignItems: "center",
                              gap: "1.2rem"
                            }}
                          >
                            <div style={{
                              borderLeft: "6px solid #ffa23a",
                              borderRadius: "8px",
                              height: "70px",
                              marginRight: "1.2rem"
                            }} />
                            <div style={{ flex: 1, textAlign: "left" }}>
                              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                                <span style={{ fontSize: "2rem", marginRight: "0.7rem" }}>{icon}</span>
                                <span style={{ fontWeight: 700, fontSize: "1.6rem" }}>{prettyName}</span>
                              </div>
                              <div style={{ fontSize: "1.15rem", marginBottom: "0.2rem" }}>
                                {`${start.getDate().toString().padStart(2, "0")}/${(start.getMonth()+1).toString().padStart(2, "0")}/${start.getFullYear()}`}
                              </div>
                              <div style={{ fontSize: "1.15rem", letterSpacing: "1px" }}>
                                {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} &mdash; {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                  <button
                    onClick={() => setShowBookings(false)}
                    style={{
                      marginTop: "0.5rem",
                      padding: "1rem 0",
                      width: "70%",
                      background: "#ffa23a",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      border: "none",
                      borderRadius: "18px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(255,162,58,0.10)",
                      transition: "background 0.2s"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            {showReservationsPopup && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.7)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setShowReservationsPopup(false)} // <-- close on overlay click
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "32px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                    padding: "2rem",
                    minWidth: "300px",
                    maxWidth: "90vw",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    textAlign: "center",
                    position: "relative"
                  }}
                  onClick={e => e.stopPropagation()} // <-- prevent closing when clicking inside modal
                >
                  <h2 style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    margin: "0 0 1.5rem 0",
                    letterSpacing: "-0.5px"
                  }}>Reservations on {selectedDate.toLocaleDateString()}</h2>
                  {/* Reservations list for the selected date */}
                  {bookings.length === 0 ? (
                    <div style={{ color: "#888", fontSize: "1.1rem", marginBottom: "2rem" }}>No reservations found.</div>
                  ) : (
                    bookings
                      .filter(b => new Date(b.start_time).toDateString() === selectedDate.toDateString())
                      .map((b) => {
                        const start = new Date(b.start_time);
                        const end = new Date(b.end_time);
 
                        // Icon for facility
                        let icon = null;
                        if (b.facility_slug === "ping-pong") icon = "🏓";
                        else if (b.facility_slug === "fussball") icon = "👥";
                        else if (b.facility_slug === "ps5") icon = "🎮";
                        else if (b.facility_slug === "chair") icon = "💺";
 
                        // Pretty name
                        const prettyName = b.facility_slug
                          .replace("-", " ")
                          .replace(/\b\w/g, l => l.toUpperCase());
 
                        return (
                          <div
                            key={b.id}
                            style={{
                              background: "#f9f9f9",
                              border: "1px solid #ddd",
                              borderRadius: "16px",
                              padding: "1.2rem",
                              margin: "0.8rem 0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "1rem"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                              <span style={{ fontSize: "1.8rem", marginRight: "0.5rem" }}>{icon}</span>
                              <div style={{ textAlign: "left" }}>
                                <div style={{ fontWeight: 600, fontSize: "1.4rem" }}>{prettyName}</div>
                                <div style={{ fontSize: "1.1rem", color: "#555" }}>
                                  {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} &mdash; {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedFacility(bookings.find(b => b.id === b.id));
                                setShowReservationsPopup(false);
                              }}
                              style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#1a237e",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: "500",
                                fontSize: "1rem",
                                transition: "background 0.2s",
                                boxShadow: "0 2px 8px rgba(26,35,126,0.1)"
                              }}
                            >
                              Book Again
                            </button>
                          </div>
                        );
                      })
                  )}
                  <button
                    onClick={() => setShowReservationsPopup(false)}
                    style={{
                      marginTop: "1rem",
                      padding: "1rem 0",
                      width: "80%",
                      background: "#ffa23a",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      border: "none",
                      borderRadius: "18px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(255,162,58,0.10)",
                      transition: "background 0.2s"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        } />
        <Route path="/tournaments" element={<TournamentsHome />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <MyInvitations /> {/* <-- Add this so the popup is always available */}
 
      {/* Show BookingModal when a facility is selected */}
      {selectedFacility && (
        <BookingModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          user={user}
          bookings={bookings}
        />
      )}
    </>
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