-- 9) tournaments table
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  game VARCHAR(50) NOT NULL,
  players INT NOT NULL,
  type VARCHAR(30) NOT NULL,
  invited JSONB NOT NULL, -- array of user IDs or emails
  matches JSONB,
  standings JSONB,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10) tournament Invitations table
CREATE TABLE tournament_invitations (
  id SERIAL PRIMARY KEY,
  tournament_id INT REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);