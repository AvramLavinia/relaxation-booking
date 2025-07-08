import React, { useState } from "react";

const Tournaments = ({ onConfirm, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedGame, setSelectedGame] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [tournamentType, setTournamentType] = useState("");
  const [invitedPlayers, setInvitedPlayers] = useState([]);
  const [tournamentName, setTournamentName] = useState("");

  const players = [
    "Ana", "Bogdan", "Cristi", "Diana", "Ema",
    "Florin", "Gina", "Horia", "Ionut", "Jeni"
  ];

  const toggleInvite = (name) => {
    setInvitedPlayers((prev) =>
      prev.includes(name)
        ? prev.filter((p) => p !== name)
        : [...prev, name]
    );
  };

  const handleConfirm = () => {
    const newTournament = {
      name: tournamentName,
      game: selectedGame,
      players: playerCount,
      type: tournamentType,
      invited: invitedPlayers
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
            <ul style={{ listStyle: "none", padding: 0 }}>
              {players.map((name) => (
                <li key={name}>
                  <label>
                    <input
                      type="checkbox"
                      checked={invitedPlayers.includes(name)}
                      onChange={() => toggleInvite(name)}
                    />{" "}
                    {name}
                  </label>
                </li>
              ))}
            </ul>
            <div style={styles.nav}>
              <button onClick={() => setStep(3)} style={styles.backButton}>Back</button>
              <button onClick={handleConfirm} style={styles.nextButton}>
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
