import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { bookFacility, fetchActiveBookings } from "../api/bookings";
 
export default function BookingModal({ facility, onClose, user }) {
  const [date, setDate] = useState(null);
  const [hour, setHour] = useState(() => String(new Date().getHours()).padStart(2, "0"));
  const [minute, setMinute] = useState(() => String(new Date().getMinutes()).padStart(2, "0"));
  const [duration, setDuration] = useState(60);
  const [busySlots, setBusySlots] = useState([]); // [{start: Date, end: Date}]
  const [loadingSlots, setLoadingSlots] = useState(false);
 
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
 
  const isToday = date === todayStr;
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      alert("Please select a date.");
      return;
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const startDateTime = new Date(`${dateStr}T${hour}:${minute}`);
    if (startDateTime <= new Date()) {
      alert("Please select a future time.");
      return;
    }
    try {
      await bookFacility({
        facilitySlug: facility.slug,
        start: `${dateStr}T${hour}:${minute}`,
        durationMin: Number(duration),
      });
      alert(`Booked ${facility.name} for ${user.email} on ${dd}-${mm}-${yyyy} at ${hour}:${minute}`);
      onClose();
    } catch (err) {
      alert("Facility is occupied during that interval. Please choose another time.");
    }
  };
 

  // Fetch busy slots when facility or date changes
  useEffect(() => {
    async function fetchBusy() {
      if (!facility || !date) {
        setBusySlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const bookings = await fetchActiveBookings();
        // Only consider bookings for this facility and selected date
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        // The backend returns: { id, facility_id, user_id, start_time, end_time, status, user_email, facility_slug }
        // Use facility_slug and start_time/end_time
        const slots = bookings
          .filter(b => b.facility_slug === facility.slug && b.start_time.startsWith(dateStr))
          .map(b => {
            const start = new Date(b.start_time);
            const end = new Date(b.end_time);
            return { start, end };
          });
        setBusySlots(slots);
      } catch (e) {
        setBusySlots([]);
      }
      setLoadingSlots(false);
    }
    fetchBusy();
  }, [facility, date]);

  // Helper to check if a slot is busy
  function isSlotBusy(h, m) {
    if (!date) return false;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const slotStart = new Date(`${yyyy}-${mm}-${dd}T${h}:${m}`);
    const slotEnd = new Date(slotStart.getTime() + Number(duration) * 60000);
    return busySlots.some(({ start, end }) =>
      (slotStart < end && slotEnd > start)
    );
  }

  // Only allow hours/minutes that are not busy
  const hourOptions = Array.from({ length: 15 }, (_, i) => {
    const h = String(i + 8).padStart(2, "0");
    let available = false;
    for (let m = 0; m < 60; m += 5) {
      if (!isSlotBusy(h, String(m).padStart(2, "0"))) {
        available = true;
        break;
      }
    }
    return available ? { value: h, label: h } : null;
  }).filter(Boolean);

  const minuteOptions = Array.from({ length: 12 }, (_, i) => {
    const value = String(i * 5).padStart(2, "0");
    return {
      value,
      label: value,
    };
  }).filter(opt => {
    if (!isToday || Number(hour) > currentHour || (Number(hour) === currentHour && Number(opt.value) > currentMinute)) {
      return !isSlotBusy(hour, opt.value);
    }
    return false;
  });

  // Auto-select first available hour/minute if current is not available
  useEffect(() => {
    if (!hourOptions.find(opt => opt.value === hour) && hourOptions.length > 0) {
      setHour(hourOptions[0].value);
    }
  }, [hourOptions]);

  useEffect(() => {
    if (!minuteOptions.find(opt => opt.value === minute) && minuteOptions.length > 0) {
      setMinute(minuteOptions[0].value);
    }
  }, [minuteOptions]);

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose} // <-- close when clicking overlay
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "28px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
          padding: "2.5rem 2rem 2rem 2rem",
          minWidth: "350px",
          maxWidth: "95vw",
          fontFamily: "'Poppins', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch"
        }}
        onClick={e => e.stopPropagation()} // <-- prevent close when clicking inside modal
      >
        <div style={{
          background: "#f9fafb",
          borderRadius: "18px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: "2rem 1.5rem 1.5rem 1.5rem",
          marginBottom: "0.5rem"
        }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: "0 0 1.5rem 0",
            letterSpacing: "-1px"
          }}>
            Book {facility.name}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
            <div>
              <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Your Email:</label>
              <input
                value={user.email}
                disabled
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: "8px",
                  border: "1.5px solid #e5e7eb",
                  backgroundColor: "#f3f4f6",
                  fontSize: "1rem"
                }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Date:</label>
              <DatePicker
                selected={date}
                onChange={dateObj => setDate(dateObj)}
                dateFormat="dd-MM-yyyy"
                minDate={new Date()}
                placeholderText="dd-mm-yyyy"
                required
                customInput={
                  <input
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      border: "1.5px solid #e5e7eb",
                      fontSize: "1rem"
                    }}
                  />
                }
              />
            </div>
            <div>
              <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Time:</label>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <Select
                    value={hourOptions.find(opt => opt.value === hour)}
                    onChange={opt => setHour(opt.value)}
                    options={hourOptions}
                    menuPlacement="auto"
                    menuPosition="fixed"
                    isLoading={loadingSlots}
                    isDisabled={loadingSlots || hourOptions.length === 0}
                    placeholder={loadingSlots ? "Loading..." : hourOptions.length === 0 ? "No hours" : undefined}
                    styles={{
                      control: provided => ({
                        ...provided,
                        minHeight: "44px",
                        borderRadius: "8px",
                        fontSize: "1rem"
                      }),
                      menu: provided => ({
                        ...provided,
                        zIndex: 9999,
                        fontSize: "1rem"
                      })
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Select
                    value={minuteOptions.find(opt => opt.value === minute)}
                    onChange={opt => setMinute(opt.value)}
                    options={minuteOptions}
                    menuPlacement="auto"
                    menuPosition="fixed"
                    isLoading={loadingSlots}
                    isDisabled={loadingSlots || minuteOptions.length === 0}
                    placeholder={loadingSlots ? "Loading..." : minuteOptions.length === 0 ? "No minutes" : undefined}
                    styles={{
                      control: provided => ({
                        ...provided,
                        minHeight: "44px",
                        borderRadius: "8px",
                        fontSize: "1rem"
                      }),
                      menu: provided => ({
                        ...provided,
                        zIndex: 9999,
                        fontSize: "1rem"
                      })
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Duration:</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: "8px",
                  border: "1.5px solid #e5e7eb",
                  fontSize: "1rem"
                }}
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={40}>40 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1.5rem",
              marginTop: "2.5rem"
            }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "1rem 0",
                  backgroundColor: "#00bcd4",
                  color: "#fff",
                  border: "none",
                  borderRadius: "16px",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(125,223,195,0.10)",
                  transition: "background 0.2s"
                }}
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "1rem 0",
                  backgroundColor: "#fb7185", // soft red
                  color: "#fff",
                  border: "none",
                  borderRadius: "16px",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(252,165,165,0.10)",
                  transition: "background 0.2s"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

