import React from "react";
import { iconMap } from "./iconMap";

export default function FacilityCard({ facility, onBook }) {
  const Icon = iconMap[facility.slug];
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "1rem",
        textAlign: "center",
        width: "150px",
      }}
    >
      <div style={{ fontSize: "2rem" }}>{Icon && <Icon />}</div>
      <div>{facility.name}</div>
      <button onClick={onBook}>Book</button>
    </div>
  );
}