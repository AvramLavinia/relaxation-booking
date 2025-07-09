import db from '../db/index.js';

export function requireRole(roleName) {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const result = await db.query(
      `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1 AND r.name = $2`,
      [req.user.id, roleName]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: insufficient role.' });
    }
    next();
  };
}