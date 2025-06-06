import React, { useState, useEffect } from "react";
import Facilities from "./components/Facilities";
import { fetchActiveBookings } from "./api/bookings";
import RegisterForm from "./auth/regist";
import LoginForm from "./auth/login";
import ResetPasswordForm from "./auth/form";

function App() {
  const [user, setUser] = useState(null);
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState("login"); // "login" | "register" | "reset" | "main"

  // Try to restore user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      setUser(JSON.parse(userStr));
      setView("main");
    }
  }, []);

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem("user", JSON.stringify(userObj));
    setView("main");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setView("login");
  };

  const handleShowBookings = async () => {
    const active = await fetchActiveBookings();
    setBookings(active);
    setShowBookings(true);
  };

  // Auth views
  if (view === "login") {
    return (
      <div style={{ maxWidth: 400, margin: "3rem auto" }}>
        <LoginForm
          onLogin={handleLogin}
          onRegister={() => setView("register")}
          onReset={() => setView("reset")}
        />
      </div>
    );
  }
  if (view === "register") {
    return (
      <div style={{ maxWidth: 400, margin: "3rem auto" }}>
        <RegisterForm onSuccess={() => setView("login")} />
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setView("login")}>Back to Login</button>
        </div>
      </div>
    );
  }
  if (view === "reset") {
    return (
      <div style={{ maxWidth: 400, margin: "3rem auto" }}>
        <ResetPasswordForm />
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setView("login")}>Back to Login</button>
        </div>
      </div>
    );
  }

  // Main app view (user is logged in)
  return (
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
  );
}

export default App;