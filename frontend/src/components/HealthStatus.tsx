import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';

// Define the expected structure for a detailed health check response
interface HealthResponse {
  status: string;
  uptime?: number;
  database?: {
    status: string;
    responseTime?: number;
  };
  services?: {
    [key: string]: {
      status: string;
    };
  };
  // Add a generic index signature for any other properties
  [key: string]: any; 
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const POLLING_INTERVAL_MS = 30000; // Auto-refresh every 30 seconds

export const HealthStatus: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Use useCallback for the fetching logic to enable polling and manual refresh
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the correct health endpoint from backend
      const response = await axios.get(`${API_BASE_URL}/health`);
      const data: HealthResponse = response.data;
      
      // Determine overall health based on the top-level status property
      if (!data || data.status?.toLowerCase() === 'unhealthy' || data.status?.toLowerCase() === 'error') {
        throw new Error(`Service reported status: ${data.status}`);
      }

      setHealthData(data);
    } catch (err) {
      // Handle API request error or unhealthy status reported by the service
      const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
      setHealthData(null); // Clear previous data on error
      setError(`Health Check Failed: ${errorMessage}.`);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData(); // Initial fetch

    // Auto-refresh/Polling setup
    const interval = setInterval(fetchData, POLLING_INTERVAL_MS);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchData]);

  // Derive overall health status from state
  const isHealthy = healthData?.status?.toLowerCase() === 'healthy' && !error;
  const statusText = healthData?.status || (loading ? 'Loading...' : (error ? 'Critical Error' : 'Unknown'));

  // Define icon and color based on health status
  const iconClasses = isHealthy ? 'text-green-400' : 'text-red-400';
  const bgClasses = isHealthy ? 'bg-green-500/20' : 'bg-red-500/20';
  const shadowClasses = isHealthy ? 'hover:shadow-green-500/20' : 'hover:shadow-red-500/20';

  return (
    // Card with Glassmorphism and interactive shadow
    <div 
      className={`bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-700/50 ${shadowClasses} transition-all duration-300 min-h-[300px] flex flex-col`}
    >
      
      {/* Header and Refresh Button */}
      <div className="flex items-start justify-between gap-4 mb-4 border-b border-gray-700/50 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${bgClasses} flex-shrink-0`}>
            {/* SVG Icons based on status */}
            <svg className={`w-6 h-6 ${iconClasses}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isHealthy ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Service Health</h2>
        </div>

        {/* Manual Refresh Button (Interactive) */}
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-700/70 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 shadow-md flex-shrink-0"
          title="Manually fetch health status"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">...</svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {loading ? 'Polling...' : 'Refresh'}
        </button>
      </div>

      {/* Main Status Indicator */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-lg shadow-inner mb-4 ${
        isHealthy 
          ? 'bg-green-500/10 border border-green-500/40' 
          : 'bg-red-500/10 border border-red-500/40 animate-pulse'
      }`}>
        <span className="text-lg font-bold text-white tracking-wider">
          STATUS:
        </span>
        <span className={`text-xl font-extrabold uppercase ${iconClasses}`}>
          {statusText}
        </span>
      </div>

      {/* Details/Error Area */}
      {error && (
        <div className="p-3 bg-red-600/15 border border-red-500/40 rounded-lg text-red-300 font-medium text-sm mb-4">
          <span className='font-bold'>Error:</span> {error}
        </div>
      )}

      {healthData && (
        <div className="flex-1 bg-gray-900/40 rounded-lg p-4 border border-gray-700/50 shadow-inner overflow-y-auto">
          <h4 className='text-sm font-semibold text-gray-400 mb-2'>Detailed Response (JSON):</h4>
          {/* Use pre tag for professional JSON presentation */}
          <pre className="text-xs text-gray-300 overflow-auto whitespace-pre-wrap">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
      )}

      {/* Footer Info */}
      <p className="text-xs text-gray-500 mt-4 text-right">
        Last Sync: {lastRefresh.toLocaleTimeString()} | Next in: {(POLLING_INTERVAL_MS / 1000)}s
      </p>

    </div>
  );
};