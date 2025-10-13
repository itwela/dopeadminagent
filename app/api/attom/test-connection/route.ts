import { NextResponse } from 'next/server';
import { connectToAttom } from '@/lib/attom-db';

export async function GET() {
  try {
    const connection = await connectToAttom();
    const dbName = connection.connection.db?.databaseName;
    
    console.log('✅ Connected to ATTOM MongoDB database');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Connected to ATTOM MongoDB!',
      database: dbName,
      host: connection.connection.host,
    });
  } catch (error: any) {
    console.error('❌ ATTOM MongoDB connection failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

