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
              background: "#ff4c4c",
              margin: "0 auto",
              marginTop: 2,
            }}
          />
        );
      }
    }
    return null;
  }

  // Get bookings for selected date
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
    <div
      style={{
        padding: 24,
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        minWidth: 320,
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: 16 }}>
        Reservations Calendar
      </h3>
      <Calendar
        onClickDay={(date) => {
          setSelectedDate(date);
          if (onDateSelect) onDateSelect(date);
        }}
        tileContent={tileContent}
      />
    </div>
  );
}

export default BookingCalendar;