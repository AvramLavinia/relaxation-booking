import React, { useState } from "react";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // This should POST to your backend's /auth/reset-password endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      // Replace with your backend endpoint when implemented
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
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: "2rem auto" }}>
      <h3>Reset Password</h3>
      <div>
        <label>
          Email:
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      {message && <div style={{ color: "green", marginTop: "1rem" }}>{message}</div>}
      {error && <div style={{ color: "red", marginTop: "1rem" }}>{error}</div>}
      <button type="submit" style={{ marginTop: "1.5rem" }}>Send Reset Link</button>
    </form>
  );
}