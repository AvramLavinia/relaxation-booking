import db from '../db/index.js';

export async function createTournament({ name, game, players, type, invited, matches, created_by }) {
  const res = await db.query(
    `INSERT INTO tournaments (name, game, players, type, invited, matches, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, game, players, type, JSON.stringify(invited), JSON.stringify(matches), created_by]
  );
  return res.rows[0];
}

export async function getAllTournaments() {
  const res = await db.query('SELECT * FROM tournaments ORDER BY created_at DESC');
  return res.rows;
}

export async function getTournamentById(id) {
  const res = await db.query('SELECT * FROM tournaments WHERE id = $1', [id]);
  return res.rows[0];
}

export async function updateTournament(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields).map(v =>
    typeof v === "object" ? JSON.stringify(v) : v
  );
  if (keys.length === 0) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const res = await db.query(
    `UPDATE tournaments SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return res.rows[0];
}

export async function deleteTournament(id) {
  await db.query('DELETE FROM tournaments WHERE id = $1', [id]);
  return true;
}
