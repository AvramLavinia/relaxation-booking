import React, { useState, useEffect } from "react";
import { API_URL } from "../api/auth";

const Tournaments = ({ onConfirm, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedGame, setSelectedGame] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [tournamentType, setTournamentType] = useState("");
  const [tournamentName, setTournamentName] = useState("");
  const [players, setPlayers] = useState([]);
  const [invitedPlayers, setInvitedPlayers] = useState([]);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (step === 4) {
      fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
        .then(res => res.json())
        .then(data => setPlayers(data.users || []));
    }
  }, [step]);

  const toggleInvite = (id) => {
    setInvitedPlayers((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  // Add this function inside your component, before handleConfirm:
  function generateChampionshipMatches(playerIds) {
    const n = playerIds.length;
    let players = [...playerIds];
    if (n % 2 !== 0) players.push(null); // Adaugă "bye" dacă e impar

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
      // Rotește jucătorii, cu excepția primului
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

  function generateEliminationMatches(playerIds) {
    // Shuffle players for random pairing
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    const matches = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      matches.push({
        player1: shuffled[i],
        player2: shuffled[i + 1] || null, // If odd number, last gets a bye
        score1: null,
        score2: null
      });
    }
    return [matches]; // Only first round; next rounds are generated as winners advance
  }

  const handleConfirm = () => {
    const allPlayers = [currentUser.id, ...invitedPlayers];
    let matches = [];
    if (tournamentType === "Championship") {
      matches = generateChampionshipMatches(allPlayers);
    } else if (tournamentType === "Elimination") {
      matches = generateEliminationMatches(allPlayers);
    }
    const newTournament = {
      name: tournamentName,
      game: selectedGame,
      players: playerCount,
      type: tournamentType,
      invited: invitedPlayers,
      matches
    };
    onConfirm(newTournament);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {step === 1 && (
          <>
            <h2 style={styles.title}>Choose the game</h2>
            <input
              type="text"
              placeholder="Tournament name"
              value={tournamentName}
              onChange={e => setTournamentName(e.target.value)}
              style={styles.input}
            />
            {["Ping Pong", "Fussball", "FIFA (PS5)"].map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                style={{
                  ...styles.optionButton,
                  borderColor: selectedGame === game ? "#007bff" : "#ccc"
                }}
              >
                {game}
              </button>
            ))}
            <button
              disabled={!selectedGame || !tournamentName}
              onClick={() => setStep(2)}
              style={{
                ...styles.nextButton,
                backgroundColor: selectedGame && tournamentName ? "#007bff" : "#ccc"
              }}
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={styles.title}>Number of players</h2>
            <div style={styles.counter}>
              <button onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}>−</button>
              <span style={styles.count}>{playerCount}</span>
              <button onClick={() => setPlayerCount(Math.min(16, playerCount + 1))}>+</button>
            </div>
            <div style={styles.nav}>
              <button onClick={() => setStep(1)} style={styles.backButton}>Back</button>
              <button onClick={() => setStep(3)} style={styles.nextButton}>Next</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={styles.title}>Choose tournament type</h2>
            {["Championship", "Elimination"].map((type) => (
              <button
                key={type}
                onClick={() => setTournamentType(type)}
                style={{
                  ...styles.optionButton,
                  borderColor: tournamentType === type ? "#007bff" : "#ccc"
                }}
              >
                {type}
              </button>
            ))}
            <div style={styles.nav}>
              <button onClick={() => setStep(2)} style={styles.backButton}>Back</button>
              <button
                disabled={!tournamentType}
                onClick={() => setStep(4)}
                style={{
                  ...styles.nextButton,
                  backgroundColor: tournamentType ? "#007bff" : "#ccc"
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={styles.title}>Invite Players</h2>
            <div style={{ marginBottom: "1rem", color: "#888" }}>
              Please select exactly {playerCount - 1} teammate{playerCount - 1 !== 1 ? "s" : ""}.
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {players
                .filter(user => user.id !== currentUser.id)
                .map((user) => (
                  <li key={user.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={invitedPlayers.includes(user.id)}
                        onChange={() => toggleInvite(user.id)}
                      />{" "}
                      {user.display_name || user.email}
                    </label>
                  </li>
                ))}
            </ul>
            <div style={{ color: "red", margin: "0.5rem 0" }}>
              {invitedPlayers.length !== playerCount - 1 &&
                `You must select exactly ${playerCount - 1} teammate${playerCount - 1 !== 1 ? "s" : ""}.`}
            </div>
            <div style={styles.nav}>
              <button onClick={() => setStep(3)} style={styles.backButton}>Back</button>
              <button
                onClick={handleConfirm}
                style={{
                  ...styles.nextButton,
                  backgroundColor: invitedPlayers.length === playerCount - 1 ? "#007bff" : "#ccc",
                  cursor: invitedPlayers.length === playerCount - 1 ? "pointer" : "not-allowed"
                }}
                disabled={invitedPlayers.length !== playerCount - 1}
              >
                Confirm
              </button>
              <button onClick={onCancel} style={styles.backButton}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: "2.5rem 2rem",
    borderRadius: "22px",
    width: "420px",
    boxShadow: "0 8px 32px rgba(34,34,59,0.10)",
    textAlign: "center",
    fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
    border: "3px solid #ff6600"
  },
  title: {
    fontWeight: 700,
    color: "#1a2238",
    marginBottom: "2rem",
    fontSize: "2rem"
  },
  input: {
    width: "90%",
    padding: "0.9rem 1rem",
    borderRadius: "10px",
    border: "2px solid #ff6600",
    fontSize: "1.1rem",
    marginBottom: "1.5rem",
    outline: "none",
    background: "#f5f7fa",
    textAlign: "center",
    margin: "0 auto 1.5rem auto" // <-- centrează inputul
  },
  optionButton: {
    display: "block",
    width: "100%",
    margin: "0.7rem 0",
    padding: "1.1rem",
    fontSize: "1.1rem",
    borderRadius: "10px",
    border: "2px solid #ff6600",
    background: "#fff",
    color: "#1a2238",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s, border 0.2s"
  },
  optionButtonSelected: {
    background: "#ff6600",
    color: "#fff",
    border: "2px solid #ff6600"
  },
  nextButton: {
    marginTop: "2rem",
    width: "100%",
    padding: "1rem",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1.1rem",
    backgroundColor: "#ff6600",
    cursor: "pointer",
    opacity: 1,
    transition: "background 0.2s, opacity 0.2s"
  },
  nextButtonDisabled: {
    backgroundColor: "#e5e7eb",
    color: "#bdbdbd",
    cursor: "not-allowed",
    opacity: 0.7
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
  counter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    fontSize: "1.5rem",
    fontWeight: "bold"
  },
  count: {
    minWidth: "40px",
    display: "inline-block"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "1rem"
  }
};

export default Tournaments;
