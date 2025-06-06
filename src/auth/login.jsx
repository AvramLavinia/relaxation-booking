import React, { useState } from "react";
import { logIn } from "../api/auth";
import logo from "../assets/endava_logo.png"; // Make sure this image exists

export default function LoginForm({ onLogin, onRegister, onReset }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // use 'password' for consistency
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { token, user } = await logIn({ email, password });
      localStorage.setItem("token", token);
      if (onLogin) onLogin(user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logo} alt="Endava logo" style={styles.logo} />
        <h3 style={styles.slogan}>Game on. Stress off.</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={{ marginBottom: '1rem' }}>Autentificare</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.registerText}>
          Nu ai cont?{" "}
          <a href="#" style={styles.link} onClick={e => { e.preventDefault(); if (onRegister) onRegister(); }}>
            Înregistrează-te
          </a>
        </p>
        <p style={styles.registerText}>
          <button type="button" style={styles.link} onClick={e => { e.preventDefault(); if (onReset) onReset(); }}>
            Ai uitat parola?
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