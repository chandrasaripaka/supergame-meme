import { db } from './index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Running database migrations...');
  
  try {
    // Check if email column exists
    const checkEmailColumn = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email';
    `);
    
    if (checkEmailColumn.rows.length === 0) {
      console.log('Adding email column to users table...');
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN email VARCHAR(255) UNIQUE,
        ADD COLUMN google_id VARCHAR(255) UNIQUE,
        ADD COLUMN profile_picture TEXT,
        ADD COLUMN updated_at TIMESTAMP DEFAULT NOW() NOT NULL;
      `);
      console.log('Added missing columns to users table.');
    } else {
      console.log('Email column already exists in users table.');
    }
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

migrate();