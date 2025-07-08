import React, { useState, useEffect } from "react";
import Tournaments from "./Tournaments";

const TOURNAMENTS_KEY = "tournaments";

const TournamentsHome = () => {
  const [view, setView] = useState("home");
  const [tournaments, setTournaments] = useState(() => {
    // Încearcă să încarci din localStorage
    const saved = localStorage.getItem(TOURNAMENTS_KEY);
    if (saved) return JSON.parse(saved);
    // Dacă nu există, folosește valorile default
    return [
      {
        name: "Ping Pong Spring Cup",
        game: "Ping Pong",
        players: 8,
        type: "Championship"
      },
      {
        name: "FIFA Knockout",
        game: "FIFA (PS5)",
        players: 4,
        type: "Elimination"
      }
    ];
  });

  // Salvează în localStorage la orice modificare
  useEffect(() => {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
  }, [tournaments]);

  const handleAddTournament = (newTournament) => {
    const matches = generateMatches(newTournament.invited, newTournament.type);
    setTournaments((prev) => [
      ...prev,
      { ...newTournament, matches }
    ]);
    setView("list");
  };

  const handleDeleteTournament = (index) => {
    setTournaments(prev => prev.filter((_, i) => i !== index));
  };

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
        {tournaments.map((t, index) => (
          <div key={index} style={styles.item}>
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
              onClick={() => setView({ type: "manage", index })}
            >
              Manage
            </button>
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
              onClick={() => handleDeleteTournament(index)}
            >
              Delete
            </button>
          </div>
        ))}
        <button onClick={() => setView("home")} style={styles.backButton}>
          Back
        </button>
      </div>
    );
  }

  if (typeof view === "object" && view.type === "manage") {
    const t = tournaments[view.index];

    // Standings doar pentru Championship
    let standings = {};
    if (t.type === "Championship") {
      (t.invited || []).forEach(name => standings[name] = 0);
      (t.matches || []).flat().forEach(m => {
        if (m.score1 != null && m.score2 != null) {
          if (m.score1 > m.score2) standings[m.player1] += 3;
          else if (m.score1 < m.score2) standings[m.player2] += 3;
          else { standings[m.player1] += 1; standings[m.player2] += 1; }
        }
      });
    }

    // Câștigător pentru Elimination
    let winner = null;
    if (t.type === "Elimination" && t.matches && t.matches.length > 0) {
      const lastRound = t.matches[t.matches.length - 1];
      if (lastRound.length === 1) {
        const m = lastRound[0];
        if (m.score1 != null && m.score2 != null) {
          if (m.score1 > m.score2) winner = m.player1;
          else if (m.score2 > m.score1) winner = m.player2;
        }
      }
    }

    return (
      <div style={styles.card}>
        <h2>{t.name} - Matches</h2>
        {t.matches && t.matches.map((round, roundIdx) => (
          <div key={roundIdx} style={{ marginBottom: 18 }}>
            <h4>Round {roundIdx + 1}</h4>
            {round.map((m, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <span>{m.player1} vs {m.player2}</span>
                <input
                  type="number"
                  min={0}
                  value={m.score1 ?? ""}
                  onChange={e => {
                    let score = e.target.value === "" ? null : Number(e.target.value);
                    if (score < 0) score = 0;
                    setTournaments(ts => {
                      const copy = [...ts];
                      copy[view.index].matches[roundIdx][idx].score1 = score;
                      return copy;
                    });
                  }}
                  style={{ width: 40, margin: "0 8px" }}
                  placeholder="P1"
                />
                <input
                  type="number"
                  min={0}
                  value={m.score2 ?? ""}
                  onChange={e => {
                    let score = e.target.value === "" ? null : Number(e.target.value);
                    if (score < 0) score = 0;
                    setTournaments(ts => {
                      const copy = [...ts];
                      copy[view.index].matches[roundIdx][idx].score2 = score;
                      return copy;
                    });
                  }}
                  style={{ width: 40, margin: "0 8px" }}
                  placeholder="P2"
                />
              </div>
            ))}
            {t.type === "Elimination" && roundIdx < t.matches.length - 1 && (
              <button
                style={{ marginTop: 8, marginBottom: 8 }}
                onClick={() => {
                  setTournaments(ts => {
                    const copy = [...ts];
                    const winners = round
                      .map(m => {
                        if (m.score1 == null || m.score2 == null) return null;
                        if (m.score1 > m.score2) return m.player1;
                        if (m.score2 > m.score1) return m.player2;
                        return null;
                      })
                      .filter(Boolean);
                    for (let i = 0; i < winners.length; i += 2) {
                      copy[view.index].matches[roundIdx + 1][i / 2].player1 = winners[i] || null;
                      copy[view.index].matches[roundIdx + 1][i / 2].player2 = winners[i + 1] || null;
                    }
                    return copy;
                  });
                }}
              >
                Avansează câștigătorii în runda următoare
              </button>
            )}
          </div>
        ))}
        {t.type === "Championship" && (
          <>
            <h3>Standings</h3>
            <ul style={{ textAlign: "left" }}>
              {Object.entries(standings)
                .sort((a, b) => b[1] - a[1])
                .map(([name, pts]) => (
                  <li key={name}>{name}: {pts} pts</li>
              ))}
            </ul>
          </>
        )}
        {t.type === "Elimination" && winner && (
          <h3>Winner: {winner}</h3>
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

function generateMatches(players, type) {
  if (!players || players.length < 2) return [];
  if (type === "Championship") {
    // Round-robin pe runde, tur-retur
    let rounds = [];
    let ps = [...players];
    if (ps.length % 2 !== 0) ps.push(null);
    const numRounds = (ps.length - 1) * 2; // tur + retur
    const half = ps.length / 2;

    // Tur
    let arr = [...ps];
    for (let round = 0; round < ps.length - 1; round++) {
      let matches = [];
      for (let i = 0; i < half; i++) {
        const p1 = arr[i];
        const p2 = arr[ps.length - 1 - i];
        if (p1 && p2) {
          matches.push({
            player1: p1,
            player2: p2,
            score1: null,
            score2: null,
          });
        }
      }
      rounds.push(matches);
      arr.splice(1, 0, arr.pop());
    }
    // Retur (inversează gazda cu oaspetele)
    arr = [...ps];
    for (let round = 0; round < ps.length - 1; round++) {
      let matches = [];
      for (let i = 0; i < half; i++) {
        const p1 = arr[ps.length - 1 - i];
        const p2 = arr[i];
        if (p1 && p2) {
          matches.push({
            player1: p1,
            player2: p2,
            score1: null,
            score2: null,
          });
        }
      }
      rounds.push(matches);
      arr.splice(1, 0, arr.pop());
    }
    return rounds;
  }
  if (type === "Elimination") {
    // Single elimination bracket
    let rounds = [];
    let ps = [...players];
    if (ps.length % 2 !== 0) ps.push(null);
    let currentRound = ps.map((p, i) => i % 2 === 0 ? [p, ps[i + 1]] : null).filter(Boolean);
    let roundMatches = currentRound.map(([p1, p2]) => ({
      player1: p1,
      player2: p2,
      score1: null,
      score2: null,
    }));
    rounds.push(roundMatches);

    // Generate next rounds (empty, to be filled as winners are decided)
    let numPlayers = ps.length;
    while (numPlayers > 2) {
      numPlayers = Math.ceil(numPlayers / 2);
      let nextRound = [];
      for (let i = 0; i < numPlayers / 2; i++) {
        nextRound.push({
          player1: null,
          player2: null,
          score1: null,
          score2: null,
        });
      }
      rounds.push(nextRound);
    }
    return rounds;
  }
  return [];
}

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
