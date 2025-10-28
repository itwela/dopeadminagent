# CRM MongoDB Database Integration

This document describes the CRM MongoDB database integration for the Dope Admin Agent project.

## Overview

The CRM database is a MongoDB database that stores customer relationship management data. This integration provides a set of tools for querying and analyzing CRM data through Next.js API routes.

## Setup

### Environment Variables

Add your CRM MongoDB connection string to your `.env.local` file:

```bash
CRM_MONGODB_URI=<your_mongodb_connection_string>
```

## File Structure

```
lib/
  ├── crm-db.ts              # Core database connection and tools

app/api/crm/
  ├── info/
  │   └── route.ts           # GET endpoint for database info
  ├── test-connection/
  │   └── route.ts           # GET endpoint to test connection
  └── test-functions/
      └── route.ts           # POST endpoint to execute database functions

app/test-functions/crm/
  └── page.tsx               # UI for testing CRM functions
```

## Core Functions

The `crmDbTools` object in `lib/crm-db.ts` provides the following functions:

### 1. listCollections()
Returns an array of all collection names in the database.

```typescript
const collections = await crmDbTools.listCollections();
```

### 2. getCollectionInfo(collectionName)
Get detailed information about a specific collection including:
- Estimated document count
- Sample document
- Field schema inference
- Index count

```typescript
const info = await crmDbTools.getCollectionInfo('customers');
```

### 3. executeFind(collectionName, query, options)
Execute a MongoDB find query with optional parameters.

```typescript
const results = await crmDbTools.executeFind(
  'customers',
  { status: 'active' },
  { limit: 10, sort: { createdAt: -1 } }
);
```

### 4. countDocuments(collectionName, query)
Count documents matching a query.

```typescript
const count = await crmDbTools.countDocuments('customers', { status: 'active' });
```

### 5. getRecentDocuments(collectionName, limit, sortField)
Get the most recent documents from a collection.

```typescript
const recent = await crmDbTools.getRecentDocuments('customers', 10, '_id');
```

### 6. executeAggregation(collectionName, pipeline)
Execute a MongoDB aggregation pipeline.

```typescript
const results = await crmDbTools.executeAggregation('customers', [
  { $match: { status: 'active' } },
  { $group: { _id: '$country', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

### 7. getDistinctValues(collectionName, field, query)
Get distinct values for a specific field.

```typescript
const statuses = await crmDbTools.getDistinctValues('customers', 'status', {});
```

### 8. getIndexes(collectionName)
Get all indexes for a collection.

```typescript
const indexes = await crmDbTools.getIndexes('customers');
```

## API Routes

### GET /api/crm/info
Returns database information including all collections and their stats.

**Response:**
```json
{
  "success": true,
  "database": "crm_database",
  "totalCollections": 5,
  "collections": [...],
  "allCollectionNames": [...]
}
```

### GET /api/crm/test-connection
Tests the database connection.

**Response:**
```json
{
  "success": true,
  "message": "Connected to CRM MongoDB!",
  "database": "crm_database",
  "host": "cluster.mongodb.net"
}
```

### POST /api/crm/test-functions
Execute any of the CRM database tools.

**Request Body:**
```json
{
  "function": "executeFind",
  "params": {
    "collectionName": "customers",
    "query": { "status": "active" },
    "options": { "limit": 10 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "database": "CRM",
  "function": "executeFind",
  "params": {...},
  "result": [...]
}
```

## Testing Interface

Visit `/test-functions/crm` to access the interactive testing interface where you can:
- Test all database functions
- View collection information
- Execute queries and aggregations
- Inspect results in real-time

## Connection Caching

The CRM database connection uses global caching to prevent multiple connections in development:

```typescript
global.crmMongooseCache = {
  conn: null,
  promise: null
}
```

This ensures efficient connection reuse across hot reloads.

## Usage in AI Agents

These tools are designed to be easily called by AI agents. Each function:
- Has a clear, descriptive name
- Accepts JSON-serializable parameters
- Returns structured data
- Includes error handling
- Is accessible via API routes

## Example: Agent Usage

An AI agent can query customer data like this:

```typescript
// 1. List all collections
const collections = await fetch('/api/crm/test-functions', {
  method: 'POST',
  body: JSON.stringify({
    function: 'listCollections',
    params: {}
  })
});

// 2. Get active customers
const customers = await fetch('/api/crm/test-functions', {
  method: 'POST',
  body: JSON.stringify({
    function: 'executeFind',
    params: {
      collectionName: 'customers',
      query: { status: 'active' },
      options: { limit: 20 }
    }
  })
});
```

## Security Considerations

- All database operations are read-only
- Connection string should be kept in environment variables
- API routes should be protected with authentication in production
- Consider rate limiting for production use

## Performance Tips

1. Use `estimatedDocumentCount()` for fast counts (doesn't scan documents)
2. Limit query results to avoid memory issues
3. Use indexes for frequently queried fields
4. Use aggregation pipelines for complex queries
5. Cache collection metadata when possible

## Common Collections (Examples)

Typical CRM collections might include:
- `customers` - Customer information
- `contacts` - Contact details
- `companies` - Company data
- `deals` - Sales opportunities
- `activities` - Customer interactions
- `notes` - Customer notes

## Troubleshooting

### Connection Fails
- Check `CRM_MONGODB_URI` in `.env.local`
- Verify MongoDB cluster is accessible
- Check network/firewall settings
- Verify database credentials

### Collection Not Found
- Use `listCollections()` to see available collections
- Check collection name spelling
- Verify database permissions

### Query Returns No Results
- Test with an empty query `{}`
- Check collection has documents
- Verify query syntax is correct

## Next Steps

1. Add write operations (mutations) if needed
2. Implement authentication for API routes
3. Add rate limiting
4. Create agent-specific wrapper functions
5. Add data validation and sanitization
6. Implement caching for frequently accessed data

