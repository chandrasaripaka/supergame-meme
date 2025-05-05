import { db } from './index.js';
import { sql } from 'drizzle-orm';

async function makePasswordNullable() {
  console.log('Making password column nullable...');
  
  try {
    // Alter password column to be nullable
    await db.execute(sql`
      ALTER TABLE users 
      ALTER COLUMN password DROP NOT NULL;
    `);
    
    console.log('Successfully made password column nullable.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

makePasswordNullable();