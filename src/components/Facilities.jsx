import React, { useState, useEffect } from "react";
import FacilityCard from "./FacilityCard";
import BookingModal from "./BookingModal";
import { fetchFacilities } from "../api/facilities";

export default function Facilities({ user }) {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    fetchFacilities().then(setFacilities);
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(135deg, #c084fc, #f9a8d4, #fcd34d)",
      }}
    >
      <h2
        style={{
          fontSize: "1.8rem",
          margin: "0.5rem 0 1rem 0",  // ✅ adds space only above
          fontWeight: "600",
          color: "#1f2937",
        }}
      >
        Facilities
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: "1rem",
          width: "100%",
          maxWidth: "500px",
          justifyItems: "center",
          marginBottom: "0.9rem",
        }}
      >
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            onBook={() => setSelectedFacility(facility)}
          />
        ))}
      </div>

      {selectedFacility && (
        <BookingModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          user={user}
        />
      )}
    </div>
  );
}
