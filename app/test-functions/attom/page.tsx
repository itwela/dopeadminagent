"use client";

import Link from "next/link";
import { useState } from "react";

export default function AttomTestFunctionsPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);

  // Input states for different functions
  const [collectionName, setCollectionName] = useState("");
  const [query, setQuery] = useState("{}");
  const [field, setField] = useState("");
  const [limit, setLimit] = useState("10");
  const [skip, setSkip] = useState("0");
  const [sort, setSort] = useState("desc");
  const [sortField, setSortField] = useState("_id");
  const [pipeline, setPipeline] = useState("[]");
  
  // Collection-specific inputs
  const [addressQuery, setAddressQuery] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [state, setState] = useState("");
  const [fieldName, setFieldName] = useState("");
  
  // Property search inputs
  const [searchZip, setSearchZip] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");
  const [booleanFlags, setBooleanFlags] = useState("");
  const [numericFields, setNumericFields] = useState("");
  const [statsFields, setStatsFields] = useState("");
  
  // Custom field search inputs
  const [customFields, setCustomFields] = useState("");
  const [customAddressFields, setCustomAddressFields] = useState({
    Full: "",
    City: "",
    State: "",
    ZIP: ""
  });
  const [customOtherCriteria, setCustomOtherCriteria] = useState("");

  // Geo coordinates search inputs
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMiles, setRadiusMiles] = useState("");

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
    <div style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div className="stack" style={{ gap: '0.5rem' }}>
            <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none', width: 'fit-content' }}>
              ← Back to Home
            </Link>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)' }}>
              ATTOM Collection Explorer
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Database: <code style={{ background: 'var(--background)', padding: '0.125rem 0.375rem', borderRadius: 'calc(var(--radius) - 0.25rem)', fontSize: '0.75rem' }}>TaxAssessors</code>
            </p>
          </div>
          <div className="badge badge-success" style={{ height: 'fit-content' }}>
            ATTOM
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <a
            href="/api/attom/info"
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
            href="/api/attom/test-connection"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Left side - Collection-specific functions */}
          <div className="stack" style={{ padding: '0.5rem' }}>
            
            {/* Tax Assessors Collection */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--accent)' }}>
                🏠 Tax Assessors Collection
              </h2>
              
              {/* Search by Address (structured) */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchTaxAssessorsByAddress({"addressFields"}, limit?)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Full (e.g., 4015 BAKERS FERRY RD SW)"
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value.toUpperCase())}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value.toUpperCase())}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={zip}
                    onChange={(e) => setZip(e.target.value.toUpperCase())}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Limit (default: 10)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("searchTaxAssessorsByAddress", { 
                    addressFields: { 
                      Full: addressQuery,
                      City: city || undefined,
                      State: state || undefined,
                      ZIP: zip || undefined
                    },
                    limit: parseInt(limit) 
                  })}
                  disabled={!addressQuery && !city && !state && !zip}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search by Address
                </button>
              </div>

              {/* Search by Geo Coordinates */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchTaxAssessorsByCoordinates({"coordinates"}, limit?)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Search by latitude/longitude coordinates. Optionally specify radius for proximity search.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (e.g., 40.7128)"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (e.g., -74.0060)"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Radius in miles (optional)"
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <input
                  type="number"
                  placeholder="Limit (default: 10)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => runTest("searchTaxAssessorsByCoordinates", { 
                      coordinates: { 
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude)
                      },
                      limit: parseInt(limit) 
                    })}
                    disabled={!latitude || !longitude}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                  >
                    🔍 Exact Coordinates
                  </button>
                  <button
                    onClick={() => runTest("searchTaxAssessorsByCoordinates", { 
                      coordinates: { 
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        radiusMiles: parseFloat(radiusMiles) || undefined
                      },
                      limit: parseInt(limit) 
                    })}
                    disabled={!latitude || !longitude || !radiusMiles}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                  >
                    📍 Radius Search
                  </button>
                </div>
              </div>

              {/* Search by City */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  getTaxAssessorsByCity(city, limit?)
                </div>
                <input
                  type="text"
                  placeholder="City name"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
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
                  onClick={() => runTest("getTaxAssessorsByCity", { 
                    city, 
                    limit: parseInt(limit) 
                  })}
                  disabled={!city}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search by City
                </button>
              </div>

              {/* Search by ZIP */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  getTaxAssessorsByZIP(zip, limit?)
                </div>
                <input
                  type="text"
                  placeholder="ZIP code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
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
                  onClick={() => runTest("getTaxAssessorsByZIP", { 
                    zip, 
                    limit: parseInt(limit) 
                  })}
                  disabled={!zip}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search by ZIP
                </button>
              </div>

              {/* Search by State */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  getTaxAssessorsByState(state, limit?)
                </div>
                <input
                  type="text"
                  placeholder="State (e.g., CA, TX, FL)"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
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
                  onClick={() => runTest("getTaxAssessorsByState", { 
                    state, 
                    limit: parseInt(limit) 
                  })}
                  disabled={!state}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search by State
                </button>
              </div>

              {/* Get Recent Tax Assessors */}
              <button
                onClick={() => runTest("getRecentTaxAssessors", { limit: parseInt(limit) })}
                className="function-button"
              >
                <div className="function-name">getRecentTaxAssessors(limit)</div>
                <div className="function-description">
                  Get most recent records from tax-assessors collection
                </div>
              </button>

              {/* Custom Field Search */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchTaxAssessorsWithFields(searchCriteria, options)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Search with custom field selection - specify exactly which fields to return
                </div>
                
                {/* Address Fields */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Address Fields (optional):</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Full Address"
                      value={customAddressFields.Full}
                      onChange={(e) => setCustomAddressFields(prev => ({ ...prev, Full: e.target.value.toUpperCase() }))}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={customAddressFields.City}
                      onChange={(e) => setCustomAddressFields(prev => ({ ...prev, City: e.target.value.toUpperCase() }))}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={customAddressFields.State}
                      onChange={(e) => setCustomAddressFields(prev => ({ ...prev, State: e.target.value.toUpperCase() }))}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="ZIP"
                      value={customAddressFields.ZIP}
                      onChange={(e) => setCustomAddressFields(prev => ({ ...prev, ZIP: e.target.value.toUpperCase() }))}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>

                {/* Other Criteria */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Other Criteria (JSON, optional):</label>
                  <input
                    type="text"
                    placeholder='{"YearBuilt": {"$gte": 2000}, "BedroomsCount": 3}'
                    value={customOtherCriteria}
                    onChange={(e) => setCustomOtherCriteria(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>

                {/* Fields to Return */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Fields to Return (comma-separated):</label>
                  <input
                    type="text"
                    placeholder="PropertyAddress, AttomId, TaxMarketValueTotal, YearBuilt, BedroomsCount"
                    value={customFields}
                    onChange={(e) => setCustomFields(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    Leave empty to return all fields. Examples: PropertyAddress, AttomId, TaxMarketValueTotal, YearBuilt, BedroomsCount, BathCount
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="Limit (default: 10)"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="number"
                    placeholder="Skip (default: 0)"
                    value={skip}
                    onChange={(e) => setSkip(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <select 
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  >
                    <option value="desc">Sort: Newest First</option>
                    <option value="asc">Sort: Oldest First</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    const searchCriteria: any = {};
                    
                    // Add address fields if any are provided
                    const hasAddressFields = Object.values(customAddressFields).some(val => val.trim());
                    if (hasAddressFields) {
                      searchCriteria.addressFields = {};
                      Object.entries(customAddressFields).forEach(([key, value]) => {
                        if (value.trim()) {
                          searchCriteria.addressFields[key] = value.trim();
                        }
                      });
                    }
                    
                    // Add other criteria if provided
                    if (customOtherCriteria.trim()) {
                      try {
                        searchCriteria.otherCriteria = JSON.parse(customOtherCriteria);
                      } catch (e) {
                        alert('Invalid JSON in Other Criteria field');
                        return;
                      }
                    }
                    
                    // Build options
                    const options: any = {
                      limit: parseInt(limit) || 10,
                      skip: parseInt(skip) || 0,
                      sort: { '_id': sort === 'desc' ? -1 : 1 }
                    };
                    
                    // Add fields if provided
                    if (customFields.trim()) {
                      options.fields = customFields.split(',').map(f => f.trim()).filter(f => f);
                    }
                    
                    runTest("searchTaxAssessorsWithFields", { searchCriteria, options });
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded transition btn-run"
                >
                  🔍 Search with Custom Fields
                </button>
              </div>
            </div>

            {/* Lookup Collections */}
            <div className="bg-white dark:bg-slate-800 rounded-lg !p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
                🔍 Lookup Collections
              </h2>
              
              {/* City Lookup */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchTaxAssessorsLookupByCity(city, limit?)
                </div>
                <input
                  type="text"
                  placeholder="City name"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("searchTaxAssessorsLookupByCity", { 
                    city, 
                    limit: parseInt(limit) 
                  })}
                  disabled={!city}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search City Lookup
                </button>
              </div>

              {/* ZIP Lookup */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchTaxAssessorsLookupByZIP(zip, limit?)
                </div>
                <input
                  type="text"
                  placeholder="ZIP code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("searchTaxAssessorsLookupByZIP", { 
                    zip, 
                    limit: parseInt(limit) 
                  })}
                  disabled={!zip}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search ZIP Lookup
                </button>
              </div>

              {/* State Lookup */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchTaxAssessorsLookupByState(state, limit?)
                </div>
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("searchTaxAssessorsLookupByState", { 
                    state, 
                    limit: parseInt(limit) 
                  })}
                  disabled={!state}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search State Lookup
                </button>
              </div>
            </div>

            {/* Data Sources & Files */}
            <div className="bg-white dark:bg-slate-800 rounded-lg !p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">
                📁 Data Sources & Files
              </h2>
              
              {/* Tax Assessors Data Sources */}
              <button
                onClick={() => runTest("getTaxAssessorsDataSources", { limit: parseInt(limit) })}
                className="function-button"
              >
                <div className="function-name">getTaxAssessorsDataSources(limit)</div>
                <div className="function-description">
                  Get tax assessors data sources
                </div>
              </button>

              {/* Attom Settings */}
              <button
                onClick={() => runTest("getAttomSettings")}
                className="function-button"
              >
                <div className="function-name">getAttomSettings()</div>
                <div className="function-description">
                  Get Attom configuration settings
                </div>
              </button>

              {/* Attom Files */}
              <button
                onClick={() => runTest("getAttomFiles", { limit: parseInt(limit) })}
                className="function-button"
              >
                <div className="function-name">getAttomFiles(limit)</div>
                <div className="function-description">
                  Get recent Attom files
                </div>
              </button>

              {/* Search Addresses */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchTaxAssessorsSearchAddresses(addressQuery, limit?)
                </div>
                <input
                  type="text"
                  placeholder="Address search term"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("searchTaxAssessorsSearchAddresses", { 
                    addressQuery, 
                    limit: parseInt(limit) 
                  })}
                  disabled={!addressQuery}
                  className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search Addresses
                </button>
              </div>

              {/* Field Metadata */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  getFieldMetadata(collectionName?)
                </div>
                <input
                  type="text"
                  placeholder="Collection name (optional)"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("getFieldMetadata", { 
                    collectionName: collectionName || undefined 
                  })}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Field Metadata
                </button>
              </div>

              {/* Search Specific Field */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchFieldInMetadata(fieldName, collectionName?)
                </div>
                <input
                  type="text"
                  placeholder="Field name (e.g., AccessabilityHandicapFlag)"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <input
                  type="text"
                  placeholder="Collection name (optional)"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("searchFieldInMetadata", { 
                    fieldName,
                    collectionName: collectionName || undefined 
                  })}
                  disabled={!fieldName}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search Field
                </button>
              </div>

              {/* Get All Field Names */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  getAllFieldNames(collectionName?)
                </div>
                <input
                  type="text"
                  placeholder="Collection name (optional)"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => runTest("getAllFieldNames", { 
                    collectionName: collectionName || undefined 
                  })}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get All Field Names
                </button>
              </div>
            </div>

            {/* Distinct Values */}
            <div className="bg-white dark:bg-slate-800 rounded-lg !p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-yellow-600 dark:text-yellow-400">
                📊 Distinct Values
              </h2>
              
              {/* Distinct Cities */}
              <button
                onClick={() => runTest("getDistinctCities", { limit: parseInt(limit) })}
                className="function-button"
              >
                <div className="function-name">getDistinctCities(limit)</div>
                <div className="function-description">
                  Get all unique cities from tax-assessors
                </div>
              </button>

              {/* Distinct States */}
              <button
                onClick={() => runTest("getDistinctStates")}
                className="function-button"
              >
                <div className="function-name">getDistinctStates()</div>
                <div className="function-description">
                  Get all unique states from tax-assessors
                </div>
              </button>

              {/* Distinct ZIPs */}
              <button
                onClick={() => runTest("getDistinctZIPs", { limit: parseInt(limit) })}
                className="function-button"
              >
                <div className="function-name">getDistinctZIPs(limit)</div>
                <div className="function-description">
                  Get all unique ZIP codes from tax-assessors
                </div>
              </button>
            </div>

            {/* Property Search with Metadata */}
            <div className="bg-white dark:bg-slate-800 rounded-lg !p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">
                🏠 Property Search with Metadata
              </h2>
              
              {/* Search Properties with Boolean Flags */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchPropertiesWithFlags(location, flags, limit?)
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="ZIP code"
                    value={searchZip}
                    onChange={(e) => setSearchZip(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Boolean flags (comma-separated): DeckFlag,PoolFlag,FireplaceFlag"
                  value={booleanFlags}
                  onChange={(e) => setBooleanFlags(e.target.value)}
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
                  onClick={() => {
                    const location: any = {};
                    if (searchZip) location.zip = searchZip;
                    if (searchCity) location.city = searchCity;
                    if (searchState) location.state = searchState;
                    
                    const flags = booleanFlags.split(',').map(f => f.trim()).filter(f => f);
                    
                    runTest("searchPropertiesWithFlags", {
                      location,
                      flags,
                      limit: parseInt(limit)
                    });
                  }}
                  disabled={!booleanFlags || (!searchZip && !searchCity && !searchState)}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search Properties with Flags
                </button>
              </div>

              {/* Search Properties with Numeric Criteria */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchPropertiesWithNumericCriteria(location, numericCriteria, limit?)
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="ZIP code"
                    value={searchZip}
                    onChange={(e) => setSearchZip(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <textarea
                  placeholder='{"BathCount": {"min": 2, "max": 4}, "BedroomsCount": {"min": 3}, "AreaBuilding": {"min": 1500}}'
                  value={numericFields}
                  onChange={(e) => setNumericFields(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 font-mono text-sm bg-white dark:bg-slate-700"
                />
                <input
                  type="number"
                  placeholder="Limit (default: 10)"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => {
                    const location: any = {};
                    if (searchZip) location.zip = searchZip;
                    if (searchCity) location.city = searchCity;
                    if (searchState) location.state = searchState;
                    
                    try {
                      const numericCriteria = JSON.parse(numericFields);
                      runTest("searchPropertiesWithNumericCriteria", {
                        location,
                        numericCriteria,
                        limit: parseInt(limit)
                      });
                    } catch (e) {
                      alert('Invalid JSON format for numeric criteria');
                    }
                  }}
                  disabled={!numericFields || (!searchZip && !searchCity && !searchState)}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Search Properties with Numeric Criteria
                </button>
              </div>

              {/* Get Property Statistics */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  getPropertyStats(location, fields?)
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="ZIP code"
                    value={searchZip}
                    onChange={(e) => setSearchZip(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Fields to analyze (comma-separated): BathCount,BedroomsCount,AreaBuilding"
                  value={statsFields}
                  onChange={(e) => setStatsFields(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => {
                    const location: any = {};
                    if (searchZip) location.zip = searchZip;
                    if (searchCity) location.city = searchCity;
                    if (searchState) location.state = searchState;
                    
                    const fields = statsFields.split(',').map(f => f.trim()).filter(f => f);
                    
                    runTest("getPropertyStats", {
                      location,
                      fields
                    });
                  }}
                  disabled={!searchZip && !searchCity && !searchState}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Property Statistics
                </button>
              </div>

              {/* Advanced Property Search */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  searchPropertiesByMetadata(criteria)
                </div>
                <textarea
                  placeholder={`{
  "zip": "90210",
  "booleanFields": {
    "DeckFlag": true,
    "PoolFlag": true
  },
  "numericFields": {
    "BathCount": {"min": 2, "max": 4},
    "BedroomsCount": {"min": 3}
  },
  "limit": 10
}`}
                  value={numericFields}
                  onChange={(e) => setNumericFields(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded mb-2 font-mono text-sm bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => {
                    try {
                      const criteria = JSON.parse(numericFields);
                      runTest("searchPropertiesByMetadata", { criteria });
                    } catch (e) {
                      alert('Invalid JSON format for criteria');
                    }
                  }}
                  disabled={!numericFields}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Advanced Property Search
                </button>
              </div>
            </div>

            {/* General Database Functions */}
            <div className="bg-white dark:bg-slate-800 rounded-lg !p-6 shadow">
              <h2 className="text-xl font-semibold mb-4 text-slate-600 dark:text-slate-400">
                🔧 General Database Functions
              </h2>
              
              {/* List Collections */}
              <button
                onClick={() => runTest("listCollections")}
                className="function-button"
              >
                <div className="function-name">listCollections()</div>
                <div className="function-description">
                  Get all collection names in ATTOM database
                </div>
              </button>

              {/* Get Collection Info */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  getCollectionInfo(collectionName)
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
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Get Collection Info
                </button>
              </div>

              {/* Count Documents */}
              <div className="mb-4 border border-slate-300 dark:border-slate-600 rounded-md !p-3">
                <div className="font-mono text-sm mb-2">
                  countDocuments(collectionName, query?)
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
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white px-4 py-2 rounded transition btn-run"
                >
                  Count Documents
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
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.6875rem', color: 'var(--success)' }}>
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