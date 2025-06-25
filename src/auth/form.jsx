import React, { useState } from "react";
import logo from "../assets/endava_logo.png";

export default function ResetPasswordForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMessage("If your email exists, a reset link has been sent.");
    } catch (err) {
      setError("Failed to request password reset.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logo} alt="Endava logo" style={styles.logo} />
        <h3 style={styles.slogan}>Reset your password</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.subtitle}>Reset Password</h2>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          {message && <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>}
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <button type="submit" style={styles.button}>Send Reset Link</button>
        </form>
        <p style={styles.registerText}>
          Remembered your password?{" "}
          <button
            type="button"
            style={styles.link}
            onClick={e => { e.preventDefault(); if (onLogin) onLogin(); }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f5f7fa",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "320px"
  },
  logo: {
    width: "180px",
    margin: "0 auto 1.5rem",
    display: "block"
  },
  slogan: {
    color: "#ff4c4c",
    marginBottom: "1.5rem",
    fontWeight: "bold"
  },
  subtitle: {
    marginBottom: "1rem"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  input: {
    marginBottom: "1rem",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "6px"
  },
  button: {
    backgroundColor: "#ff4c4c",
    color: "#fff",
    border: "none",
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: "6px",
    cursor: "pointer"
  },
  registerText: {
    marginTop: "1rem",
    fontSize: "0.9rem"
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    font: "inherit"
  }
};