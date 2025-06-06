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
    <div>
      <h2>Facilities</h2>
      <div style={{ display: "flex", gap: "2rem" }}>
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