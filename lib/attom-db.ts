import mongoose from 'mongoose';

// ATTOM MongoDB connection string
const ATTOM_MONGODB_URI = process.env.ATTOM_MONGODB_URI;

// Type declaration for global mongoose caching
declare global {
  // eslint-disable-next-line no-var
  var attomMongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = global.attomMongooseCache;

if (!cached) {
  cached = global.attomMongooseCache = { conn: null, promise: null };
}

/**
 * Connect to ATTOM MongoDB
 * Uses connection caching to prevent multiple connections
 */
export async function connectToAttom(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('✅ Using cached ATTOM MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(ATTOM_MONGODB_URI as string, opts).then((mongooseInstance) => {
      console.log('✅ Connected to ATTOM MongoDB (TaxAssessors database)');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ ATTOM MongoDB connection failed:', e);
    throw e;
  }

  return cached.conn;
}

/**
 * Get the native MongoDB connection for low-level operations
 */
export async function getAttomNativeDb() {
  const connection = await connectToAttom();
  const db = connection.connection.db;
  if (!db) {
    throw new Error('ATTOM database connection not established');
  }
  return db;
}

/**
 * ATTOM Database Tools - Utility functions for agent tools
 */
export const attomDbTools = {
  /**
   * List all collections in the database
   */
  listCollections: async () => {
    const db = await getAttomNativeDb();
    const collections = await db.listCollections().toArray();
    return collections.map((c: { name: string }) => c.name);
  },

  /**
   * Get collection stats and schema sample
   */
  getCollectionInfo: async (collectionName: string) => {
    const db = await getAttomNativeDb();
    
    try {
      const collection = db.collection(collectionName);
      
      // Use estimatedDocumentCount() - FAST! Uses metadata, doesn't scan documents
      const estimatedCount = await collection.estimatedDocumentCount();
      
      // Get a sample document to infer schema (fast - only gets 1 doc)
      const sampleDoc = await collection.findOne({});
      
      // Get field names from sample document
      const fields = sampleDoc ? Object.keys(sampleDoc).map(key => ({
        field: key,
        type: typeof sampleDoc[key],
        sample: sampleDoc[key],
      })) : [];

      // Get indexes (fast - just metadata)
      const indexes = await collection.indexes();

      return {
        collection: collectionName,
        estimatedCount: estimatedCount,
        indexes: indexes.length,
        fields,
        sampleDocument: sampleDoc,
      };
    } catch (error: any) {
      throw new Error(`Failed to get collection info: ${error.message}`);
    }
  },

  /**
   * Execute a find query (read-only)
   */
  executeFind: async (collectionName: string, query: any = {}, options: any = {}) => {
    const db = await getAttomNativeDb();
    const collection = db.collection(collectionName);
    
    const limit = options.limit || 100;
    const skip = options.skip || 0;
    const sort = options.sort || {};
    
    const results = await collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return results;
  },

  /**
   * Count documents in a collection
   */
  countDocuments: async (collectionName: string, query: any = {}) => {
    const db = await getAttomNativeDb();
    const count = await db.collection(collectionName).countDocuments(query);
    return count;
  },

  /**
   * Get recent documents from a collection
   */
  getRecentDocuments: async (
    collectionName: string,
    limit: number = 10,
    sortField: string = '_id'
  ) => {
    const db = await getAttomNativeDb();
    const documents = await db.collection(collectionName)
      .find({})
      .sort({ [sortField]: -1 })
      .limit(limit)
      .toArray();
    
    return documents;
  },

  /**
   * Execute an aggregation pipeline
   */
  executeAggregation: async (collectionName: string, pipeline: any[]) => {
    const db = await getAttomNativeDb();
    const results = await db.collection(collectionName)
      .aggregate(pipeline)
      .toArray();
    
    return results;
  },

  /**
   * Get distinct values for a field
   */
  getDistinctValues: async (collectionName: string, field: string, query: any = {}) => {
    const db = await getAttomNativeDb();
    const values = await db.collection(collectionName).distinct(field, query);
    return values;
  },

  /**
   * Get indexes for a collection
   */
  getIndexes: async (collectionName: string) => {
    const db = await getAttomNativeDb();
    const indexes = await db.collection(collectionName).indexes();
    return indexes;
  },
};

export default { connectToAttom, attomDbTools };

