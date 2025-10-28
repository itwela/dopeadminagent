"use client";

import { useState } from "react";
import Link from "next/link";

export default function DopeCoreTestFunctionsPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);

  // Input states for different functions
  const [tableName, setTableName] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [whereClause, setWhereClause] = useState("");
  const [limit, setLimit] = useState("10");
  const [orderByColumn, setOrderByColumn] = useState("created_at");
  const [nameQuery, setNameQuery] = useState("");
  const [searchLimit, setSearchLimit] = useState("25");
  const [searchOffset, setSearchOffset] = useState("0");
  const [integrationsCustomerId, setIntegrationsCustomerId] = useState("");

  const runTest = async (functionName: string, params?: any) => {
    setLoading(true);
    setSelectedFunction(functionName);
    try {
      const response = await fetch("/api/dope-core/test-functions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ function: functionName, params }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div className="stack" style={{ gap: '0.5rem' }}>
            <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none', width: 'fit-content' }}>
              ← Back to Home
            </Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)' }}>
              Dope Core Function Tester
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Database: <code style={{ background: 'var(--background)', padding: '0.125rem 0.375rem', borderRadius: 'calc(var(--radius) - 0.25rem)', fontSize: '0.75rem' }}>dope_mail_production</code>
            </p>
          </div>
          <div className="badge" style={{ height: 'fit-content', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
            Dope Core
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <a
            href="/api/dope-core/info"
            target="_blank"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>📊 View All Tables</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>Get list of all tables</div>
            </div>
            <div>→</div>
          </a>

          <a
            href="/api/dope-core/test-connection"
            target="_blank"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>🔌 Test Connection</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>Verify database connection</div>
            </div>
            <div>→</div>
          </a>
        </div>

        {/* Available Functions Reference */}
        <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.03)', borderColor: 'var(--accent)' }}>
          <h3 style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>Available Functions:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.6875rem', fontFamily: 'monospace' }}>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>dopeCoreDbTools.listTables()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>dopeCoreDbTools.getTableSchema()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>dopeCoreDbTools.executeSelect()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>dopeCoreDbTools.countRows()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>dopeCoreDbTools.getRecentRows()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>dopeCoreDbTools.getFirst10Accounts()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>dopeCoreDbTools.searchAccountsByName()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>dopeCoreDbTools.getIntegrationsCustomerIdByName()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>dopeCoreDbTools.getAccountsByIntegrationsId()</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Left side - Function buttons */}
          <div className="stack" style={{ padding: '0.5rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>Available Functions</h2>

              {/* List Tables */}
              <button
                onClick={() => runTest("listTables")}
                className="function-button"
              >
                <div className="function-name">dopeCoreDbTools.listTables()</div>
                <div className="function-description">
                  Get all table names in Dope Core database
                </div>
              </button>

              {/* Get First 10 Accounts */}
              <button
                onClick={() => runTest("getFirst10Accounts")}
                className="function-button"
              >
                <div className="function-name">dopeCoreDbTools.getFirst10Accounts()</div>
                <div className="function-description">
                  Get first 10 accounts from the accounts table
                </div>
              </button>

              {/* Search Accounts by Name */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  dopeCoreDbTools.searchAccountsByName(nameQuery, options?)
                </div>
                <input
                  type="text"
                  placeholder="Search term (e.g., 'Dope', 'Marketing')"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Limit (default: 25)"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="number"
                    placeholder="Offset (default: 0)"
                    value={searchOffset}
                    onChange={(e) => setSearchOffset(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <button
                  onClick={() =>
                    runTest("searchAccountsByName", {
                      nameQuery,
                      limit: parseInt(searchLimit) || 25,
                      offset: parseInt(searchOffset) || 0,
                    })
                  }
                  disabled={!nameQuery}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search Accounts
                </button>
              </div>

              {/* Get Integrations Customer ID by Name */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  dopeCoreDbTools.getIntegrationsCustomerIdByName(nameQuery, options?)
                </div>
                <input
                  type="text"
                  placeholder="Search term (e.g., 'Dope Marketing')"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Limit (default: 25)"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="number"
                    placeholder="Offset (default: 0)"
                    value={searchOffset}
                    onChange={(e) => setSearchOffset(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <button
                  onClick={() =>
                    runTest("getIntegrationsCustomerIdByName", {
                      nameQuery,
                      limit: parseInt(searchLimit) || 25,
                      offset: parseInt(searchOffset) || 0,
                    })
                  }
                  disabled={!nameQuery}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Integrations Customer ID
                </button>
              </div>

              {/* Get Accounts by Integrations Customer ID */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  dopeCoreDbTools.getAccountsByIntegrationsId(integrationsCustomerId, options?)
                </div>
                <input
                  type="text"
                  placeholder="integrations_customer_id"
                  value={integrationsCustomerId}
                  onChange={(e) => setIntegrationsCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Limit (default: 25)"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="number"
                    placeholder="Offset (default: 0)"
                    value={searchOffset}
                    onChange={(e) => setSearchOffset(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <button
                  onClick={() =>
                    runTest("getAccountsByIntegrationsId", {
                      integrationsCustomerId,
                      limit: parseInt(searchLimit) || 25,
                      offset: parseInt(searchOffset) || 0,
                    })
                  }
                  disabled={!integrationsCustomerId}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Accounts by Integrations ID
                </button>
              </div>

              {/* Get Table Schema */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  dopeCoreDbTools.getTableSchema(tableName)
                </div>
                <input
                  type="text"
                  placeholder="Table name"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("getTableSchema", { tableName })}
                  disabled={!tableName}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Run
                </button>
              </div>

              {/* Execute Select */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  dopeCoreDbTools.executeSelect(query)
                </div>
                <textarea
                  placeholder="SELECT * FROM table_name LIMIT 5"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 font-mono text-sm bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("executeSelect", { query: sqlQuery })}
                  disabled={!sqlQuery}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Run
                </button>
              </div>

              {/* Count Rows */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  dopeCoreDbTools.countRows(tableName, whereClause?)
                </div>
                <input
                  type="text"
                  placeholder="Table name"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="text"
                  placeholder="WHERE clause (optional)"
                  value={whereClause}
                  onChange={(e) => setWhereClause(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("countRows", {
                      tableName,
                      whereClause: whereClause || undefined,
                    })
                  }
                  disabled={!tableName}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Run
                </button>
              </div>

              {/* Get Recent Rows */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  dopeCoreDbTools.getRecentRows(tableName, limit?, orderByColumn?)
                </div>
                <input
                  type="text"
                  placeholder="Table name"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="number"
                  placeholder="Limit (default: 10)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="text"
                  placeholder="Order by column (default: created_at)"
                  value={orderByColumn}
                  onChange={(e) => setOrderByColumn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("getRecentRows", {
                      tableName,
                      limit: parseInt(limit),
                      orderByColumn,
                    })
                  }
                  disabled={!tableName}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Run
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Results */}
          <div className="card" style={{ position: 'sticky', top: '2rem', maxHeight: 'calc(100vh - 4rem)', overflow: 'auto' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>Results</h2>

            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Running {selectedFunction}...</div>
              </div>
            )}

            {!loading && !results && (
              <div style={{ textAlign: 'center', padding: '3rem 0', fontSize: '0.8125rem', color: 'var(--muted)' }}>
                Click a function to see results
              </div>
            )}

            {!loading && results && (
              <div>
                <div className="row" style={{ marginBottom: '0.75rem', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--muted)' }}>
                    {selectedFunction}
                  </div>
                  {results.success !== undefined && (
                    <div
                      className={results.success ? "badge badge-success" : "badge"}
                      style={{ background: results.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: results.success ? 'var(--success)' : '#ef4444' }}
                    >
                      {results.success ? "SUCCESS" : "ERROR"}
                    </div>
                  )}
                </div>
                {results.database && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.6875rem', color: 'var(--accent)' }}>
                    Database: {results.database}
                  </div>
                )}
                <pre style={{ background: '#18181b', color: '#10b981', padding: '0.75rem', borderRadius: 'var(--radius)', overflow: 'auto', maxHeight: '600px', fontSize: '0.6875rem', lineHeight: 1.4 }}>
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

