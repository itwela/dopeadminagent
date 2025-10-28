import { NextResponse } from 'next/server';
import { crmDbTools, connectToCrm } from '@/lib/crm-db';

export async function GET() {
  try {
    // Ensure connected
    const connection = await connectToCrm();
    const dbName = connection.db?.databaseName;

    // Get all collections
    const collections = await crmDbTools.listCollections();

    // Get basic stats for each collection (limited to first 10)
    const collectionStats = await Promise.all(
      collections.slice(0, 10).map(async (collectionName) => {
        try {
          const info = await crmDbTools.getCollectionInfo(collectionName);
          return {
            name: collectionName,
            estimatedCount: info.estimatedCount,
            indexes: info.indexes,
            fields: info.fields.length,
          };
        } catch (err: any) {
          console.error(`Error fetching stats for ${collectionName}:`, err.message);
          return {
            name: collectionName,
            error: err.message || 'Could not fetch stats',
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      database: dbName,
      totalCollections: collections.length,
      collections: collectionStats,
      allCollectionNames: collections,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

