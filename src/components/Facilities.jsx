import React, { useState, useEffect } from "react";
import FacilityCard from "./FacilityCard";
import BookingModal from "./BookingModal";
import { fetchFacilities } from "../api/facilities";

export default function Facilities({ user, bookings }) {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    fetchFacilities().then(setFacilities);
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1.5rem",
        width: "100%",
        maxWidth: "500px",
        justifyItems: "center",
        marginBottom: "1.2rem",
      }}
    >
      {facilities.map((facility) => (
        <FacilityCard
          key={facility.id}
          facility={facility}
          onBook={() => setSelectedFacility(facility)}
        />
      ))}
      {selectedFacility && (
        <BookingModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          user={user}
          bookings={bookings}
        />
      )}
    </div>
  );
}
