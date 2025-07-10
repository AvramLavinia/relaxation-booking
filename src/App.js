import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Facilities from "./components/Facilities";
import { fetchActiveBookings } from "./api/bookings";
import RegisterForm from "./auth/regist";
import LoginForm from "./auth/login";
import ResetPasswordForm from "./auth/form";
import logo from "./assets/endava_logo.png";
import TournamentsHome from "./components/TournamentsHome";
import BookingCalendar from "./components/BookingCalendar";

function AppRoutes({ user, setUser }) {
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showReservationsPopup, setShowReservationsPopup] = useState(false);

  // ✅ Use bookings and selectedDate here
  console.log(bookings, selectedDate);

  // Add this to debug
  console.log(
    "selectedDate:", selectedDate,
    "bookingDates:", bookings.map(b => new Date(b.start))
  );

  // Use this improved filter
  const reservationsForDate = bookings.filter(b => {
    if (!selectedDate) return false;
    // If b.date is "10-07-2025"
    const [day, month, year] = b.date.split('-');
    const bookingDate = new Date(`${year}-${month}-${day}`);
    return (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    );
  });

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
    <>
      {/* LOGO stânga sus */}
      <div style={{
        position: "fixed",
        top: 24,
        left: 32,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column", // stack logo and title vertically
        alignItems: "flex-start"
      }}>
        <img src={logo} alt="Endava Logo" style={{ height: 60 }} />
        <div style={{
          marginTop: 6,
          fontWeight: 700,
          fontSize: "1.5rem",
          color: "#222",
          letterSpacing: "1px",
          fontFamily: "sans-serif"
        }}>
          PingMeLater
        </div>
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
            background: "linear-gradient(135deg, #f3e7fa 0%, #f9fbe7 100%)",
            width: "100vw",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start" // <-- ensures top alignment
          }}>
            <div style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center", // <-- center vertically
              gap: "56px",
              maxWidth: "1100px",
              width: "100%",
              margin: "0 auto",
              paddingLeft: "32px",
              paddingRight: "32px"
            }}>
              <div style={{
                flex: 2,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center", // <-- center horizontally
                height: "100%" // <-- ensure full height for vertical centering
              }}>
                <div style={{
                  maxWidth: '600px',
                  width: '100%',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 0 8px rgba(0,0,0,0.1)',
                  fontFamily: 'sans-serif',
                  background: 'linear-gradient(135deg, #f3e7fa 0%, #f9fbe7 100%)',
                  minHeight: '520px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  marginTop: '48px' // <-- Add this line to push Facilities down
                }}>
                  {/* Facilities and buttons */}
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
                    }} onClick={() => navigate("/tournaments")}>
                      Organize Tournament
                    </button>
                  </div>

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
                </div>
              </div>
              <div style={{
                flex: 1,
                minWidth: 340,
                maxWidth: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    boxShadow: "0 0 12px rgba(0,0,0,0.07)",
                    padding: "28px 18px 18px 18px",
                    width: "100%",
                    minHeight: '520px',
                    alignSelf: "center"
                  }}
                >
                  {/* Separate div for the calendar */}
                  <div style={{ width: "100%" }}>
                    <BookingCalendar
                      onDateSelect={date => {
                        setSelectedDate(date);
                        setShowReservationsPopup(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="/tournaments" element={<TournamentsHome />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Popup Modal for Reservations */}
      {showReservationsPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.12)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowReservationsPopup(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              padding: "2rem",
              minWidth: "370px",
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflowY: "auto",
              textAlign: "center",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              Reservations for {selectedDate && 
                `${String(selectedDate.getDate()).padStart(2, '0')}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${selectedDate.getFullYear()}` }
            </h2>
            {reservationsForDate.length === 0 ? (
              <div style={{ color: "#888", fontSize: "1.1rem", marginBottom: "2rem" }}>
                No reservations for this date.
              </div>
            ) : (
              reservationsForDate.map((b, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#faf6ff",
                  borderRadius: "18px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                  padding: "1.2rem 1.2rem 1.2rem 0.8rem",
                  marginBottom: "1.2rem",
                  minWidth: 280,
                  textAlign: "left"
                }}>
                  <div style={{
                    width: 6,
                    height: 48,
                    borderRadius: 6,
                    background: "#fbbf24",
                    marginRight: 16
                  }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 2 }}>
                      {b.facility === "Fussball" && <span style={{ marginRight: 6 }}>👥</span>}
                      {b.facility === "Chair" && <span style={{ marginRight: 6 }}>💺</span>}
                      {b.facility === "Ps5" && <span style={{ marginRight: 6 }}>🎮</span>}
                      {b.facility === "Ping Pong" && <span style={{ marginRight: 6 }}>🏓</span>}
                      {b.facility}
                    </div>
                    <div style={{ fontSize: "1rem", color: "#444", marginBottom: 2 }}>
                      {new Date(b.start).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: "1rem", color: "#222", marginBottom: 2 }}>
                      {new Date(b.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(b.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: "1rem", color: "#b91c1c" }}>
                      {b.user_email}
                    </div>
                  </div>
                </div>
              ))
            )}
            <button
              onClick={() => setShowReservationsPopup(false)}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 2rem",
                background: "#ffa23a",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.2rem",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
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
