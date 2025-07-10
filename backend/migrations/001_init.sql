-- ------------------------------------------------------------------
-- 001_init.sql
-- Create tables and seed data for relaxation_booking database
-- ------------------------------------------------------------------

-- 1) roles table
CREATE TABLE roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- 2) users table
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(60)  NOT NULL,
  display_name  VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3) facilities table
CREATE TABLE facilities (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(50)  NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  icon       VARCHAR(50)  NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) user_roles join table
CREATE TABLE user_roles (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 5) bookings table
CREATE TABLE bookings (
  id           SERIAL PRIMARY KEY,
  facility_id  INT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id      INT NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  start_time   TIMESTAMPTZ NOT NULL,
  end_time     TIMESTAMPTZ NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'occupied',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6) index for active-booking queries
CREATE INDEX idx_bookings_active
  ON bookings(facility_id, start_time, end_time, status);

-- 7) seed roles
INSERT INTO roles (name) VALUES
  ('user'),
  ('admin');

-- 8) seed facilities
INSERT INTO facilities (slug, name, icon) VALUES
  ('ps5',       'PlayStation',      'gamepad'),
  ('ping-pong', 'Ping Pong Table',  'table-tennis'),
  ('fussball',  'Fussball',         'users'),
  ('chair',     'Massage Chair',    'chair');


