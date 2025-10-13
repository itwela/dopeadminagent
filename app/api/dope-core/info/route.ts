import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const pool = new Pool({
    user: process.env.DOPE_CORE_PG_USER,
    host: process.env.DOPE_CORE_PG_HOST,
    database: process.env.DOPE_CORE_PG_DATABASE,
    password: process.env.DOPE_CORE_PG_PASSWORD,
    port: parseInt(process.env.DOPE_CORE_PG_PORT as string),
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const client = await pool.connect();

    // Just get table names - super simple
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
      LIMIT 1000
    `);

    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      database: 'Dope Core (dope_mail_production)',
      tables: result.rows.map(r => r.tablename),
    });

  } catch (error: any) {
    await pool.end();
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

