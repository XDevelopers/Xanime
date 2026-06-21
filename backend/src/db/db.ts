import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // loads .env file

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/anime',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export a function that returns the pool (if you want to call it)
export const getDbConnection = () => pool;

// Or simply export the pool directly (most common)
export default pool;