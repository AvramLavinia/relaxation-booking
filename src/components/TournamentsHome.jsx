import React, { useState, useEffect } from "react";
import Tournaments from "./Tournaments";
import { API_URL } from "../api/auth";

async function updateTournamentOnBackend(id, update, token) {
  const resp = await fetch(`${API_URL}/tournaments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(update)
  });
  if (!resp.ok) throw new Error("Failed to update tournament");
  return resp.json();
}

function generateChampionshipMatches(playerIds) {
  const n = playerIds.length;
  let players = [...playerIds];
  if (n % 2 !== 0) players.push(null); // Add a bye if odd number

  const numRounds = players.length - 1;
  const half = players.length / 2;
  const rounds = [];

  // Tur
  for (let round = 0; round < numRounds; round++) {
    const matches = [];
    for (let i = 0; i < half; i++) {
      const p1 = players[i];
      const p2 = players[players.length - 1 - i];
      if (p1 != null && p2 != null) {
        matches.push({
          player1: p1,
          player2: p2,
          score1: null,
          score2: null
        });
      }
    }
    rounds.push(matches);
    // Rotate players except the first
    players = [players[0], ...players.slice(-1), ...players.slice(1, -1)];
  }

  // Retur (inversează player1/player2)
  const returnRounds = rounds.map(round =>
    round.map(match => ({
      player1: match.player2,
      player2: match.player1,
      score1: null,
      score2: null
    }))
  );
  return [...rounds, ...returnRounds];
}

const TournamentsHome = () => {
  const [view, setView] = useState("home");
  const [tournaments, setTournaments] = useState([]);
  const [users, setUsers] = useState([]);
  const [inviteMessage, setInviteMessage] = useState("");
  const [manualStandings, setManualStandings] = useState({});
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch tournaments from backend
  useEffect(() => {
    fetch(`${API_URL}/tournaments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTournaments(data.tournaments || []));
  }, [token, view]);

  // Fetch users for ID->name mapping
  useEffect(() => {
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, [token]);

  // Helper: map user ID to display name/email
  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? (user.display_name || user.email) : id;
  };

  // Add tournament via backend
  const handleAddTournament = async (newTournament) => {
    const resp = await fetch(`${API_URL}/tournaments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newTournament)
    });
    if (!resp.ok) {
      alert("Failed to create tournament");
      return;
    }
    const data = await resp.json();
    setTournaments(prev => [...prev, data.tournament]);
    setInviteMessage("Your invitations are sent!");
    setView("list");
  };

  // Delete tournament via backend
  const handleDeleteTournament = async (id) => {
    await fetch(`${API_URL}/tournaments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setTournaments(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (view && typeof view === "object" && view.type === "manage") {
      const t = tournaments.find(t => t.id === view.id);
      if (t) {
        if (t.standings) setManualStandings({ ...t.standings });
        else {
          const obj = {};
          ([t.created_by, ...(t.invited || [])]).forEach(id => obj[id] = 0);
          setManualStandings(obj);
        }
      }
    }
  }, [view, tournaments]);

  if (view === "create") {
    return (
      <div style={styles.centeredContainer}>
        <div style={styles.card}>
          <Tournaments
            onConfirm={handleAddTournament}
            onCancel={() => setView("home")}
          />
        </div>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div style={styles.centeredContainer}>
        <div style={styles.card}>
          <h2 style={{ fontWeight: 700, color: "#22223b", marginBottom: "1.5rem" }}>
            Existing Tournaments
          </h2>
          {tournaments.length === 0 && (
            <div style={{ color: "#888", marginBottom: "1.5rem" }}>
              No tournaments created yet.
            </div>
          )}
          {tournaments.map((t) => (
            <div key={t.id} style={styles.item}>
              <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: 4 }}>
                {t.name}
              </div>
              <div style={{ fontSize: "0.97rem", color: "#444" }}>
                <span style={{ marginRight: 12 }}>🎮 <b>Game:</b> {t.game}</span>
                <span style={{ marginRight: 12 }}>👥 <b>Players:</b> {t.players}</span>
                <span>🏆 <b>Type:</b> {t.type}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <button
                  style={styles.manageButton}
                  onClick={() => setView({ type: "manage", id: t.id })}
                >
                  Manage
                </button>
                {t.created_by === currentUser.id && (
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeleteTournament(t.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {inviteMessage && (
            <div style={{
              background: "#d1fae5",
              color: "#065f46",
              padding: "1rem",
              borderRadius: "8px",
              margin: "1rem 0",
              textAlign: "center",
              fontWeight: "bold"
            }}>
              {inviteMessage}
            </div>
          )}
          <button onClick={() => setView("home")} style={styles.backButton}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (typeof view === "object" && view.type === "manage") {
    const t = tournaments.find(t => t.id === view.id);
    const invited = Array.isArray(t.invited)
      ? t.invited
      : (typeof t.invited === "string" ? JSON.parse(t.invited) : []);
    const matches = Array.isArray(t.matches)
      ? t.matches
      : (typeof t.matches === "string" ? JSON.parse(t.matches) : []);

    // Save manual points to backend
    const handleSavePoints = async () => {
      try {
        const data = await updateTournamentOnBackend(t.id, { standings: manualStandings }, token);
        setTournaments(ts => ts.map(tt => tt.id === t.id ? data.tournament : tt));
        alert("Points saved!");
      } catch (err) {
        alert("Failed to save points");
      }
    };

    // Winner for Elimination
    let winner = null;
    if (t.type === "Elimination" && matches && matches.length > 0) {
      const lastRound = matches[matches.length - 1];
      if (lastRound.length === 1) {
        const m = lastRound[0];
        if (m.score1 != null && m.score2 != null) {
          if (m.score1 > m.score2) winner = m.player1;
          else if (m.score2 > m.score1) winner = m.player2;
        }
      }
    }

    // Make this function async!
    const handleScoreChange = async (roundIdx, matchIdx, field, value) => {
      const updatedMatches = matches.map((round, rIdx) =>
        rIdx === roundIdx
          ? round.map((match, mIdx) =>
              mIdx === matchIdx
                ? { ...match, [field]: value }
                : match
            )
          : round
      );
      // Persist to backend
      try {
        const data = await updateTournamentOnBackend(t.id, { matches: updatedMatches }, token);
        setTournaments(ts => ts.map(tt => tt.id === t.id ? data.tournament : tt));
      } catch (err) {
        alert("Failed to update score");
      }
    };

    // Also use matches (not t.matches) here!
    const handleAdvanceWinners = async (roundIdx) => {
      const updatedMatches = JSON.parse(JSON.stringify(matches));
      const round = updatedMatches[roundIdx];
      const winners = round
        .map(m => {
          if (m.score1 == null || m.score2 == null) return null;
          if (m.score1 > m.score2) return m.player1;
          if (m.score2 > m.score1) return m.player2;
          return null;
        })
        .filter(Boolean);
      for (let i = 0; i < winners.length; i += 2) {
        updatedMatches[roundIdx + 1][i / 2].player1 = winners[i] || null;
        updatedMatches[roundIdx + 1][i / 2].player2 = winners[i + 1] || null;
      }
      try {
        const data = await updateTournamentOnBackend(t.id, { matches: updatedMatches }, token);
        setTournaments(ts => ts.map(tt => tt.id === t.id ? data.tournament : tt));
      } catch (err) {
        alert("Failed to advance winners");
      }
    };

    // Calculate standings automatically
    const points = {};
    [t.created_by, ...invited].forEach(id => { points[id] = 0; });

    matches.forEach(round => {
      round.forEach(m => {
        if (m.score1 != null && m.score2 != null) {
          if (m.score1 > m.score2) {
            points[m.player1] += 3; // Win = 3 pts
          } else if (m.score2 > m.score1) {
            points[m.player2] += 3;
          } else {
            points[m.player1] += 1; // Draw = 1 pt each
            points[m.player2] += 1;
          }
        }
      });
    });

    // Calculează golaverajul pentru fiecare jucător
    const goalDiffs = {};
    [t.created_by, ...invited].forEach(id => { goalDiffs[id] = 0; });

    matches.forEach(round => {
      round.forEach(m => {
        if (m.score1 != null && m.score2 != null) {
          goalDiffs[m.player1] += Number(m.score1) - Number(m.score2);
          goalDiffs[m.player2] += Number(m.score2) - Number(m.score1);
        }
      });
    });

    const maxPoints = Math.max(...Object.values(points));
    const winners = Object.entries(points)
      .filter(([id, pts]) => pts === maxPoints && maxPoints > 0)
      .map(([id]) => getUserName(Number(id)));

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa"
      }}>
        <div style={{
          background: "#fff",
          padding: "2.5rem 2rem",
          borderRadius: "22px",
          width: "650px",
          boxShadow: "0 8px 32px rgba(34,34,59,0.10)",
          textAlign: "center",
          fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
          border: "3px solid #ff6600"
        }}>
          <h2 style={{ color: "#ff6600", fontWeight: 700, marginBottom: 24 }}>{t.name} - Matches</h2>
          {matches.map((round, roundIdx) => (
            <div key={roundIdx} style={{
              marginBottom: 24,
              background: "#f5f7fa",
              borderRadius: "12px",
              padding: "1.2rem 1.5rem",
              border: "1.5px solid #ff6600",
              boxShadow: "0 2px 8px rgba(255,102,0,0.06)"
            }}>
              <h4 style={{ color: "#1a2238", fontWeight: 600, marginBottom: 12 }}>
                {t.type === "Elimination"
                  ? `Etapa ${matches.length === 4 ? ["Sferturi", "Semifinale", "Finala", "Castigator"][roundIdx] || `Runda ${roundIdx + 1}` : `Runda ${roundIdx + 1}`}`
                  : `Round ${roundIdx + 1}`}
              </h4>
              {round.map((m, idx) => (
                <div key={idx} style={{
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12
                }}>
                  <span style={{ fontWeight: 600, color: "#1a2238" }}>
                    {getUserName(m.player1)}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={m.score1 ?? ""}
                    onChange={e => handleScoreChange(roundIdx, idx, "score1", e.target.value)}
                    style={{
                      width: 40,
                      margin: "0 4px",
                      borderRadius: "6px",
                      border: "2px solid #ff6600",
                      textAlign: "center",
                      fontWeight: 700,
                      color: "#ff6600"
                    }}
                    placeholder="P1"
                  />
                  <span style={{ fontWeight: 700, color: "#22223b" }}>vs</span>
                  <input
                    type="number"
                    min={0}
                    value={m.score2 ?? ""}
                    onChange={e => handleScoreChange(roundIdx, idx, "score2", e.target.value)}
                    style={{
                      width: 40,
                      margin: "0 4px",
                      borderRadius: "6px",
                      border: "2px solid #ff6600",
                      textAlign: "center",
                      fontWeight: 700,
                      color: "#ff6600"
                    }}
                    placeholder="P2"
                  />
                  <span style={{ fontWeight: 600, color: "#1a2238" }}>
                    {getUserName(m.player2)}
                  </span>
                </div>
              ))}
              {t.type === "Elimination" && roundIdx < matches.length - 1 && (
                <button
                  style={{
                    marginTop: 8,
                    marginBottom: 8,
                    background: "#ff6600",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1.2rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                  onClick={() => handleAdvanceWinners(roundIdx)}
                >
                  Avansează câștigătorii în runda următoare
                </button>
              )}
            </div>
          ))}

          {/* Standings doar la Championship */}
          {t.type === "Championship" && (
            <>
              <h3 style={{ color: "#ff6600", fontWeight: 700, marginTop: 32, marginBottom: 12 }}>
                Standings
              </h3>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#f5f7fa",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: 16
              }}>
                <thead>
                  <tr style={{ background: "#1a2238", color: "#fff" }}>
                    <th style={{ padding: "0.7rem" }}>#</th>
                    <th style={{ padding: "0.7rem" }}>Player</th>
                    <th style={{ padding: "0.7rem" }}>Points</th>
                    <th style={{ padding: "0.7rem" }}>Golaveraj</th>
                  </tr>
                </thead>
                <tbody>
                  {[t.created_by, ...invited]
                    .map(id => ({ id, pts: points[id], gd: goalDiffs[id] }))
                    .sort((a, b) => b.pts - a.pts || b.gd - a.gd)
                    .map((entry, idx) => (
                      <tr key={entry.id} style={{ borderBottom: "1px solid #ff6600" }}>
                        <td style={{ padding: "0.7rem", fontWeight: 700, color: "#1a2238", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "0.7rem", fontWeight: 600, color: "#1a2238" }}>{getUserName(entry.id)}</td>
                        <td style={{ padding: "0.7rem", fontWeight: 700, color: "#ff6600" }}>{entry.pts}</td>
                        <td style={{ padding: "0.7rem", fontWeight: 700, color: "#1a2238" }}>{entry.gd > 0 ? "+" : ""}{entry.gd}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {maxPoints > 0 && winners.length > 0 && (
                <div style={{
                  marginTop: 16,
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  color: "#1a2238"
                }}>
                  Winner{winners.length > 1 ? "s" : ""}: {winners.join(", ")}
                </div>
              )}
            </>
          )}

          {/* Winner la eliminatoriu */}
          {t.type === "Elimination" && winner && (
            <h3 style={{ color: "#ff6600", fontWeight: 700, marginTop: 32 }}>
              Winner: {getUserName(winner)}
            </h3>
          )}
          <button onClick={() => setView("list")} style={{
            marginTop: "2rem",
            padding: "0.7rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: "#fff",
            border: "2px solid #ff6600",
            color: "#ff6600",
            fontWeight: 600,
            cursor: "pointer"
          }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>What do you want to do?</h2>
        <button
          style={styles.actionButton}
          onClick={() => setView("create")}
        >
          ➕ Create Tournament
        </button>
        <button
          style={styles.actionButton}
          onClick={() => setView("list")}
        >
          📋 View Existing Tournaments
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f7fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: "3.5rem 2.5rem",
    borderRadius: "22px",
    width: "700px",
    boxShadow: "0 8px 32px rgba(34,34,59,0.10)",
    textAlign: "center",
    fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
    border: "6px solid #ff6600", // portocaliu accent
    color: "#22223b"
  },
  actionButton: {
    display: "block",
    width: "100%",
    margin: "1.2rem 0",
    padding: "1.1rem",
    fontSize: "1.1rem",
    borderRadius: "10px",
    border: "none",
    // portocaliu
      backgroundColor: "#ff6600",
      color: "#fff",
      fontWeight: 700,
      letterSpacing: "0.5px",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(255,102,0,0.10)",
      transition: "background 0.2s"
      },
      item: {
      marginBottom: "1.5rem",
      textAlign: "left",
      background: "#f5f7fa", // gri deschis
      borderRadius: "12px",
      padding: "1.2rem 1.5rem",
      boxShadow: "0 2px 8px rgba(255,102,0,0.06)",
      border: "none" // elimină borderul portocaliu
  },
  manageButton: {
    marginLeft: "1rem",
    background: "#1a2238", // bleumarin
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1.2rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(26,34,56,0.10)"
  },
  deleteButton: {
    marginLeft: "1rem",
    background: "#fff",
    color: "#ff6600",
    border: "2px solid #ff6600",
    borderRadius: "8px",
    padding: "0.5rem 1.2rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(255,102,0,0.10)"
  },
  backButton: {
    marginTop: "1.5rem",
    padding: "0.7rem 1.5rem",
    borderRadius: "8px",
    backgroundColor: "#fff",
    border: "2px solid #ff6600",
    color: "#ff6600",
    fontWeight: 600,
    cursor: "pointer"
  },
  centeredContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    background: "#f5f7fa",
    paddingTop: 30
  }
};

export default TournamentsHome;
