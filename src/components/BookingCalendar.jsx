import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { fetchActiveBookings } from "../api/bookings";

const today = new Date();

function BookingCalendar({ onDateSelect, reservations = [] }) {
  const [bookings, setBookings] = useState(reservations);
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    if (reservations.length) {
      setBookings(reservations);
    } else {
      fetchActiveBookings().then(setBookings);
    }
  }, [reservations]);

  // Map: yyyy-mm-dd => [bookings]
  const bookingsByDate = {};
  bookings.forEach(b => {
    const dateStr = b.start_time.split("T")[0];
    if (!bookingsByDate[dateStr]) bookingsByDate[dateStr] = [];
    bookingsByDate[dateStr].push(b);
  });

  // For marking days with reservations
  function tileContent({ date, view }) {
    if (view === "month") {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      if (bookingsByDate[dateStr]) {
        return (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ff4c4c",
              margin: "0 auto",
              marginTop: 2
            }}
          />
        );
      }
    }
    return null;
  }

  // Get reservations for selected date
  let selectedDateStr = null;
  let dayBookings = [];
  if (selectedDate) {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    selectedDateStr = `${yyyy}-${mm}-${dd}`;
    dayBookings = bookingsByDate[selectedDateStr] || [];
  }

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ textAlign: "center" }}>Reservations Calendar</h3>
      <Calendar
        onClickDay={date => {
          setSelectedDate(date);
          onDateSelect(date); // Call the parent callback with the selected date
        }}
        tileContent={tileContent}
      />
      {selectedDate && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ marginBottom: 8, textAlign: "center" }}>
            Reservations for {selectedDate.toLocaleDateString("en-GB")}
          </h4>
          {dayBookings.length === 0 ? (
            <div style={{ color: "#888", textAlign: "center" }}>No reservations for this day.</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {dayBookings.map((b, i) => {
                const start = new Date(b.start_time);
                const end = new Date(b.end_time);
                return (
                  <li key={i} style={{
                    marginBottom: 10,
                    background: "#fff7f7",
                    border: "1px solid #ffe0e0",
                    borderRadius: 8,
                    padding: "10px 14px"
                  }}>
                    <b>{b.facility_slug.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</b>
                    <br />
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <br />
                    <span style={{ color: "#b91c1c" }}>{b.user_email}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Popup component for showing reservations of a specific date
function ReservationsPopup({ selectedDate, bookings, closePopup }) {
  if (!selectedDate) return null;

  const yyyy = selectedDate.getFullYear();
  const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const dd = String(selectedDate.getDate()).padStart(2, "0");
  const selectedDateStr = `${yyyy}-${mm}-${dd}`; // yyyy-mm-dd

  // Bookings for the selected date
  const dayBookings = bookings.filter(
    b => b.start_time && b.start_time.startsWith(selectedDateStr)
  );

  return (
    <div>
      <h2>Reservations for {dd}-{mm}-{yyyy}</h2>
      {dayBookings.length === 0 ? (
        <div>No reservations for this date.</div>
      ) : (
        <ul>
          {dayBookings.map((b, i) => (
            <li key={i}>
              <b>{b.facility_slug.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</b>
              <br />
              {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <br />
              <span>{b.user_email}</span>
            </li>
          ))}
        </ul>
      )}

      {/* --- All Bookings Section --- */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ textAlign: "center" }}>All Bookings</h3>
        {bookings.length === 0 ? (
          <div style={{ color: "#888", textAlign: "center" }}>No bookings available.</div>
        ) : (
          <ul>
            {bookings.map((b, i) => (
              <li key={i} style={{
                marginBottom: 10,
                background: "#f0f7ff",
                border: "1px solid #cce0ff",
                borderRadius: 8,
                padding: "10px 14px"
              }}>
                <b>{b.facility_slug.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</b>
                <br />
                {b.start_time.slice(0, 10)}{" "}
                {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                <br />
                <span style={{ color: "#1c3cb9" }}>{b.user_email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={closePopup} style={{ marginTop: 24 }}>Close</button>
    </div>
  );
}

export default BookingCalendar;