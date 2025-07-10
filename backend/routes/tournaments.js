import express from 'express';
import {
  createTournament,
  getAllTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament
} from '../models/tournament.js';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db/index.js';

const router = express.Router();

// GET all tournaments
router.get('/', async (req, res) => {
  const tournaments = await getAllTournaments();
  res.json({ tournaments });
});

// GET my invitations
router.get('/my-invitations', authenticateToken, async (req, res) => {
  const result = await db.query(
    `SELECT ti.*, t.name as tournament_name, t.id as tournament_id
     FROM tournament_invitations ti
     JOIN tournaments t ON ti.tournament_id = t.id
     WHERE ti.user_id = $1 AND ti.status = 'pending'`,
    [req.user.id]
  );
  res.json({ invitations: result.rows });
});

// GET one tournament
router.get('/:id', async (req, res) => {
  const t = await getTournamentById(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const matches = Array.isArray(t.matches)
    ? t.matches
    : (typeof t.matches === "string" ? JSON.parse(t.matches) : []);
  res.json({ tournament: { ...t, matches } });
});

function generateChampionshipMatches(playerIds) {
  const n = playerIds.length;
  let players = [...playerIds];
  if (n % 2 !== 0) players.push(null); // Add a bye if odd number

  const numRounds = players.length - 1;
  const half = players.length / 2;
  const rounds = [];

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
  return rounds;
}

function generateEliminationMatches(playerIds) {
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  const matches = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    matches.push({
      player1: shuffled[i],
      player2: shuffled[i + 1] || null,
      score1: null,
      score2: null
    });
  }
  return [matches];
}

// CREATE tournament and invitations
router.post('/', authenticateToken, async (req, res) => {
  const { name, game, players, type, invited } = req.body;
  if (!name || !game || !players || !type || !invited || !Array.isArray(invited)) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Always include the creator as a participant
  const allPlayers = [req.user.id, ...(invited || [])];

  let matches = [];
  if (type === "Championship") {
    matches = generateChampionshipMatches(allPlayers);
  } else if (type === "Elimination") {
    matches = generateEliminationMatches(allPlayers);
  }

  // --- THIS IS THE IMPORTANT PART ---
  const t = await createTournament({
    name,
    game,
    players,
    type,
    created_by: req.user.id,
    invited: JSON.stringify(invited), // <-- add this line!
    matches: JSON.stringify(matches)
  });

  // Insert invitations for each invited user
  if (t && t.id && invited.length > 0) {
    const values = invited.map(userId =>
      `(${t.id}, ${userId}, 'pending', NOW(), NULL)`
    ).join(',');
    console.log("Inserting invitations:", values); // Add this line for debugging
    await db.query(
      `INSERT INTO tournament_invitations (tournament_id, user_id, status, invited_at, responded_at)
       VALUES ${values}`
    );
  }

  res.status(201).json({ tournament: t });
});

// UPDATE tournament
router.put('/:id', authenticateToken, async (req, res) => {
  const updated = await updateTournament(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ tournament: updated });
});

// DELETE tournament
router.delete('/:id', authenticateToken, async (req, res) => {
  // Fetch the tournament to check creator
  const t = await getTournamentById(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });

  // Only allow the creator to delete
  if (t.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Only the creator can delete this tournament.' });
  }

  await deleteTournament(req.params.id);
  res.json({ success: true });
});

// ACCEPT invitation
router.post('/:id/invitations/:invitationId/accept', authenticateToken, async (req, res) => {
  const { invitationId } = req.params;
  // Check invitation belongs to this user
  const inv = await db.query(
    'SELECT * FROM tournament_invitations WHERE id = $1 AND user_id = $2',
    [invitationId, req.user.id]
  );
  if (!inv.rows.length) return res.status(403).json({ error: "Not your invitation" });

  await db.query(
    "UPDATE tournament_invitations SET status = 'accepted', responded_at = NOW() WHERE id = $1",
    [invitationId]
  );
  res.json({ message: "You have joined the tournament!" });
});

// DECLINE invitation
router.post('/:id/invitations/:invitationId/decline', authenticateToken, async (req, res) => {
  const { invitationId } = req.params;
  // Check invitation belongs to this user
  const inv = await db.query(
    'SELECT * FROM tournament_invitations WHERE id = $1 AND user_id = $2',
    [invitationId, req.user.id]
  );
  if (!inv.rows.length) return res.status(403).json({ error: "Not your invitation" });

  await db.query(
    "UPDATE tournament_invitations SET status = 'declined', responded_at = NOW() WHERE id = $1",
    [invitationId]
  );
  res.json({ message: "You have declined the tournament invitation." });
});

// Send an invite to a user for a tournament (manual invite)
router.post('/invite', authenticateToken, async (req, res) => {
  const { tournamentId, userId } = req.body;
  if (!tournamentId || !userId) {
    return res.status(400).json({ error: "Missing tournamentId or userId" });
  }
  // Check if already invited
  const existing = await db.query(
    'SELECT * FROM tournament_invitations WHERE tournament_id = $1 AND user_id = $2',
    [tournamentId, userId]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: "User already invited" });
  }
  // Insert invitation
  await db.query(
    `INSERT INTO tournament_invitations (tournament_id, user_id, status, invited_at)
     VALUES ($1, $2, 'pending', NOW())`,
    [tournamentId, userId]
  );
  res.json({ success: true });
});

// Invite multiple users to a tournament
router.post('/:id/invite', authenticateToken, async (req, res) => {
  const tournamentId = req.params.id;
  const { userIds } = req.body; // array of user IDs

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "No users to invite." });
  }

  // Check if tournament exists
  const t = await getTournamentById(tournamentId);
  if (!t) return res.status(404).json({ error: "Tournament not found." });

  // Filter out already invited users
  const existing = await db.query(
    'SELECT user_id FROM tournament_invitations WHERE tournament_id = $1 AND user_id = ANY($2::int[])',
    [tournamentId, userIds]
  );
  const alreadyInvited = new Set(existing.rows.map(r => r.user_id));
  const toInvite = userIds.filter(id => !alreadyInvited.has(id));

  if (toInvite.length === 0) {
    return res.status(409).json({ error: "All users already invited." });
  }

  // Insert invitations
  const values = toInvite.map(userId =>
    `(${tournamentId}, ${userId}, 'pending', NOW(), NULL)`
  ).join(',');
  await db.query(
    `INSERT INTO tournament_invitations (tournament_id, user_id, status, invited_at, responded_at)
     VALUES ${values}`
  );

  res.json({ success: true, invited: toInvite });
});

export default router;

