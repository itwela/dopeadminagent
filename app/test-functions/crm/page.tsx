"use client";

import Link from "next/link";
import { useState } from "react";

export default function CrmTestFunctionsPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);

  // Input states for different functions
  const [collectionName, setCollectionName] = useState("");
  const [limit, setLimit] = useState("10");
  const [sortField, setSortField] = useState("_id");
  
  // External Objects query states
  const [accountId, setAccountId] = useState("");
  const [integrationsCustomerId, setIntegrationsCustomerId] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [crmId, setCrmId] = useState("");
  
  // Connections query states
  const [dataSource, setDataSource] = useState("");
  
  // External Objects query states
  const [dataTypes, setDataTypes] = useState("");
  const [dataSources, setDataSources] = useState("");

  const runTest = async (functionName: string, params?: any) => {
    setLoading(true);
    setSelectedFunction(functionName);
    try {
      const response = await fetch("/api/crm/test-functions", {
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
              CRM Function Tester
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Database: <code style={{ background: 'var(--background)', padding: '0.125rem 0.375rem', borderRadius: 'calc(var(--radius) - 0.25rem)', fontSize: '0.75rem' }}>CRM</code>
            </p>
          </div>
          <div className="badge" style={{ height: 'fit-content', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
            CRM
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <a
            href="/api/crm/info"
            target="_blank"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>📊 View All Collections</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>Get list of all collections</div>
            </div>
            <div>→</div>
          </a>

          <a
            href="/api/crm/test-connection"
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
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.listCollections()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getCollectionInfo()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getRecentDocuments()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getRecentExternalObjects()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getRecentConnections()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getConnectionsForCustomer()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getConnectionsByDataSource()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getConnectionStats()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getExternalObjectsByDataSource()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getExternalObjectStatsByDataSource()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getExternalObjectsByDataType()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getExternalObjectStatsByDataType()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getFirst10Accounts()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getRandom10Accounts()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getExternalObjectsForCustomer()</div>
            <div className="badge" style={{ width: '100%', justifyContent: 'flex-start' }}>crmDbTools.getAccountByName()</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Left side - Function buttons */}
          <div className="stack" style={{ padding: '0.5rem' }}>
            <div className="card flex flex-col gap-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>Available Functions</h2>

              {/* List Collections */}
              <button
                onClick={() => runTest("listCollections")}
                className="function-button"
              >
                <div className="function-name">crmDbTools.listCollections()</div>
                <div className="function-description">
                  Get all collection names in CRM database
                </div>
              </button>

              

              {/* Get Account by Name */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                
                <div className="font-mono text-sm mb-2">
                  crmDbTools.getAccountByName(nameQuery, options?)
                </div>
                <input
                  type="text"
                  placeholder="Account name (e.g., 'Dope Marketing')"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="number"
                  placeholder="Limit (default: 25)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("getAccountByName", {
                      nameQuery,
                      limit: parseInt(limit) || 25,
                      skip: 0,
                    })
                  }
                  disabled={!nameQuery}
                  className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search CRM by Name
                </button>

              </div>

              {/* Get Account by _id */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  crmDbTools.getAccountById(id)
                </div>
                <input
                  type="text"
                  placeholder="CRM _id (e.g., 652d5f3003b518f309936f90)"
                  value={crmId}
                  onChange={(e) => setCrmId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("getAccountById", { id: crmId })}
                  disabled={!crmId}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get CRM Account by _id
                </button>
              </div>

              {/* Get First 10 Accounts */}
              <button
                onClick={() => runTest("getFirst10Accounts")}
                className="function-button"
              >
                <div className="function-name">crmDbTools.getFirst10Accounts()</div>
                <div className="function-description">
                  Get first 10 accounts from the accounts collection
                </div>
              </button>

              {/* Get Random 10 Accounts */}
              <button
                onClick={() => runTest("getRandom10Accounts")}
                className="function-button"
              >
                <div className="function-name">crmDbTools.getRandom10Accounts()</div>
                <div className="function-description">
                  Get 10 random accounts from the accounts collection
                </div>
              </button>

              {/* Get Recent External Objects */}
              <div className="mb-3 border border-green-300 dark:border-green-600 rounded-md !p-3 bg-green-50 dark:bg-green-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-green-800 dark:text-green-200">
                  crmDbTools.getRecentExternalObjects()
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                  Get recent external objects from the externalobjects collection
                </p>
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
                    runTest("getRecentExternalObjects", {
                      limit: parseInt(limit) || 10,
                      sortField: sortField || '_id'
                    })
                  }
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Recent External Objects
                </button>
              </div>

              {/* CONNECTIONS SECTION */}
              <div className="mb-3 border border-orange-300 dark:border-orange-600 rounded-md !p-3 bg-orange-50 dark:bg-orange-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-orange-800 dark:text-orange-200">
                  🔗 CONNECTIONS COLLECTION
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                  Explore customer connections and integration data
                </p>
              </div>

              {/* Get Recent Connections */}
              <div className="mb-3 border border-orange-300 dark:border-orange-600 rounded-md !p-3 bg-orange-50 dark:bg-orange-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-orange-800 dark:text-orange-200">
                  crmDbTools.getRecentConnections()
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                  Get recent connections from the connections collection
                </p>
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
                    runTest("getRecentConnections", {
                      limit: parseInt(limit) || 10,
                      sortField: sortField || '_id'
                    })
                  }
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Recent Connections
                </button>
              </div>

              {/* Get Connections for Customer */}
              <div className="mb-3 border border-orange-300 dark:border-orange-600 rounded-md !p-3 bg-orange-50 dark:bg-orange-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-orange-800 dark:text-orange-200">
                  crmDbTools.getConnectionsForCustomer()
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                  Get connections for a specific customer/account
                </p>
                <input
                  type="text"
                  placeholder="Account ID (required)"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="number"
                  placeholder="Limit (default: 10)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("getConnectionsForCustomer", {
                      accountId,
                      limit: parseInt(limit) || 10
                    })
                  }
                  disabled={!accountId}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Customer Connections
                </button>
              </div>

              {/* Get Connections by DataSource */}
              <div className="mb-3 border border-orange-300 dark:border-orange-600 rounded-md !p-3 bg-orange-50 dark:bg-orange-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-orange-800 dark:text-orange-200">
                  crmDbTools.getConnectionsByDataSource()
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                  Get connections filtered by dataSource (e.g., &apos;housecallpro&apos;, &apos;servicetitan&apos;)
                </p>
                <input
                  type="text"
                  placeholder="DataSource (e.g., 'housecallpro', 'servicetitan')"
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="number"
                  placeholder="Limit (default: 10)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("getConnectionsByDataSource", {
                      dataSource,
                      limit: parseInt(limit) || 10
                    })
                  }
                  disabled={!dataSource}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Connections by DataSource
                </button>
              </div>

              {/* Get Connection Stats */}
              <button
                onClick={() => runTest("getConnectionStats")}
                className="function-button mb-3"
                style={{ border: '1px solid #f97316', background: 'rgba(249, 115, 22, 0.05)' }}
              >
                <div className="function-name" style={{ color: '#ea580c' }}>crmDbTools.getConnectionStats()</div>
                <div className="function-description">
                  Get statistics about the connections collection
                </div>
              </button>

              {/* EXTERNAL OBJECTS SECTION */}
              <div className="mb-3 border border-purple-300 dark:border-purple-600 rounded-md !p-3 bg-purple-50 dark:bg-purple-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-purple-800 dark:text-purple-200">
                  📊 EXTERNAL OBJECTS COLLECTION
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                  Search external objects by dataSource (housecallpro, servicetitan) or dataType (customer, job, invoice)
                </p>
              </div>

              {/* Get External Objects by DataSource */}
              <div className="mb-3 border border-purple-300 dark:border-purple-600 rounded-md !p-3 bg-purple-50 dark:bg-purple-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-purple-800 dark:text-purple-200">
                  crmDbTools.getExternalObjectsByDataSource()
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                  Get external objects for a customer filtered by dataSource(s) like &quot;housecallpro&quot; or &quot;servicetitan&quot;. Separate multiple sources with commas.
                </p>
                <input
                  type="text"
                  placeholder="Account ID (required)"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="text"
                  placeholder="DataSources (e.g., 'housecallpro', 'servicetitan' or 'housecallpro,servicetitan')"
                  value={dataSources}
                  onChange={(e) => setDataSources(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="number"
                  placeholder="Limit (default: 20)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => {
                    const dataSourcesArray = dataSources.split(',').map(source => source.trim()).filter(source => source.length > 0);
                    runTest("getExternalObjectsByDataSource", {
                      accountId,
                      dataSources: dataSourcesArray.length === 1 ? dataSourcesArray[0] : dataSourcesArray,
                      limit: parseInt(limit) || 20
                    });
                  }}
                  disabled={!accountId || !dataSources}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get External Objects by DataSource
                </button>
              </div>

              {/* Get External Object Stats by DataSource */}
              <div className="mb-3 border border-purple-300 dark:border-purple-600 rounded-md !p-3 bg-purple-50 dark:bg-purple-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-purple-800 dark:text-purple-200">
                  crmDbTools.getExternalObjectStatsByDataSource()
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                  Get statistics about external objects by dataSource for a customer (shows breakdown by integration)
                </p>
                <input
                  type="text"
                  placeholder="Account ID (required)"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("getExternalObjectStatsByDataSource", {
                      accountId
                    })
                  }
                  disabled={!accountId}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Stats by DataSource
                </button>
              </div>

              {/* Get External Objects by DataType */}
              <div className="mb-3 border border-purple-300 dark:border-purple-600 rounded-md !p-3 bg-purple-50 dark:bg-purple-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-purple-800 dark:text-purple-200">
                  crmDbTools.getExternalObjectsByDataType()
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                  Get external objects for a customer filtered by dataType(s). Separate multiple types with commas.
                </p>
                <input
                  type="text"
                  placeholder="Account ID (required)"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="text"
                  placeholder="DataTypes (e.g., 'customer', 'job', 'invoice' or 'customer,job')"
                  value={dataTypes}
                  onChange={(e) => setDataTypes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="number"
                  placeholder="Limit (default: 20)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => {
                    const dataTypesArray = dataTypes.split(',').map(type => type.trim()).filter(type => type.length > 0);
                    runTest("getExternalObjectsByDataType", {
                      accountId,
                      dataTypes: dataTypesArray.length === 1 ? dataTypesArray[0] : dataTypesArray,
                      limit: parseInt(limit) || 20
                    });
                  }}
                  disabled={!accountId || !dataTypes}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get External Objects by DataType
                </button>
              </div>

              {/* Get External Object Stats by DataType */}
              <div className="mb-3 border border-purple-300 dark:border-purple-600 rounded-md !p-3 bg-purple-50 dark:bg-purple-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-purple-800 dark:text-purple-200">
                  crmDbTools.getExternalObjectStatsByDataType()
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                  Get statistics about external objects by dataType for a customer
                </p>
                <input
                  type="text"
                  placeholder="Account ID (required)"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("getExternalObjectStatsByDataType", {
                      accountId
                    })
                  }
                  disabled={!accountId}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get External Object Stats
                </button>
              </div>

              {/* Get External Objects for Customer */}
              <div className="mb-3 border border-blue-300 dark:border-blue-600 rounded-md !p-3 bg-blue-50 dark:bg-blue-900/20">
                <div className="font-mono text-sm mb-2 font-bold text-blue-800 dark:text-blue-200">
                  crmDbTools.getExternalObjectsForCustomer()
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Get first 10 external objects for a given account
                </p>
                <input
                  type="text"
                  placeholder="Account ID (required)"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="number"
                  placeholder="Limit (default: 10)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() =>
                    runTest("getExternalObjectsForCustomer", {
                      accountId,
                      limit: parseInt(limit) || 10,
                    })
                  }
                  disabled={!accountId}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get External Objects
                </button>
              </div>

              {/* Get Collection Info */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  crmDbTools.getCollectionInfo(collectionName)
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
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Run
                </button>
              </div>

              {/* Get Recent Documents */}
              <div className="mb-3 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  crmDbTools.getRecentDocuments(collectionName, limit?, sortField?)
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

