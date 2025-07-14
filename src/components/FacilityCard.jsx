import React from "react";
import { iconMap } from "./iconMap";

const borderColorMap = {
  fussball: "#ff6600",
  chair: "#1a237e",
  "ping-pong": "#ff6600",
  ps5: "#1a237e"
};

const buttonColorMap = {
  fussball: "#ff6600",
  chair: "#1a237e",
  "ping-pong": "#ff6600",
  ps5: "#1a237e"
};

export default function FacilityCard({ facility, onBook }) {
  const Icon = iconMap[facility.slug];
  const normalizedSlug = facility.slug.replace(/[-_\s]/g, "").toLowerCase();

  // Fundal alb sau gri deschis
  const bgColor = normalizedSlug === "chair" ? "#f5f7fa" : "#fff";

  return (
    <div
      style={{
        borderRadius: "16px",
        padding: "1.2rem",
        textAlign: "center",
        width: "220px",
        height: "220px",
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.10)",
        fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
        border: `2.5px solid ${borderColorMap[normalizedSlug] || "#ff6600"}`,
        transition: "box-shadow 0.2s"
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
        marginBottom: "0.5rem"
      }}>
        {facility.name}
      </div>
      <button
        onClick={onBook}
        style={{
          padding: "0.6rem 1.2rem",
          fontSize: "1rem",
          borderRadius: "8px",
          backgroundColor: buttonColorMap[normalizedSlug] || "#ff6600",
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
