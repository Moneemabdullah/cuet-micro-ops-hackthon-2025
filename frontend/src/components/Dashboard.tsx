import * as Sentry from '@sentry/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { PerformanceMetrics } from './PerformanceMetrics';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchHealthStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    Sentry.captureException(error);
    throw new Error('Error fetching health status');
  }
};

const fetchDownloadJobs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/download/jobs`);
    // Ensure we handle API response structure gracefully
    return response.data.jobs || response.data; 
  } catch (error) {
    Sentry.captureException(error);
    throw new Error('Error fetching download jobs');
  }
};

// --- Custom Components for UI Enhancement ---

// Reusable Card for the Glassmorphism Look (using Tailwind's backdrop-filter)
interface CardProps {
  title: string;
  icon: React.ReactNode;
  iconBgColor: string;
  children: React.ReactNode;
  className?: string;
  hoverShadowColor?: string;
}

const DashboardCard: React.FC<CardProps> = ({ 
  title, 
  icon, 
  iconBgColor, 
  children, 
  className = '',
  hoverShadowColor = 'hover:shadow-indigo-500/20'
}) => (
  // Key change: using bg-black/30, backdrop-blur-lg, and a subtle border
  <div 
    className={`bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-700/50 ${hoverShadowColor} transition-all duration-300 ${className}`}
  >
    <div className="flex items-center gap-4 mb-5 border-b border-gray-700/50 pb-3">
      <div className={`p-3 rounded-xl ${iconBgColor}`}>
        {icon}
      </div>
      <h2 className="text-2xl font-extrabold text-white tracking-wide">{title}</h2>
    </div>
    {children}
  </div>
);


// --- Main Dashboard Component ---

const Dashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [downloadJobs, setDownloadJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // State for Job Details Modal (Interactive Feature)
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthData, downloadData] = await Promise.all([
        fetchHealthStatus(),
        fetchDownloadJobs(),
      ]);
      setHealthStatus(healthData);
      setDownloadJobs(downloadData);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load data. Please verify service connections and API endpoints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper to determine status color
  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-600/20 text-green-400 border border-green-500/50';
      case 'processing':
        // Using Tailwind's standard animate-pulse for a clean effect
        return 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/50 animate-pulse'; 
      case 'failed':
      case 'error':
        return 'bg-red-600/20 text-red-400 border border-red-500/50';
      default:
        return 'bg-gray-600/20 text-gray-400 border border-gray-500/50';
    }
  };

  return (
    // Set a dark, professional background for the entire page
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-10 font-sans">
      
      {/* --- Header Section --- */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 mb-2">
              System Observability
            </h1>
            <p className="text-gray-400 text-base md:text-lg italic">
              Monitoring Core Services and Background Jobs in Real-time.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Last Synced: {lastRefresh.toLocaleTimeString('en-US')}
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-full font-semibold shadow-xl shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Manual Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- Error Alert --- */}
      {error && (
        <div className="mb-8 p-4 bg-red-600/15 border border-red-500/40 rounded-lg shadow-xl animate-shake">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* --- Core Metrics Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Health Status Card */}
        <DashboardCard
          title="Service Health Check"
          iconBgColor="bg-green-500/20"
          hoverShadowColor="hover:shadow-green-500/20"
          icon={<svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        >
          {loading && !healthStatus ? (
            <div className="text-center py-6">
              <span className="text-gray-400 animate-pulse">Awaiting server response...</span>
            </div>
          ) : healthStatus ? (
            <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-700/50 shadow-inner max-h-60 overflow-y-auto">
              {/* Use pre tag for professional JSON presentation */}
              <pre className="text-xs text-gray-300 overflow-auto whitespace-pre-wrap">{JSON.stringify(healthStatus, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">Service health data unavailable.</p>
          )}
        </DashboardCard>

        {/* Performance Metrics Card (from external component) */}
        <DashboardCard
            title="Performance Metrics"
            iconBgColor="bg-purple-500/20"
            hoverShadowColor="hover:shadow-purple-500/20"
            icon={<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        >
            <PerformanceMetrics />
        </DashboardCard>
      </div>

      {/* --- Download Jobs Table --- */}
      <DashboardCard
        title="Background Job Queue"
        iconBgColor="bg-blue-500/20"
        icon={<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>}
        className="mb-8"
        hoverShadowColor="hover:shadow-blue-500/20"
      >
        {loading && downloadJobs.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-lg text-gray-400 animate-pulse">Fetching active download jobs...</span>
          </div>
        ) : downloadJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="text-gray-400 uppercase text-sm tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Job ID</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Files</th>
                  <th className="text-left py-3 px-4 font-medium">Created At</th>
                  <th className="text-right py-3 px-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/70">
                {downloadJobs.map((job) => (
                  <tr key={job.jobId} className="hover:bg-gray-800/60 transition-colors cursor-default">
                    <td className="py-3 px-4 font-mono text-sm text-cyan-300/80 max-w-xs truncate">{job.jobId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusClasses(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{job.totalFileIds || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {new Date(job.createdAt || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => setSelectedJob(job)} 
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors border-b border-indigo-400/50 hover:border-indigo-300/80"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg">No active jobs found in the queue.</p>
          </div>
        )}
      </DashboardCard>

      {/* --- External Monitoring Links (Interactive Hover) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <a
          href="http://localhost:16686"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:bg-orange-900/30 group border border-gray-700/50 hover:border-orange-500/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Jaeger Tracing <span className="text-xs font-normal text-gray-500">(External)</span></h3>
              <p className="text-gray-400">View distributed request traces and performance bottlenecks.</p>
            </div>
            <svg className="w-8 h-8 text-orange-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </a>

        <a
          href="https://sentry.io"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:bg-purple-900/30 group border border-gray-700/50 hover:border-purple-500/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Sentry Error Monitoring <span className="text-xs font-normal text-gray-500">(External)</span></h3>
              <p className="text-gray-400">Manage and resolve application errors and exceptions.</p>
            </div>
            <svg className="w-8 h-8 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </a>
      </div>

      {/* --- Job Details Modal (Interactive Feature) --- */}
      {selectedJob && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setSelectedJob(null)} // Close on backdrop click
        >
          <div 
            // Modal body uses Glassmorphism styling too
            className="bg-black/30 backdrop-blur-xl rounded-xl p-8 max-w-xl w-full max-h-[80vh] overflow-y-auto border border-gray-600 shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
          >
            <h3 className="text-3xl font-extrabold text-white border-b border-gray-700/70 pb-3 mb-4">
              Job Details: <span className="font-mono text-cyan-400 text-xl block sm:inline">{selectedJob.jobId}</span>
            </h3>
            <div className="mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${getStatusClasses(selectedJob.status)}`}>
                    Status: {selectedJob.status}
                </span>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 shadow-inner">
              <pre className="text-xs text-gray-300 overflow-auto whitespace-pre-wrap">{JSON.stringify(selectedJob, null, 2)}</pre>
            </div>
            <button
              onClick={() => setSelectedJob(null)}
              className="mt-6 w-full py-3 bg-red-600/70 hover:bg-red-700 rounded-lg font-semibold transition-colors text-white shadow-lg"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sentry.withProfiler(Dashboard);