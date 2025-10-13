import { Pool, QueryResult, QueryResultRow } from 'pg';

// Create a connection pool
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

// Test connection on initialization
pool.on('connect', () => {
  console.log('✅ Connected to Dope Core PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Dope Core - Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a SQL query
 * @param text SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export async function query<T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a single row from a query
 * @param text SQL query string
 * @param params Query parameters
 * @returns Single row or null
 */
export async function queryOne<T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

/**
 * Get all rows from a query
 * @param text SQL query string
 * @param params Query parameters
 * @returns Array of rows
 */
export async function queryAll<T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Execute multiple queries in a transaction
 * @param callback Function containing queries to execute
 * @returns Result of the callback
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Dope Core Database - Utility functions for agent tools
 */
export const dopeCoreDbTools = {
  /**
   * List all tables in the database
   */
  listTables: async () => {
    const result = await queryAll<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );
    return result.map(row => row.tablename);
  },

  /**
   * Get table schema/structure
   */
  getTableSchema: async (tableName: string) => {
    const result = await queryAll<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }>(
      `SELECT column_name, data_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_name = $1 
       ORDER BY ordinal_position`,
      [tableName]
    );
    return result;
  },

  /**
   * Execute a SELECT query (read-only)
   */
  executeSelect: async (sqlQuery: string, params?: any[]) => {
    // Security: ensure it's a SELECT query
    const trimmed = sqlQuery.trim().toLowerCase();
    if (!trimmed.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }
    return await queryAll(sqlQuery, params);
  },

  /**
   * Count rows in a table
   */
  countRows: async (tableName: string, whereClause?: string, params?: any[]) => {
    const sql = whereClause 
      ? `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereClause}`
      : `SELECT COUNT(*) as count FROM ${tableName}`;
    const result = await queryOne<{ count: string }>(sql, params);
    return result ? parseInt(result.count, 10) : 0;
  },

  /**
   * Get recent rows from a table
   */
  getRecentRows: async (
    tableName: string, 
    limit: number = 10, 
    orderByColumn: string = 'created_at'
  ) => {
    return await queryAll(
      `SELECT * FROM ${tableName} ORDER BY ${orderByColumn} DESC LIMIT $1`,
      [limit]
    );
  },
};

export default pool;

