import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// CRM MongoDB connection string
const CRM_MONGODB_URI = process.env.CRM_MONGODB_URI;

// Type declaration for global mongoose caching
declare global {
  // eslint-disable-next-line no-var
  var crmMongooseCache: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = global.crmMongooseCache;

if (!cached) {
  cached = global.crmMongooseCache = { conn: null, promise: null };
}

/**
 * Connect to CRM MongoDB
 * Uses connection caching to prevent multiple connections
 */
export async function connectToCrm(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log('✅ Using cached CRM MongoDB connection');
    return cached.conn as unknown as mongoose.Connection;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Create a named connection for CRM
    cached.promise = mongoose.createConnection(CRM_MONGODB_URI as string, opts).asPromise().then((connection) => {
      console.log('✅ Connected to CRM MongoDB');
      return connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ CRM MongoDB connection failed:', e);
    throw e;
  }

  return cached.conn as mongoose.Connection;
}

/**
 * Get the native MongoDB connection for low-level operations
 */
export async function getCrmNativeDb() {
  const connection = await connectToCrm();
  // The db property is available once connection is established
  if (!connection.db) {
    throw new Error('CRM database connection not established');
  }
  return connection.db;
}

/**
 * CRM Database Tools - Utility functions for agent tools
 */
export const crmDbTools = {
  /**
   * List all collections in the database
   */
  listCollections: async () => {
    const db = await getCrmNativeDb();
    const collections = await db.listCollections().toArray();
    return collections.map((c: { name: string }) => c.name);
  },

  /**
   * Get collection stats and schema sample
   */
  getCollectionInfo: async (collectionName: string) => {
    const db = await getCrmNativeDb();
    
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
    const db = await getCrmNativeDb();
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
    const db = await getCrmNativeDb();
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
    const db = await getCrmNativeDb();
    const documents = await db.collection(collectionName)
      .find({})
      .sort({ [sortField]: -1 })
      .limit(limit)
      .toArray();
    
    return documents;
  },

  /**
   * Get recent external objects from the externalobjects collection
   */
  getRecentExternalObjects: async (
    limit: number = 10,
    sortField: string = '_id'
  ) => {
    const db = await getCrmNativeDb();
    const documents = await db.collection('externalobjects')
      .find({})
      .sort({ [sortField]: -1 })
      .limit(limit)
      .toArray();
    
    return documents;
  },

  /**
   * Get recent connections from the connections collection
   */
  getRecentConnections: async (
    limit: number = 10,
    sortField: string = '_id'
  ) => {
    const db = await getCrmNativeDb();
    const documents = await db.collection('connections')
      .find({})
      .sort({ [sortField]: -1 })
      .limit(limit)
      .toArray();
    
    return documents;
  },

  /**
   * Get connections for a specific customer/account
   */
  getConnectionsForCustomer: async (
    accountId: string,
    limit: number = 10
  ) => {
    const db = await getCrmNativeDb();
    const documents = await db.collection('connections')
      .find({ account: new ObjectId(accountId) })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    
    return documents;
  },

  /**
   * Get connections by dataSource
   */
  getConnectionsByDataSource: async (
    dataSource: string,
    limit: number = 10
  ) => {
    const db = await getCrmNativeDb();
    const documents = await db.collection('connections')
      .find({ dataSource: dataSource })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    
    return documents;
  },

  /**
   * Get connection statistics
   */
  getConnectionStats: async () => {
    const db = await getCrmNativeDb();
    
    const totalConnections = await db.collection('connections').countDocuments();
    
    // Get unique account IDs that have connections
    const uniqueAccounts = await db.collection('connections')
      .distinct('account');
    
    // Get connections by dataSource
    const connectionsByDataSource = await db.collection('connections')
      .aggregate([
        { $group: { _id: '$dataSource', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
      .toArray();
    
    // Get recent connection activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentConnections = await db.collection('connections')
      .countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });
    
    return {
      totalConnections,
      uniqueAccountsWithConnections: uniqueAccounts.length,
      connectionsByDataSource,
      recentConnections,
      recentConnectionsPeriod: '30 days'
    };
  },

  /**
   * Get external objects for a customer filtered by dataSource(s)
   */
  getExternalObjectsByDataSource: async (
    accountId: string,
    dataSources: string | string[],
    limit: number = 20
  ) => {
    const db = await getCrmNativeDb();
    
    // Convert single dataSource to array for consistent handling
    const dataSourceArray = Array.isArray(dataSources) ? dataSources : [dataSources];
    
    const documents = await db.collection('externalobjects')
      .find({ 
        account: new ObjectId(accountId),
        dataSource: { $in: dataSourceArray }
      })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    
    return documents;
  },

  /**
   * Get external object statistics by dataSource for a customer
   */
  getExternalObjectStatsByDataSource: async (accountId: string) => {
    const db = await getCrmNativeDb();
    
    const stats = await db.collection('externalobjects')
      .aggregate([
        { $match: { account: new ObjectId(accountId) } },
        { $group: { 
          _id: '$dataSource', 
          count: { $sum: 1 },
          dataTypes: { $addToSet: '$dataType' }
        } },
        { $sort: { count: -1 } }
      ])
      .toArray();
    
    return stats;
  },

  /**
   * Get external objects for a customer filtered by dataType(s)
   */
  getExternalObjectsByDataType: async (
    accountId: string,
    dataTypes: string | string[],
    limit: number = 20
  ) => {
    const db = await getCrmNativeDb();
    
    // Convert single dataType to array for consistent handling
    const dataTypeArray = Array.isArray(dataTypes) ? dataTypes : [dataTypes];
    
    const documents = await db.collection('externalobjects')
      .find({ 
        account: new ObjectId(accountId),
        dataType: { $in: dataTypeArray }
      })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    
    return documents;
  },

  /**
   * Get external object statistics by dataType for a customer
   */
  getExternalObjectStatsByDataType: async (accountId: string) => {
    const db = await getCrmNativeDb();
    
    const stats = await db.collection('externalobjects')
      .aggregate([
        { $match: { account: new ObjectId(accountId) } },
        { $group: { 
          _id: '$dataType', 
          count: { $sum: 1 },
          dataSources: { $addToSet: '$dataSource' }
        } },
        { $sort: { count: -1 } }
      ])
      .toArray();
    
    return stats;
  },

  /**
   * Execute an aggregation pipeline
   */
  executeAggregation: async (collectionName: string, pipeline: any[]) => {
    const db = await getCrmNativeDb();
    const results = await db.collection(collectionName)
      .aggregate(pipeline)
      .toArray();
    
    return results;
  },

  /**
   * Get distinct values for a field
   */
  getDistinctValues: async (collectionName: string, field: string, query: any = {}) => {
    const db = await getCrmNativeDb();
    const values = await db.collection(collectionName).distinct(field, query);
    return values;
  },

  /**
   * Get indexes for a collection
   */
  getIndexes: async (collectionName: string) => {
    const db = await getCrmNativeDb();
    const indexes = await db.collection(collectionName).indexes();
    return indexes;
  },

  /**
   * Get first 10 accounts from the accounts collection
   */
  getFirst10Accounts: async () => {
    const db = await getCrmNativeDb();
    const accounts = await db.collection('accounts')
      .find({})
      .limit(10)
      .toArray();
    return accounts;
  },


  /**
   * Get first 10 external objects for a given account
   */
  getExternalObjectsForCustomer: async (
    accountId: string,
    limit: number = 10
  ) => {
    const db = await getCrmNativeDb();
    const collection = db.collection('externalobjects');
    
    // Account is stored as an ObjectId in the database
    const accountObjectId = new ObjectId(accountId);
    const results = await collection
      .find({ account: accountObjectId })
      .limit(limit)
      .toArray();
    
    return {
      collection: 'externalobjects',
      accountId,
      query: { account: accountObjectId },
      totalResults: results.length,
      results
    };
  },

  /**
   * Get 10 random accounts from the accounts collection
   */
  getRandom10Accounts: async () => {
    const db = await getCrmNativeDb();
    const accounts = await db.collection('accounts')
      .aggregate([{ $sample: { size: 10 } }])
      .toArray();
    return accounts;
  },

  /**
   * Search accounts by integrations customer ID
   */
  searchAccountsByIntegrationsId: async (
    integrationsCustomerId: string,
    options?: { limit?: number; skip?: number }
  ) => {
    const db = await getCrmNativeDb();
    const limit = options?.limit || 25;
    const skip = options?.skip || 0;
    
    const accounts = await db.collection('accounts')
      .find({ integrations_customer_id: integrationsCustomerId })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return accounts;
  },

  /**
   * Get a single account by its _id (ObjectId)
   */
  getAccountById: async (id: string) => {
    const db = await getCrmNativeDb();
    const account = await db.collection('accounts').findOne({ _id: new ObjectId(id) }, {
      projection: { _id: 1, name: 1, integrations_customer_id: 1 }
    });
    return account;
  },

  /**
   * Search accounts by name (case-insensitive, partial match)
   */
  getAccountByName: async (
    nameQuery: string,
    options?: { limit?: number; skip?: number }
  ) => {
    const db = await getCrmNativeDb();
    const limit = options?.limit || 25;
    const skip = options?.skip || 0;
    
    const accounts = await db.collection('accounts')
      .find({ 
        name: { $regex: nameQuery, $options: 'i' } 
      })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return accounts;
  },
  
};

export default { connectToCrm, crmDbTools };

