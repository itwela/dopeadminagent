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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-blue-500 hover:underline mb-2 block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-purple-500">Dope Core</span> Function Tester
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Database: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">dope_mail_production</code>
            </p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 px-4 py-2 rounded-lg">
            <div className="text-sm font-semibold text-purple-800 dark:text-purple-200">DB 1/3</div>
            <div className="text-xs text-purple-600 dark:text-purple-300">Dope Core</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <a
            href="/api/dope-core/info"
            target="_blank"
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition shadow flex items-center justify-between"
          >
            <div>
              <div className="font-bold mb-1">📊 View All Tables</div>
              <div className="text-xs opacity-90">Get list of all tables</div>
            </div>
            <div className="text-2xl">→</div>
          </a>

          <a
            href="/api/dope-core/test-connection"
            target="_blank"
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition shadow flex items-center justify-between"
          >
            <div>
              <div className="font-bold mb-1">🔌 Test Connection</div>
              <div className="text-xs opacity-90">Verify database connection</div>
            </div>
            <div className="text-2xl">→</div>
          </a>
        </div>

        {/* Available Functions Reference */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Available Functions:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">dopeCoreDbTools.listTables()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">dopeCoreDbTools.getTableSchema()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">dopeCoreDbTools.executeSelect()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">dopeCoreDbTools.countRows()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">dopeCoreDbTools.getRecentRows()</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Function buttons */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Available Functions</h2>

              {/* List Tables */}
              <button
                onClick={() => runTest("listTables")}
                className="w-full mb-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-md text-left transition"
              >
                <div className="font-mono text-sm">dopeCoreDbTools.listTables()</div>
                <div className="text-xs opacity-80 mt-1">
                  Get all table names in Dope Core database
                </div>
              </button>

              {/* Get Table Schema */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
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
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>

              {/* Execute Select */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
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
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>

              {/* Count Rows */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
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
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>

              {/* Get Recent Rows */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
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
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Results */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow sticky top-8 max-h-[calc(100vh-4rem)] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Results</h2>

            {loading && (
              <div className="text-center py-12">
                <div className="text-slate-500">Running {selectedFunction}...</div>
              </div>
            )}

            {!loading && !results && (
              <div className="text-center py-12 text-slate-400">
                Click a function to see results
              </div>
            )}

            {!loading && results && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-mono text-slate-500">
                    {selectedFunction}
                  </div>
                  {results.success !== undefined && (
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        results.success
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {results.success ? "SUCCESS" : "ERROR"}
                    </div>
                  )}
                </div>
                {results.database && (
                  <div className="mb-2 text-xs text-purple-600 dark:text-purple-400">
                    Database: {results.database}
                  </div>
                )}
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[600px] text-sm">
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

