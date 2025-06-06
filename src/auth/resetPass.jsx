import React, { useState } from "react";

export default function ResetPasswordConfirm({ token }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await fetch("http://localhost:5000/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      setMessage("Password reset successful. You can now log in.");
    } catch (err) {
      setError("Failed to reset password.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: "2rem auto" }}>
      <h3>Set New Password</h3>
      <div>
        <label>
          New Password:
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      {message && <div style={{ color: "green", marginTop: "1rem" }}>{message}</div>}
      {error && <div style={{ color: "red", marginTop: "1rem" }}>{error}</div>}
      <button type="submit" style={{ marginTop: "1.5rem" }}>Reset Password</button>
    </form>
  );
}