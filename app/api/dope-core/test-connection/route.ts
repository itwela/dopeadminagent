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
    console.log('✅ Connected to Dope Core database');
    client.release();
    await pool.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Connected to Dope Core PostgreSQL!',
      database: 'dope_mail_production'
    });
  } catch (error: any) {
    console.error('❌ Dope Core connection failed:', error);
    await pool.end();
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

