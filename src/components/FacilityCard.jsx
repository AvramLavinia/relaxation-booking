import React from "react";
import { iconMap } from "./iconMap";
 
// Card background colors (corrected slug keys)
const bgColorMap = {
  fussball: "#fed7d7",
  chair: "#d1fae5",
  "ping-pong": "#ffe0c7",  // updated slug without dashes
  ps5: "#ddd6fe",
};
 
// Button background colors
const buttonColorMap = {
  fussball: "#fda4af",
  chair: "#06b6d4",
  "ping-pong": "#fb923c",  // updated slug without dashes
  ps5: "#7c3aed",
};
 
export default function FacilityCard({ facility, onBook }) {
  const Icon = iconMap[facility.slug];
 
  console.log("Facility slug:", facility.slug);
 
  // normalize slugs that may come with inconsistent characters
  const normalizedSlug = facility.slug.replace(/[-_\s]/g, "").toLowerCase();
 
  const cardBg =
    bgColorMap[facility.slug] ||
    bgColorMap[normalizedSlug] ||
    "#f3f4f6";
 
  const buttonBg =
    buttonColorMap[facility.slug] ||
    buttonColorMap[normalizedSlug] ||
    "#6366f1";
 
  return (
    <div
      style={{
        borderRadius: "12px",
        padding: "1rem",
        textAlign: "center",
        width: "180px",
        height: "180px",
        backgroundColor: cardBg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ fontSize: "36px", color: "#1f2937" }}>{Icon && <Icon />}</div>
      <div style={{ fontWeight: "600", fontSize: "1rem", color: "#1f2937" }}>
        {facility.name}
      </div>
      <button
        onClick={onBook}
        style={{
          padding: "0.4rem 0.8rem",
          fontSize: "0.8rem",
          borderRadius: "5px",
          backgroundColor: buttonBg,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        Book
      </button>
    </div>
  );
}
 