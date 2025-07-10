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
      <Tournaments
        onConfirm={handleAddTournament}
        onCancel={() => setView("home")}
      />
    );
  }

  if (view === "list") {
    return (
      <div style={styles.card}>
        <h2>Existing Tournaments</h2>
        {tournaments.map((t) => (
          <div key={t.id} style={styles.item}>
            <strong>{t.name}</strong> <br />
            Game: {t.game} <br />
            Players: {t.players} <br />
            Type: {t.type}
            <button
              style={{
                marginLeft: "1rem",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "0.3rem 0.7rem",
                cursor: "pointer"
              }}
              onClick={() => setView({ type: "manage", id: t.id })}
            >
              Manage
            </button>
            {t.created_by === currentUser.id && (
              <button
                style={{
                  marginLeft: "1rem",
                  background: "#ff4c4c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.3rem 0.7rem",
                  cursor: "pointer"
                }}
                onClick={() => handleDeleteTournament(t.id)}
              >
                Delete
              </button>
            )}
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

    const maxPoints = Math.max(...Object.values(points));
    const winners = Object.entries(points)
      .filter(([id, pts]) => pts === maxPoints && maxPoints > 0)
      .map(([id]) => getUserName(Number(id)));

    return (
      <div style={styles.card}>
        <h2>{t.name} - Matches</h2>
        {matches.map((round, roundIdx) => (
          <div key={roundIdx} style={{ marginBottom: 18 }}>
            <h4>Round {roundIdx + 1}</h4>
            {round.map((m, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <span>{getUserName(m.player1)} vs {getUserName(m.player2)}</span>
                <input
                  type="number"
                  min={0}
                  value={m.score1 ?? ""}
                  onChange={e => handleScoreChange(roundIdx, idx, "score1", e.target.value)}
                  style={{ width: 40, margin: "0 8px" }}
                  placeholder="P1"
                />
                <input
                  type="number"
                  min={0}
                  value={m.score2 ?? ""}
                  onChange={e => handleScoreChange(roundIdx, idx, "score2", e.target.value)}
                  style={{ width: 40, margin: "0 8px" }}
                  placeholder="P2"
                />
              </div>
            ))}
            {t.type === "Elimination" && roundIdx < matches.length - 1 && (
              <button
                style={{ marginTop: 8, marginBottom: 8 }}
                onClick={() => handleAdvanceWinners(roundIdx)}
              >
                Avansează câștigătorii în runda următoare
              </button>
            )}
          </div>
        ))}
        {["Championship", "Elimination"].includes(t.type) && (
          <>
            <h3>Standings (Manual Entry)</h3>
            <ul style={{ textAlign: "left" }}>
              {[t.created_by, ...invited].map(id => (
                <li key={id}>
                  {getUserName(id)}:{" "}
                  <input
                    type="number"
                    min={0}
                    value={manualStandings[id] ?? 0}
                    onChange={e => setManualStandings(ms => ({
                      ...ms,
                      [id]: Number(e.target.value)
                    }))}
                    style={{ width: 60, marginLeft: 8 }}
                  /> pts
                </li>
              ))}
            </ul>
            <button onClick={handleSavePoints} style={{ marginTop: 12 }}>
              Save Points
            </button>
          </>
        )}
        {t.type === "Elimination" && winner && (
          <h3>Winner: {getUserName(winner)}</h3>
        )}
        <h3>Standings (Auto Calculated)</h3>
        <ul style={{ textAlign: "left" }}>
          {[t.created_by, ...invited].map(id => (
            <li key={id}>
              {getUserName(id)}: {points[id]} pts
            </li>
          ))}
        </ul>
        {maxPoints > 0 && winners.length > 0 && (
          <div style={{ marginTop: 16, fontWeight: "bold", fontSize: "1.2rem" }}>
            Winner{winners.length > 1 ? "s" : ""}: {winners.join(", ")}
          </div>
        )}
        <button onClick={() => setView("list")} style={styles.backButton}>Back</button>
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
    height: "100vh",
    background: "#f5f7fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    width: "400px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  actionButton: {
    display: "block",
    width: "100%",
    margin: "1rem 0",
    padding: "1rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer"
  },
  item: {
    marginBottom: "1.5rem",
    textAlign: "left"
  },
  backButton: {
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    backgroundColor: "#ddd",
    border: "none",
    cursor: "pointer"
  }
};

export default TournamentsHome;
