import React, { useState } from "react";
import { bookFacility } from "../api/bookings";
import Select from "react-select";

export default function BookingModal({ facility, onClose, user }) {
  const [date, setDate] = useState("");
  const [hour, setHour] = useState(() => String(new Date().getHours()).padStart(2, "0"));
  const [minute, setMinute] = useState(() => String(new Date().getMinutes()).padStart(2, "0"));
  const [duration, setDuration] = useState(60);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const isToday = date === todayStr;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startDateTime = new Date(`${date}T${hour}:${minute}`);
    if (startDateTime <= now) {
      alert("Please select a future time.");
      return;
    }
    try {
      await bookFacility({
        facilitySlug: facility.slug,
        start: `${date}T${hour}:${minute}`,
        durationMin: Number(duration),
      });
      alert(`Booked ${facility.name} for ${user.email} on ${date} at ${hour}:${minute}`);
      onClose();
    } catch (err) {
      alert("Booking failed!");
    }
  };

  const hourOptions = Array.from({ length: 15 }, (_, i) => ({
    value: String(i + 8).padStart(2, "0"),
    label: String(i + 8).padStart(2, "0"),
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: String(i).padStart(2, "0"),
    label: String(i).padStart(2, "0"),
  })).filter(opt => !isToday || Number(hour) > currentHour || (Number(hour) === currentHour && Number(opt.value) > currentMinute));

  return (
    <div style={{
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "2rem",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
        minWidth: "320px",
        fontFamily: "'Poppins', sans-serif"
      }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
          Book {facility.name}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>Your Email:</label>
            <input
              value={user.email}
              disabled
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db", backgroundColor: "#e5e7eb" }}
            />
          </div>
          <div>
            <label>Date:</label>
            <input
  type="date"
  value={date}
  min={new Date().toISOString().split("T")[0]}
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
            <div style={{ display: "flex", gap: "1rem" }}>
  <div style={{ flex: 1, minWidth: 0, width: 100 }}>
    <Select
      value={hourOptions.find(opt => opt.value === hour)}
      onChange={opt => setHour(opt.value)}
      options={hourOptions}
      menuPlacement="auto"
      menuPosition="fixed"
      styles={{
        menu: (provided, state) => ({
          ...provided,
          maxHeight: 180,
          width: state.selectProps.menuWidth || state.selectProps.controlWidth || provided.width,
          minWidth: 0,
          zIndex: 9999,
          fontSize: "1rem"
        }),
        control: provided => ({
          ...provided,
          minHeight: "38px",
          fontSize: "1rem"
        }),
        container: provided => ({
          ...provided,
          flex: 1,
          minWidth: 0
        }),
        option: provided => ({
          ...provided,
          fontSize: "1rem",
          padding: "8px 12px"
        }),
        menu: provided => ({
          ...provided,
          width: 100, // match container width
        }),
      }}
    />
  </div>
  <div style={{ flex: 1, minWidth: 0, width: 100 }}>
    <Select
      value={minuteOptions.find(opt => opt.value === minute)}
      onChange={opt => setMinute(opt.value)}
      options={minuteOptions}
      menuPlacement="auto"
      menuPosition="fixed"
      styles={{
        menu: (provided, state) => ({
          ...provided,
          maxHeight: 180,
          width: state.selectProps.menuWidth || state.selectProps.controlWidth || provided.width,
          minWidth: 0,
          zIndex: 9999,
          fontSize: "1rem"
        }),
        control: provided => ({
          ...provided,
          minHeight: "38px",
          fontSize: "1rem"
        }),
        container: provided => ({
          ...provided,
          flex: 1,
          minWidth: 0
        }),
        option: provided => ({
          ...provided,
          fontSize: "1rem",
          padding: "8px 12px"
        }),
        menu: provided => ({
          ...provided,
          width: 100, // match container width
        }),
      }}
    />
  </div>
</div>
          </div>
          <div>
            <label>Duration:</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db" }}
            >
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={40}>40 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit" style={{ padding: "0.5rem 1rem", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Confirm
            </button>
            <button type="button" onClick={onClose} style={{ padding: "0.5rem 1rem", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
