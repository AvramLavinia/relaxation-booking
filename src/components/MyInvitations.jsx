// Example: src/components/MyInvitations.jsx
import React, { useEffect, useState } from "react";
import { API_URL } from "../api/auth";

export default function MyInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/tournaments/my-invitations`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setInvitations(data.invitations || []);
        if ((data.invitations || []).length > 0) setShowModal(true);
      });
  }, []);

  const acceptInvite = async (invitationId, tournamentId) => {
    await fetch(`${API_URL}/tournaments/${tournamentId}/invitations/${invitationId}/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    setInvitations(invitations.filter(inv => inv.id !== invitationId));
    alert("You have joined the tournament!");
  };

  const declineInvite = async (invitationId, tournamentId) => {
    await fetch(`${API_URL}/tournaments/${tournamentId}/invitations/${invitationId}/decline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    setInvitations(invitations.filter(inv => inv.id !== invitationId));
    alert("You have declined the tournament invitation.");
  };

  // Modal popup for invitations
  if (showModal && invitations.length > 0) {
    return (
      <div style={{
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          padding: "2rem 1.5rem 1.5rem 1.5rem",
          minWidth: 350
        }}>
          <h2>You have tournament invitations!</h2>
          <ul>
            {invitations.map(inv => (
              <li key={inv.id} style={{ marginBottom: 12 }}>
                Tournament: <strong>{inv.tournament_name}</strong>
                <button
                  onClick={() => acceptInvite(inv.id, inv.tournament_id)}
                  style={{ marginLeft: 8, background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, padding: "0.3rem 0.7rem" }}
                >Accept</button>
                <button
                  onClick={() => declineInvite(inv.id, inv.tournament_id)}
                  style={{ marginLeft: 8, background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "0.3rem 0.7rem" }}
                >Decline</button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowModal(false)}
            style={{ marginTop: 16, background: "#ddd", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem" }}
          >Close</button>
        </div>
      </div>
    );
  }

  // Fallback: show nothing or a simple message if no invitations
  return null;
}