import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Build connection options
const poolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000,
};

// TiDB Cloud requires SSL — enable when DB_SSL=true
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  };
}

const pool = mysql.createPool(poolConfig);

export async function initializeDatabase() {
  // ─── For TiDB Cloud the database must already exist ───
  // (TiDB Serverless doesn't allow CREATE DATABASE via regular user)
  // If using local MySQL, you can still auto-create it:
  if (process.env.DB_SSL !== 'true') {
    try {
      const tempConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      };
      const tempConnection = await mysql.createConnection(tempConfig);
      await tempConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
      );
      await tempConnection.end();
    } catch (err) {
      console.warn('⚠️  Could not auto-create database (may already exist):', err.message);
    }
  }

  // Create employees table
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      emp_id VARCHAR(20) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      middle_name VARCHAR(100),
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(100) NOT NULL,
      dob DATE NOT NULL,
      date_of_joining DATE NOT NULL,
      nick_name VARCHAR(100),
      current_address TEXT NOT NULL,
      permanent_address TEXT NOT NULL,
      blood_group VARCHAR(10) NOT NULL,
      phone_number VARCHAR(15) NOT NULL,
      profile_picture TEXT,
      status BOOLEAN DEFAULT TRUE,
      exit_date DATE,
      exit_reason VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  await pool.query(createTableQuery);

  // Migration for existing tables
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM employees');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('phone_number')) {
      await pool.query("ALTER TABLE employees ADD COLUMN phone_number VARCHAR(15) DEFAULT '0000000000'");
    }
    if (!columnNames.includes('status')) {
      await pool.query("ALTER TABLE employees ADD COLUMN status BOOLEAN DEFAULT TRUE");
    } else {
      const statusCol = columns.find(c => c.Field === 'status');
      if (statusCol.Type.includes('enum')) {
        await pool.query("ALTER TABLE employees MODIFY COLUMN status BOOLEAN DEFAULT TRUE");
        await pool.query("UPDATE employees SET status = 1 WHERE status = 'ACTIVE' OR status IS NULL");
        await pool.query("UPDATE employees SET status = 0 WHERE status = 'EXITED'");
      }
    }
    if (!columnNames.includes('exit_date')) {
      await pool.query("ALTER TABLE employees ADD COLUMN exit_date DATE");
    }
    if (!columnNames.includes('exit_reason')) {
      await pool.query("ALTER TABLE employees ADD COLUMN exit_reason VARCHAR(255)");
    }
    // Migrate profile_picture from VARCHAR to TEXT (needed for base64 storage)
    const ppCol = columns.find(c => c.Field === 'profile_picture');
    if (ppCol && ppCol.Type.toLowerCase().includes('varchar')) {
      await pool.query("ALTER TABLE employees MODIFY COLUMN profile_picture TEXT");
    }
  } catch (error) {
    console.warn('Migration warning:', error.message);
  }

  console.log('✅ Database & employees table ready (TiDB compatible)');
}

export default pool;
