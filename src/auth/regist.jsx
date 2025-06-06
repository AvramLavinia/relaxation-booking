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
      setError("Parolele nu se potrivesc!");
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
          <h2 style={{ marginBottom: '1rem' }}>Înregistrare</h2>
          <input
            type="email"
            placeholder="Email"
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
            placeholder="Parolă"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Confirmă parola"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <button type="submit" style={styles.button}>Înregistrează-te</button>
        </form>
        <p style={styles.registerText}>
          Ai deja cont?{" "}
          <button type="button" style={styles.link} onClick={e => { e.preventDefault(); if (onLogin) onLogin(); }}>
            Autentificare
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#f5f7fa',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    width: '120px',
    margin: '0 auto 1rem',
    display: 'block',
  },
  slogan: {
    color: '#ff4c4c',
    marginBottom: '1.5rem',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    marginBottom: '1rem',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
  },
  button: {
    backgroundColor: '#ff4c4c',
    color: '#fff',
    border: 'none',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  registerText: {
    marginTop: '1rem',
    fontSize: '0.9rem',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};