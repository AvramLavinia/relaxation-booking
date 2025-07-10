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
    const matches = [];
    for (let i = 0; i < playerIds.length; i++) {
      for (let j = i + 1; j < playerIds.length; j++) {
        matches.push({
          player1: playerIds[i],
          player2: playerIds[j],
          score1: null,
          score2: null
        });
      }
    }
    return [matches]; // single round with all matches
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
            <h2>Choose the game</h2>
            <input
              type="text"
              placeholder="Tournament name"
              value={tournamentName}
              onChange={e => setTournamentName(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
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
            <h2>Number of players</h2>
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
            <h2>Choose tournament type</h2>
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
            <h2>Invite Players</h2>
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
    height: "100vh",
    backgroundColor: "#f5f7fa",
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
  optionButton: {
    display: "block",
    width: "100%",
    margin: "0.5rem 0",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "2px solid #ccc",
    cursor: "pointer",
    background: "white"
  },
  nextButton: {
    marginTop: "1.5rem",
    width: "100%",
    padding: "0.75rem",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    cursor: "pointer"
  },
  backButton: {
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    backgroundColor: "#ddd",
    border: "none",
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
