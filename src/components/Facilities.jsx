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
        backgroundColor: "#f3f4f6",
      }}
    >
      <h2
        style={{
          fontSize: "1.8rem",
          margin: "0 0 1rem 0",
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