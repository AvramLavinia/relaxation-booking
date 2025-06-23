import React, { useState } from "react";
import { signUp } from "../api/auth";
import logo from "../assets/endava_logo.png";

export default function RegisterForm({ onSuccess, onLogin }) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      await signUp({ email, password, displayName });
      alert("Registration successful! You can now log in.");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logo} alt="Endava logo" style={styles.logo} />
        <h3 style={styles.slogan}>Create your space to relax & play!</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.subtitle}>Register</h2>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <button type="submit" style={styles.button}>Register</button>
        </form>
        <p style={styles.registerText}>
          Already have an account?{" "}
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
    width: "180px",           // Increased from 120px to 180px
    margin: "0 auto 1.5rem",  // Slightly more space below
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