import React, { useState } from "react";
import { bookFacility } from "../api/bookings";
 
export default function BookingModal({ facility, onClose, user }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookFacility({
        facilitySlug: facility.slug,
        start: `${date}T${time}`,
        durationMin: Number(duration),
      });
      alert(`Booked ${facility.name} for ${user.email} on ${date} at ${time}`);
      onClose();
    } catch (err) {
      alert("Booking failed!");
    }
  };
 
  return (
    <div
      style={{
        position: "fixed",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -30%)",
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "2rem",
        zIndex: 1000,
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
        minWidth: "320px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
        Book {facility.name}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>Your Email:</label>
          <input
            value={user.email}
            disabled
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: "#e5e7eb",
            }}
          />
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
            }}
          />
        </div>
        <div>
          <label>Time:</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
            }}
          />
        </div>
        <div>
          <label>Duration:</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
            }}
          >
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={40}>40 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#059669")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#10b981")}
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
 