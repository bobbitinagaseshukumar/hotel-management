import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://neondb_owner:npg_Bkj8UqRcMi7A@ep-shiny-union-ahy2zgvl-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    await client.connect();
    console.log("Connected to Neon successfully!");

    // Check if users table exists
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log("Tables in database:", tables.rows.map(t => t.table_name));

    // Check users
    const users = await client.query("SELECT id, name, email, role, created_at FROM users;");
    console.log("Users in database:", users.rows);

  } catch (err) {
    console.error("Error connecting or querying:", err.message);
  } finally {
    await client.end();
  }
}

check();
