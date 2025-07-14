import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { fetchActiveBookings } from "../api/bookings";

function BookingCalendar({ onDateSelect, reservations = [] }) {
  const [bookings, setBookings] = useState(reservations);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch bookings if not provided via props
  useEffect(() => {
    if (reservations.length) {
      setBookings(reservations);
    } else {
      fetchActiveBookings().then(setBookings);
    }
  }, [reservations]);

  // Map bookings by date string (yyyy-mm-dd)
  const bookingsByDate = {};
  bookings.forEach((b) => {
    const dateStr = b.start_time.split("T")[0];
    if (!bookingsByDate[dateStr]) bookingsByDate[dateStr] = [];
    bookingsByDate[dateStr].push(b);
  });

  // Calendar tile marker for booked days
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
              background: "#ff6600",
              margin: "0 auto",
              marginTop: 2,
            }}
          />
        );
      }
    }
    return null;
  }

  return (
    <div
      style={{
        padding: 24,
        background: "#fff",
        border: "2.5px solid #ff6600",
        borderRadius: "18px",
        boxShadow: "0 4px 16px rgba(255,102,0,0.06)",
        minWidth: 320,
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          marginBottom: 16,
          color: "#1a2238",
          fontWeight: 700,
          fontSize: "1.3rem",
          letterSpacing: "0.5px",
        }}
      >
        Reservations Calendar
      </h3>
      <Calendar
        onClickDay={(date) => {
          setSelectedDate(date);
          if (onDateSelect) onDateSelect(date);
        }}
        tileContent={tileContent}
        calendarType="iso8601"
        prev2Label={null}
        next2Label={null}
        className="endava-calendar"
      />
    </div>
  );
}

export default BookingCalendar;