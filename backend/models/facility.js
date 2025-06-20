// backend/src/models/facility.js
import db from '../db/index.js';

export async function getAllFacilities() {
  const result = await db.query(
    'SELECT id, slug, name, icon FROM facilities ORDER BY name'
  );
  return result.rows;
}

export async function findFacilityBySlug(slug) {
  const result = await db.query(
    'SELECT id, slug, name, icon FROM facilities WHERE slug = $1',
    [slug]
  );
  return result.rows[0];
}