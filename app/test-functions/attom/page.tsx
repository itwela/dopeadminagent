"use client";

import { useState } from "react";
import Link from "next/link";

export default function AttomTestFunctionsPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);

  // Input states for different functions
  const [collectionName, setCollectionName] = useState("");
  const [query, setQuery] = useState("{}");
  const [field, setField] = useState("");
  const [limit, setLimit] = useState("10");
  const [sortField, setSortField] = useState("_id");
  const [pipeline, setPipeline] = useState("[]");

  const runTest = async (functionName: string, params?: any) => {
    setLoading(true);
    setSelectedFunction(functionName);
    try {
      const response = await fetch("/api/attom/test-functions", {
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
              <span className="text-green-500">ATTOM</span> Function Tester
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Database: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">TaxAssessors</code>
            </p>
          </div>
          <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg">
            <div className="text-sm font-semibold text-green-800 dark:text-green-200">DB 2/3</div>
            <div className="text-xs text-green-600 dark:text-green-300">ATTOM</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <a
            href="/api/attom/info"
            target="_blank"
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition shadow flex items-center justify-between"
          >
            <div>
              <div className="font-bold mb-1">📊 View All Collections</div>
              <div className="text-xs opacity-90">Get list of all collections</div>
            </div>
            <div className="text-2xl">→</div>
          </a>

          <a
            href="/api/attom/test-connection"
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
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Available Functions:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">attomDbTools.listCollections()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">attomDbTools.getCollectionInfo()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">attomDbTools.executeFind()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">attomDbTools.countDocuments()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">attomDbTools.getRecentDocuments()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">attomDbTools.executeAggregation()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">attomDbTools.getDistinctValues()</div>
            <div className="bg-white dark:bg-slate-800 px-2 py-1 rounded">attomDbTools.getIndexes()</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Function buttons */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Available Functions</h2>

              {/* List Collections */}
              <button
                onClick={() => runTest("listCollections")}
                className="w-full mb-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-md text-left transition"
              >
                <div className="font-mono text-sm">attomDbTools.listCollections()</div>
                <div className="text-xs opacity-80 mt-1">
                  Get all collection names in ATTOM database
                </div>
              </button>

              {/* Get Collection Info */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
                <div className="font-mono text-sm mb-2">
                  attomDbTools.getCollectionInfo(collectionName)
                </div>
                <input
                  type="text"
                  placeholder="Collection name"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("getCollectionInfo", { collectionName })}
                  disabled={!collectionName}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>

              {/* Execute Find */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
                <div className="font-mono text-sm mb-2">
                  attomDbTools.executeFind(collectionName, query, options)
                </div>
                <input
                  type="text"
                  placeholder="Collection name"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <textarea
                  placeholder='{"status": "active"}'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 font-mono text-sm bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("executeFind", { 
                    collectionName, 
                    query: JSON.parse(query),
                    options: { limit: 10 }
                  })}
                  disabled={!collectionName}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>

              {/* Count Documents */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
                <div className="font-mono text-sm mb-2">
                  attomDbTools.countDocuments(collectionName, query?)
                </div>
                <input
                  type="text"
                  placeholder="Collection name"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <textarea
                  placeholder='{"status": "active"} (optional)'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 font-mono text-sm bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("countDocuments", {
                      collectionName,
                      query: query ? JSON.parse(query) : {},
                    })
                  }
                  disabled={!collectionName}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>

              {/* Get Recent Documents */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
                <div className="font-mono text-sm mb-2">
                  attomDbTools.getRecentDocuments(collectionName, limit?, sortField?)
                </div>
                <input
                  type="text"
                  placeholder="Collection name"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
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
                  placeholder="Sort field (default: _id)"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("getRecentDocuments", {
                      collectionName,
                      limit: parseInt(limit),
                      sortField,
                    })
                  }
                  disabled={!collectionName}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>

              {/* Execute Aggregation */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
                <div className="font-mono text-sm mb-2">
                  attomDbTools.executeAggregation(collectionName, pipeline)
                </div>
                <input
                  type="text"
                  placeholder="Collection name"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <textarea
                  placeholder='[{"$match": {"status": "active"}}, {"$limit": 5}]'
                  value={pipeline}
                  onChange={(e) => setPipeline(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 font-mono text-sm bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("executeAggregation", { 
                    collectionName,
                    pipeline: JSON.parse(pipeline)
                  })}
                  disabled={!collectionName}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>

              {/* Get Distinct Values */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
                <div className="font-mono text-sm mb-2">
                  attomDbTools.getDistinctValues(collectionName, field, query?)
                </div>
                <input
                  type="text"
                  placeholder="Collection name"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="text"
                  placeholder="Field name (e.g., status)"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("getDistinctValues", { 
                    collectionName,
                    field,
                    query: {}
                  })}
                  disabled={!collectionName || !field}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
                >
                  Run
                </button>
              </div>

              {/* Get Indexes */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md p-3">
                <div className="font-mono text-sm mb-2">
                  attomDbTools.getIndexes(collectionName)
                </div>
                <input
                  type="text"
                  placeholder="Collection name"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("getIndexes", { collectionName })}
                  disabled={!collectionName}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition"
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
                  <div className="mb-2 text-xs text-green-600 dark:text-green-400">
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

