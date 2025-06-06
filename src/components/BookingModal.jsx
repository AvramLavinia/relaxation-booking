import React, { useState } from "react";
import { bookFacility } from "../api/bookings";

export default function BookingModal({ facility, onClose, user }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bookFacility({
        facilitySlug: facility.slug,
        start: `${date}T${time}`,
        durationMin: 60,
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
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "2rem",
        zIndex: 1000,
      }}
    >
      <h3>Book {facility.name}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Your Email:
            <input
              value={user.email}
              disabled
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>
            Time:
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <button type="submit">Confirm</button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: "1rem" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

