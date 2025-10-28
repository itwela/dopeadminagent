import { NextResponse } from 'next/server';
import { connectToCrm } from '@/lib/crm-db';

export async function GET() {
  try {
    const connection = await connectToCrm();
    const dbName = connection.db?.databaseName;
    
    console.log('✅ Connected to CRM MongoDB database');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Connected to CRM MongoDB!',
      database: dbName,
      host: connection.host,
    });
  } catch (error: any) {
    console.error('❌ CRM MongoDB connection failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

