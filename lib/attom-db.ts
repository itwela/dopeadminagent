import mongoose from 'mongoose';

// ATTOM MongoDB connection string
const ATTOM_MONGODB_URI = process.env.ATTOM_MONGODB_URI;

// Type declaration for global mongoose caching
declare global {
  // eslint-disable-next-line no-var
  var attomMongooseCache: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
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
export async function connectToAttom(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log('✅ Using cached ATTOM MongoDB connection');
    return cached.conn as mongoose.Connection;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Create a named connection for ATTOM
    cached.promise = mongoose.createConnection(ATTOM_MONGODB_URI as string, opts).asPromise().then((connection) => {
      console.log('✅ Connected to ATTOM MongoDB (TaxAssessors database)');
      return connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ ATTOM MongoDB connection failed:', e);
    throw e;
  }

  return cached.conn as mongoose.Connection;
}

/**
 * Get the native MongoDB connection for low-level operations
 */
export async function getAttomNativeDb() {
  const connection = await connectToAttom();
  // The db property is available once connection is established
  if (!connection.db) {
    throw new Error('ATTOM database connection not established');
  }
  return connection.db;
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

  /**
   * Get most recent tax-assessors from the tax-assessors collection
   */
  getRecentTaxAssessors: async (limit: number = 10) => {
    const db = await getAttomNativeDb();
    const taxAssessors = await db.collection('tax-assessors')
      .find({})
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    return taxAssessors;
  },

  // Collection-specific functions for each Attom collection

  /**
   * Search tax-assessors by address
   */
  searchTaxAssessorsByAddress: async (
    addressFields: {
      Full?: string;
      City?: string;
      State?: string;
      ZIP?: string;
      HouseNumber?: string;
      StreetName?: string;
      StreetPostDirection?: string;
      StreetSuffix?: string;
      Searchable_FullAddress?: string;
      Searchable_StreetCity?: string;
    },
    limit: number = 10
  ) => {
    const db = await getAttomNativeDb();
    // Build exact-match AND query using provided fields (uppercase canonical)
    const norm = (v?: string) => (v || '').trim().toUpperCase();
    const andQuery: Record<string, any> = {};
    const mapped: Record<string, string> = {
      Full: norm(addressFields.Full),
      City: norm(addressFields.City),
      State: norm(addressFields.State),
      ZIP: norm(addressFields.ZIP),
    };
    Object.entries(mapped).forEach(([key, val]) => {
      if (val) andQuery[`PropertyAddress.${key}`] = val;
    });
    if (Object.keys(andQuery).length === 0) {
      return [];
    }
    const cursor = db.collection('tax-assessors')
      .find(andQuery)
      .project({
        PropertyAddress: 1,
        AttomId: 1,
        // Property value & financial
        TaxMarketValueTotal: 1,
        TaxAssessedValueTotal: 1,
        AssessorLastSaleAmount: 1,
        AssessorLastSaleDate: 1,
        DeedLastSalePrice: 1,
        DeedLastSaleDate: 1,
        Valuations: 1,
        // Property age & construction
        YearBuilt: 1,
        YearBuiltEffective: 1,
        // Property size
        AreaBuilding: 1,
        AreaLotSF: 1,
        AreaLotAcres: 1,
        Area1stFloor: 1,
        AreaGross: 1,
        // Basic property details
        BedroomsCount: 1,
        BathCount: 1,
        StoriesCount: 1,
        Construction: 1,
        // Owner info
        DeedOwners: 1,
        PartyOwners: 1,
        // Location
        PropertyLatitude: 1,
        PropertyLongitude: 1,
        SitusCounty: 1,
        SitusStateCode: 1,
        // Parcel
        ParcelNumberRaw: 1,
        ParcelAccountNumber: 1,
        // Tax
        TaxFiscalYear: 1,
        TaxBilledAmount: 1,
        TaxYearAssessed: 1,
        // Last update
        AssrLastUpDated: 1,
        LastAssessorTaxRollUpDate: 1,
        PublicationDate: 1,
        // Counts
        BuildingPermitsCount: 1,
        RecordersCount: 1,
        ValuationsCount: 1,
      })
      .sort({ 'PropertyAddress.ZIP': 1 })
      .limit(limit)
      .maxTimeMS(60000);

    const results = await cursor.toArray();
    return results;
  },

  /**
   * Get tax-assessors by city
   */
  getTaxAssessorsByCity: async (city: string, limit: number = 10) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors')
      .find({ 'PropertyAddress.City': city })
      .limit(limit)
      .toArray();
    return results;
  },

  /**
   * Get tax-assessors by ZIP code
   */
  getTaxAssessorsByZIP: async (zip: string, limit: number = 10) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors')
      .find({ 'PropertyAddress.ZIP': zip })
      .limit(limit)
      .toArray();
    return results;
  },

  /**
   * Get tax-assessors by state
   */
  getTaxAssessorsByState: async (state: string, limit: number = 10) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors')
      .find({ 'PropertyAddress.State': state })
      .limit(limit)
      .toArray();
    return results;
  },

  /**
   * Get tax-assessors data sources
   */
  getTaxAssessorsDataSources: async (limit: number = 10) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors-data-sources')
      .find({})
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    return results;
  },

  /**
   * Search tax-assessors lookup by city
   */
  searchTaxAssessorsLookupByCity: async (city: string, limit: number = 10) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors-lookup-PropertyAddress.City')
      .find({ city: { $regex: city, $options: 'i' } })
      .limit(limit)
      .toArray();
    return results;
  },

  /**
   * Search tax-assessors lookup by ZIP
   */
  searchTaxAssessorsLookupByZIP: async (zip: string, limit: number = 10) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors-lookup-PropertyAddress.ZIP')
      .find({ zip: { $regex: zip, $options: 'i' } })
      .limit(limit)
      .toArray();
    return results;
  },

  /**
   * Search tax-assessors lookup by state
   */
  searchTaxAssessorsLookupByState: async (state: string, limit: number = 10) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors-lookup-PropertyAddress.State')
      .find({ state: { $regex: state, $options: 'i' } })
      .limit(limit)
      .toArray();
    return results;
  },

  /**
   * Get Attom settings
   */
  getAttomSettings: async () => {
    const db = await getAttomNativeDb();
    const results = await db.collection('attom-settings')
      .find({})
      .toArray();
    return results;
  },

  /**
   * Get Attom files
   */
  getAttomFiles: async (limit: number = 10) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('attom-files')
      .find({})
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    return results;
  },

  /**
   * Search tax-assessors search addresses
   */
  searchTaxAssessorsSearchAddresses: async (addressQuery: string, limit: number = 10) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors-search-addresses')
      .find({
        $or: [
          { address: { $regex: addressQuery, $options: 'i' } },
          { street: { $regex: addressQuery, $options: 'i' } },
          { city: { $regex: addressQuery, $options: 'i' } }
        ]
      })
      .limit(limit)
      .toArray();
    return results;
  },

  /**
   * Get field metadata
   */
  getFieldMetadata: async (collectionName?: string) => {
    const db = await getAttomNativeDb();
    const query = collectionName ? { collection: collectionName } : {};
    const results = await db.collection('field-metadata')
      .find(query)
      .toArray();
    return results;
  },

  /**
   * Search for a specific field within field metadata
   */
  searchFieldInMetadata: async (fieldName: string, collectionName?: string) => {
    const db = await getAttomNativeDb();
    
    // Build the query to search for the field in fieldMetadata
    const query: any = {
      [`fieldMetadata.${fieldName}`]: { $exists: true }
    };
    
    if (collectionName) {
      query.collection = collectionName;
    }
    
    const results = await db.collection('field-metadata')
      .find(query)
      .toArray();
    
    // Extract just the field metadata for the searched field
    const fieldResults = results.map(doc => ({
      collection: doc.collection || doc.type,
      fieldName: fieldName,
      fieldMetadata: doc.fieldMetadata[fieldName] || null,
      found: !!doc.fieldMetadata[fieldName]
    }));
    
    return fieldResults;
  },

  /**
   * Get all field names from field metadata
   */
  getAllFieldNames: async (collectionName?: string) => {
    const db = await getAttomNativeDb();
    
    const query = collectionName ? { collection: collectionName } : {};
    const results = await db.collection('field-metadata')
      .find(query)
      .toArray();
    
    // Extract all field names from fieldMetadata
    const allFields = new Set<string>();
    results.forEach(doc => {
      if (doc.fieldMetadata) {
        Object.keys(doc.fieldMetadata).forEach(fieldName => {
          allFields.add(fieldName);
        });
      }
    });
    
    return Array.from(allFields).sort();
  },

  /**
   * Get distinct cities from tax-assessors
   */
  getDistinctCities: async (limit: number = 50) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors')
      .distinct('PropertyAddress.City', { 'PropertyAddress.City': { $exists: true, $ne: null } });
    return results.slice(0, limit);
  },

  /**
   * Get distinct states from tax-assessors
   */
  getDistinctStates: async () => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors')
      .distinct('PropertyAddress.State', { 'PropertyAddress.State': { $exists: true, $ne: null } });
    return results;
  },

  /**
   * Get distinct ZIP codes from tax-assessors
   */
  getDistinctZIPs: async (limit: number = 100) => {
    const db = await getAttomNativeDb();
    const results = await db.collection('tax-assessors')
      .distinct('PropertyAddress.ZIP', { 'PropertyAddress.ZIP': { $exists: true, $ne: null } });
    return results.slice(0, limit);
  },

  /**
   * Search properties by metadata criteria (e.g., boolean flags, numeric ranges, etc.)
   */
  searchPropertiesByMetadata: async (
    criteria: {
      zip?: string;
      city?: string;
      state?: string;
      booleanFields?: { [fieldName: string]: boolean };
      numericFields?: { [fieldName: string]: { min?: number; max?: number; exact?: number } };
      stringFields?: { [fieldName: string]: string | { $regex: string; $options?: string } };
      limit?: number;
    }
  ) => {
    const db = await getAttomNativeDb();
    const limit = criteria.limit || 10;
    
    // Build the MongoDB query
    const query: any = {};
    
    // Location filters
    if (criteria.zip) {
      query['PropertyAddress.ZIP'] = criteria.zip;
    }
    if (criteria.city) {
      query['PropertyAddress.City'] = criteria.city;
    }
    if (criteria.state) {
      query['PropertyAddress.State'] = criteria.state;
    }
    
    // Boolean field filters
    if (criteria.booleanFields) {
      Object.entries(criteria.booleanFields).forEach(([fieldName, value]) => {
        query[fieldName] = value;
      });
    }
    
    // Numeric field filters
    if (criteria.numericFields) {
      Object.entries(criteria.numericFields).forEach(([fieldName, range]) => {
        if (range.exact !== undefined) {
          query[fieldName] = range.exact;
        } else {
          const numericQuery: any = {};
          if (range.min !== undefined) numericQuery.$gte = range.min;
          if (range.max !== undefined) numericQuery.$lte = range.max;
          if (Object.keys(numericQuery).length > 0) {
            query[fieldName] = numericQuery;
          }
        }
      });
    }
    
    // String field filters
    if (criteria.stringFields) {
      Object.entries(criteria.stringFields).forEach(([fieldName, value]) => {
        query[fieldName] = value;
      });
    }
    
    const results = await db.collection('tax-assessors')
      .find(query)
      .limit(limit)
      .toArray();
    
    return {
      query,
      count: results.length,
      results
    };
  },

  /**
   * Search properties with specific boolean flags in a location
   */
  searchPropertiesWithFlags: async (
    location: { zip?: string; city?: string; state?: string },
    flags: string[], // Array of field names that should be true
    limit: number = 10
  ) => {
    const db = await getAttomNativeDb();
    
    const query: any = {};
    
    // Location filters
    if (location.zip) query['PropertyAddress.ZIP'] = location.zip;
    if (location.city) query['PropertyAddress.City'] = location.city;
    if (location.state) query['PropertyAddress.State'] = location.state;
    
    // All specified flags must be true
    flags.forEach(flag => {
      query[flag] = true;
    });
    
    const results = await db.collection('tax-assessors')
      .find(query)
      .limit(limit)
      .toArray();
    
    return {
      location,
      flags,
      query,
      count: results.length,
      results
    };
  },

  /**
   * Search properties with numeric criteria in a location
   */
  searchPropertiesWithNumericCriteria: async (
    location: { zip?: string; city?: string; state?: string },
    numericCriteria: { [fieldName: string]: { min?: number; max?: number; exact?: number } },
    limit: number = 10
  ) => {
    const db = await getAttomNativeDb();
    
    const query: any = {};
    
    // Location filters
    if (location.zip) query['PropertyAddress.ZIP'] = location.zip;
    if (location.city) query['PropertyAddress.City'] = location.city;
    if (location.state) query['PropertyAddress.State'] = location.state;
    
    // Numeric criteria
    Object.entries(numericCriteria).forEach(([fieldName, range]) => {
      if (range.exact !== undefined) {
        query[fieldName] = range.exact;
      } else {
        const numericQuery: any = {};
        if (range.min !== undefined) numericQuery.$gte = range.min;
        if (range.max !== undefined) numericQuery.$lte = range.max;
        if (Object.keys(numericQuery).length > 0) {
          query[fieldName] = numericQuery;
        }
      }
    });
    
    const results = await db.collection('tax-assessors')
      .find(query)
      .limit(limit)
      .toArray();
    
    return {
      location,
      numericCriteria,
      query,
      count: results.length,
      results
    };
  },

  /**
   * Get property statistics for a location
   */
  getPropertyStats: async (
    location: { zip?: string; city?: string; state?: string },
    fields: string[] = []
  ) => {
    const db = await getAttomNativeDb();
    
    const matchQuery: any = {};
    if (location.zip) matchQuery['PropertyAddress.ZIP'] = location.zip;
    if (location.city) matchQuery['PropertyAddress.City'] = location.city;
    if (location.state) matchQuery['PropertyAddress.State'] = location.state;
    
    const pipeline: any[] = [
      { $match: matchQuery }
    ];
    
    // Add group stage for statistics
    const groupStage: any = {
      _id: null,
      totalProperties: { $sum: 1 }
    };
    
    // Add statistics for each field
    fields.forEach(field => {
      groupStage[`${field}_avg`] = { $avg: `$${field}` };
      groupStage[`${field}_min`] = { $min: `$${field}` };
      groupStage[`${field}_max`] = { $max: `$${field}` };
      groupStage[`${field}_count`] = { $sum: { $cond: [{ $ne: [`$${field}`, null] }, 1, 0] } };
    });
    
    pipeline.push({ $group: groupStage });
    
    const results = await db.collection('tax-assessors')
      .aggregate(pipeline)
      .toArray();
    
    return results[0] || { totalProperties: 0 };
  },

  /**
   * Search tax-assessors with custom field selection
   * Allows you to specify exactly which fields to return
   */
  searchTaxAssessorsWithFields: async (
    searchCriteria: {
      addressFields?: {
        Full?: string;
        City?: string;
        State?: string;
        ZIP?: string;
        HouseNumber?: string;
        StreetName?: string;
        StreetPostDirection?: string;
        StreetSuffix?: string;
        Searchable_FullAddress?: string;
        Searchable_StreetCity?: string;
      };
      otherCriteria?: {
        [fieldName: string]: any;
      };
    },
    options: {
      fields?: string[]; // Array of field names to return (e.g., ['PropertyAddress', 'AttomId', 'TaxMarketValueTotal'])
      limit?: number;
      skip?: number;
      sort?: { [field: string]: 1 | -1 };
    } = {}
  ) => {
    const db = await getAttomNativeDb();
    const limit = options.limit || 10;
    const skip = options.skip || 0;
    const sort = options.sort || { '_id': -1 };
    
    // Build the query
    const query: any = {};
    
    // Handle address fields (exact match)
    if (searchCriteria.addressFields) {
      const norm = (v?: string) => (v || '').trim().toUpperCase();
      const mapped: Record<string, string> = {
        Full: norm(searchCriteria.addressFields.Full),
        City: norm(searchCriteria.addressFields.City),
        State: norm(searchCriteria.addressFields.State),
        ZIP: norm(searchCriteria.addressFields.ZIP),
      };
      
      Object.entries(mapped).forEach(([key, val]) => {
        if (val) query[`PropertyAddress.${key}`] = val;
      });
    }
    
    // Handle other criteria
    if (searchCriteria.otherCriteria) {
      Object.assign(query, searchCriteria.otherCriteria);
    }
    
    // If no criteria provided, return recent documents
    if (Object.keys(query).length === 0) {
      query._id = { $exists: true };
    }
    
    // Build projection
    const projection: any = {};
    if (options.fields && options.fields.length > 0) {
      // Always include _id
      projection._id = 1;
      
      // Add requested fields
      options.fields.forEach(field => {
        projection[field] = 1;
      });
    }
    
    const cursor = db.collection('tax-assessors')
      .find(query, projection ? { projection } : {})
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .maxTimeMS(60000);

    const results = await cursor.toArray();
    
    return {
      query,
      projection: options.fields || 'all fields',
      count: results.length,
      limit,
      skip,
      sort,
      results
    };
  },

  /**
   * Search tax-assessors by geo coordinates (latitude/longitude)
   * Can search by exact coordinates or within a radius
   */
  searchTaxAssessorsByCoordinates: async (
    coordinates: {
      latitude: number;
      longitude: number;
      radiusMiles?: number; // Optional radius in miles for proximity search
    },
    limit: number = 10
  ) => {
    const db = await getAttomNativeDb();
    
    // Build the query based on whether radius is provided
    let query: any = {};
    
    if (coordinates.radiusMiles && coordinates.radiusMiles > 0) {
      // Use MongoDB's $geoWithin with $centerSphere for radius search
      // Convert miles to radians (Earth's radius is ~3959 miles)
      const radiusInRadians = coordinates.radiusMiles / 3959;
      
      query = {
        PropertyLatitude: { $exists: true, $ne: null },
        PropertyLongitude: { $exists: true, $ne: null },
        $expr: {
          $let: {
            vars: {
              lat1: { $toDouble: "$PropertyLatitude" },
              lon1: { $toDouble: "$PropertyLongitude" },
              lat2: coordinates.latitude,
              lon2: coordinates.longitude
            },
            in: {
              $lte: [
                {
                  $multiply: [
                    3959, // Earth's radius in miles
                    {
                      $acos: {
                        $add: [
                          {
                            $multiply: [
                              { $sin: { $multiply: ["$$lat1", { $divide: [Math.PI, 180] }] } },
                              { $sin: { $multiply: ["$$lat2", { $divide: [Math.PI, 180] }] } }
                            ]
                          },
                          {
                            $multiply: [
                              {
                                $multiply: [
                                  { $cos: { $multiply: ["$$lat1", { $divide: [Math.PI, 180] }] } },
                                  { $cos: { $multiply: ["$$lat2", { $divide: [Math.PI, 180] }] } }
                                ]
                              },
                              { $cos: { $multiply: [{ $subtract: ["$$lon2", "$$lon1"] }, { $divide: [Math.PI, 180] }] } }
                            ]
                          }
                        ]
                      }
                    }
                  ]
                },
                coordinates.radiusMiles
              ]
            }
          }
        }
      };
    } else {
      // Exact coordinate match
      query = {
        PropertyLatitude: coordinates.latitude,
        PropertyLongitude: coordinates.longitude
      };
    }
    
    const cursor = db.collection('tax-assessors')
      .find(query)
      .project({
        PropertyAddress: 1,
        AttomId: 1,
        PropertyLatitude: 1,
        PropertyLongitude: 1,
        // Property value & financial
        TaxMarketValueTotal: 1,
        TaxAssessedValueTotal: 1,
        AssessorLastSaleAmount: 1,
        AssessorLastSaleDate: 1,
        DeedLastSalePrice: 1,
        DeedLastSaleDate: 1,
        Valuations: 1,
        // Property age & construction
        YearBuilt: 1,
        YearBuiltEffective: 1,
        // Property size
        AreaBuilding: 1,
        AreaLotSF: 1,
        AreaLotAcres: 1,
        Area1stFloor: 1,
        AreaGross: 1,
        // Basic property details
        BedroomsCount: 1,
        BathCount: 1,
        StoriesCount: 1,
        Construction: 1,
        // Owner info
        DeedOwners: 1,
        PartyOwners: 1,
        // Location
        SitusCounty: 1,
        SitusStateCode: 1,
        // Parcel
        ParcelNumberRaw: 1,
        ParcelAccountNumber: 1,
        // Tax
        TaxFiscalYear: 1,
        TaxBilledAmount: 1,
        TaxYearAssessed: 1,
        // Last update
        AssrLastUpDated: 1,
        LastAssessorTaxRollUpDate: 1,
        PublicationDate: 1,
        // Counts
        BuildingPermitsCount: 1,
        RecordersCount: 1,
        ValuationsCount: 1,
      })
      .limit(limit)
      .maxTimeMS(60000);

    const results = await cursor.toArray();
    
    // Calculate distance for each result if radius search was used
    if (coordinates.radiusMiles && coordinates.radiusMiles > 0) {
      results.forEach((result: any) => {
        if (result.PropertyLatitude && result.PropertyLongitude) {
          const lat1 = parseFloat(result.PropertyLatitude);
          const lon1 = parseFloat(result.PropertyLongitude);
          const lat2 = coordinates.latitude;
          const lon2 = coordinates.longitude;
          
          // Haversine formula for distance calculation
          const R = 3959; // Earth's radius in miles
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          result.distanceFromSearchPoint = Math.round(distance * 100) / 100; // Round to 2 decimal places
        }
      });
      
      // Sort by distance if radius search
      results.sort((a: any, b: any) => (a.distanceFromSearchPoint || 0) - (b.distanceFromSearchPoint || 0));
    }
    
    return {
      searchCoordinates: coordinates,
      count: results.length,
      results
    };
  },
};

export default { connectToAttom, attomDbTools };

