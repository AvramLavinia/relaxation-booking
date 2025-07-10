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
 
  // Helper to check if selected date is today
  const isToday =
    date &&
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

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
    const startDateTimeLocal = new Date(`${dateStr}T${hour}:${minute}`);
    if (startDateTimeLocal <= new Date()) {
      alert("Please select a future time.");
      return;
    }
    await bookFacility({
      facilitySlug: facility.slug,
      start: `${dateStr}T${hour}:${minute}`, // send local time string
      durationMin: Number(duration),
    });
    alert(`Booked ${facility.name} for ${user.email} on ${dd}-${mm}-${yyyy} at ${hour}:${minute}`);
    onClose();
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
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const slots = bookings
          .filter(b => b.facility_slug === facility.slug && b.start_time.startsWith(dateStr))
          .map(b => {
            const start = new Date(b.start_time); // This is local if no 'Z'
const end = new Date(b.end_time);
            return { start, end, user_email: b.user_email };
          });
        setBusySlots(slots);
        console.log("Busy slots for", facility.slug, dateStr, slots);
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

  // Build a map of reserved hours to reservation info for the selected date
  const reservedHourMap = {};
  busySlots.forEach(({ start, end, user_email }) => {
    const hour = String(start.getHours()).padStart(2, "0");
    // Extract just the name before @endava.com
    let name = user_email;
    if (user_email && user_email.endsWith("@endava.com")) {
      name = user_email.split("@")[0];
    }
    reservedHourMap[hour] = name;
  });

  // Generate hour options: all hours from 08 to 22, but skip past hours if today
  const hourOptions = Array.from({ length: 15 }, (_, i) => {
    const h = String(i + 8).padStart(2, "0");
    if (isToday && Number(h) < currentHour) return null;

    // Check if there is a busy slot that fully occupies this hour
    const yyyy = date?.getFullYear();
    const mm = String(date?.getMonth() + 1).padStart(2, "0");
    const dd = String(date?.getDate()).padStart(2, "0");
    if (!date) return null;
    const hourStart = new Date(`${yyyy}-${mm}-${dd}T${h}:00`);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60000);

    // Hide hour if any busy slot fully occupies this hour
    const fullyOccupied = busySlots.some(({ start, end }) =>
      start.getTime() <= hourStart.getTime() &&
      end.getTime() >= hourEnd.getTime()
    );
    if (fullyOccupied) return null;

    // Check if ALL minute options for this hour are disabled
    let allMinutesDisabled = true;
    for (let m = 0; m < 60; m += 5) {
      const value = String(m).padStart(2, "0");
      const slotStart = new Date(`${yyyy}-${mm}-${dd}T${h}:${value}`);
      const slotEnd = new Date(slotStart.getTime() + Number(duration) * 60000);
      const busy = busySlots.find(({ start, end }) =>
        slotStart < end && slotEnd > start
      );
      if (
        (!isToday || Number(h) > currentHour || (Number(h) === currentHour && Number(value) > currentMinute)) &&
        !busy
      ) {
        allMinutesDisabled = false;
        break;
      }
    }

    return {
      value: h,
      label: h,
      isDisabled: allMinutesDisabled
    };
  }).filter(Boolean);

  const minuteOptions = Array.from({ length: 12 }, (_, i) => {
    const value = String(i * 5).padStart(2, "0");
    let reservedBy = null;
    let isDisabled = false;
    if (date && hour) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const slotStart = new Date(`${yyyy}-${mm}-${dd}T${hour}:${value}`);
      const slotEnd = new Date(slotStart.getTime() + Number(duration) * 60000);

      // Disable if this interval overlaps with any busy slot
      const busy = busySlots.find(({ start, end, user_email }) =>
        slotStart < end && slotEnd > start
      );
      if (busy) {
        reservedBy = busy.user_email;
        if (reservedBy && reservedBy.endsWith("@endava.com")) {
          reservedBy = reservedBy.split("@")[0];
        }
        isDisabled = true;
      }
    }
    return {
      value,
      label: reservedBy ? `${value} (${reservedBy})` : value,
      isDisabled
    };
  }).filter(opt => {
    if (!isToday) return true;
    if (Number(hour) > currentHour) return true;
    if (Number(hour) === currentHour) return Number(opt.value) > currentMinute;
    return false;
  });

  // Auto-select first available hour if current is not available
  useEffect(() => {
    if (!hourOptions.find(opt => opt.value === hour) && hourOptions.length > 0) {
      setHour(hourOptions[0].value);
    }
  }, [hourOptions, duration]);

  // Auto-select first available minute if current is not available
  useEffect(() => {
    if (!minuteOptions.find(opt => opt.value === minute) && minuteOptions.length > 0) {
      setMinute(minuteOptions[0].value);
    }
  }, [minuteOptions, duration, hour]);

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
                    isOptionDisabled={opt => opt.isDisabled}
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
              {minuteOptions.length === 0 && (
                <div style={{ color: "#b91c1c", marginTop: 8 }}>
                  No available minutes for this hour and duration.
                </div>
              )}
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
                disabled={minuteOptions.length === 0 || hourOptions.length === 0}
                style={{
                  flex: 1,
                  padding: "1rem 0",
                  backgroundColor: "#00bcd4",
                  color: "#fff",
                  border: "none",
                  borderRadius: "16px",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  cursor: minuteOptions.length === 0 || hourOptions.length === 0 ? "not-allowed" : "pointer",
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

