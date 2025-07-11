import React from "react";
import { iconMap } from "./iconMap";
 
// Card background colors (corrected slug keys)
const bgColorMap = {
  fussball: "#fff",        // white
  chair: "#f5f7fa",        // light gray
  "ping-pong": "#ffa23a",  // orange
  ps5: "#1a237e",          // navy
};
 
// Button background colors
const buttonColorMap = {
  fussball: "#ffa23a",     // orange
  chair: "#1a237e",        // navy
  "ping-pong": "#ffa23a",  // orange
  ps5: "#1a237e",          // navy
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
        borderRadius: "16px",
        padding: "1.2rem",
        textAlign: "center",
        width: "200px",
        height: "200px",
        backgroundColor: cardBg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.10)",
        fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
        transition: "box-shadow 0.2s",
      }}
    >
      <div style={{ fontSize: "56px", color: "#1f2937", marginBottom: "0.5rem" }}>
        {Icon && <Icon />}
      </div>
      <div style={{
        fontWeight: 700,
        fontSize: "1.25rem",
        color: "#1f2937",
        letterSpacing: "0.5px",
        marginBottom: "0.5rem",
        fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif"
      }}>
        {facility.name}
      </div>
      <button
        onClick={onBook}
        style={{
          padding: "0.6rem 1.2rem",
          fontSize: "1rem",
          borderRadius: "8px",
          backgroundColor: buttonBg,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "background 0.2s, box-shadow 0.2s",
        }}
      >
        Book
      </button>
    </div>
  );
}
