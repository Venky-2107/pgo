import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Initialize all tables
const initDatabase = async () => {
  const queries = `
    -- Admins table (platform superadmin)
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      contact VARCHAR(20),
      role VARCHAR(20) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Owners table (PG property owners)
    CREATE TABLE IF NOT EXISTS owners (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      contact VARCHAR(20) NOT NULL,
      role VARCHAR(20) DEFAULT 'owner',
      is_approved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Properties table (PG accommodations)
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
      owner_name VARCHAR(255),
      owner_email VARCHAR(255),
      property_name VARCHAR(255) NOT NULL,
      property_type VARCHAR(100) NOT NULL,
      property_email VARCHAR(255),
      property_contact VARCHAR(20),
      address_line1 VARCHAR(255) NOT NULL,
      address_line2 VARCHAR(255),
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      description TEXT,
      amenities JSONB DEFAULT '[]',
      gender VARCHAR(20) DEFAULT 'coed',
      is_approved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Rooms table for granular tracking
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      property_name VARCHAR(255),
      owner_name VARCHAR(255),
      room_number VARCHAR(50) NOT NULL,
      sharing_type INTEGER DEFAULT 1,
      price NUMERIC(10,2) DEFAULT 0,
      total_beds INTEGER DEFAULT 1,
      occupied_beds INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tenants table (end users registered by PG owners)
    CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      contact VARCHAR(20) NOT NULL,
      dob DATE,
      role VARCHAR(20) DEFAULT 'tenant',
      owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
      property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
      room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
      room_number VARCHAR(50),
      join_date DATE DEFAULT CURRENT_DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Add denormalized columns if they don't exist yet (safe for existing DBs)
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='owner_name') THEN
            ALTER TABLE properties ADD COLUMN owner_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='owner_email') THEN
            ALTER TABLE properties ADD COLUMN owner_email VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='property_name') THEN
            ALTER TABLE rooms ADD COLUMN property_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='rooms' AND column_name='owner_name') THEN
            ALTER TABLE rooms ADD COLUMN owner_name VARCHAR(255);
        END IF;
    END $$;

    -- Cleanup redundant columns if they exist from older schema
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='rooms_count') THEN
            ALTER TABLE properties DROP COLUMN rooms_count;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='room_types') THEN
            ALTER TABLE properties DROP COLUMN room_types;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='price_min') THEN
            ALTER TABLE properties DROP COLUMN price_min;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='price_max') THEN
            ALTER TABLE properties DROP COLUMN price_max;
        END IF;
    END $$;
  `;

  try {
    await pool.query(queries);
    console.log('✅ All tables ready (admins, owners, properties, rooms, tenants)');
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
  }
};

initDatabase();

export default pool;