// Script to create an admin user in the database
import { pool } from '../server/db.js';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    const hashedPassword = await hashPassword('admin123');
    
    // Check if user already exists
    const checkResult = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create the admin user
    await pool.query(
      'INSERT INTO users (username, password, email, is_admin, created_at, last_login) VALUES ($1, $2, $3, $4, $5, $6)',
      ['admin', hashedPassword, 'admin@example.com', true, new Date(), new Date()]
    );
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    pool.end();
  }
}

createAdminUser();