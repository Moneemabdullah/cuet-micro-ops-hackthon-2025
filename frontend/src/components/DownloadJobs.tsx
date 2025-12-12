import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';

// Define the Job interface
interface Job {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  fileIds: number[];
  totalFileIds: number;
  createdAt: string;
  completedAt?: string;
  results?: Array<{
    file_id: number;
    status: 'completed' | 'failed';
    downloadUrl?: string;
  }>;
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const POLLING_INTERVAL_MS = 15000; // Refresh every 15 seconds

// Local storage key for jobs
const JOBS_STORAGE_KEY = 'download_jobs';

// Helper to determine status color (Pure Tailwind Classes)
const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-600/20 text-green-400 border border-green-500/50';
    case 'processing':
      // Use animate-pulse for visual feedback on active jobs
      return 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/50 animate-pulse';
    case 'failed':
    case 'error':
      return 'bg-red-600/20 text-red-400 border border-red-500/50';
    default:
      return 'bg-gray-600/20 text-gray-400 border border-gray-500/50';
  }
};

export const DownloadJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // For the interactive modal

  // Load jobs from localStorage
  const loadJobsFromStorage = (): Job[] => {
    try {
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save jobs to localStorage
  const saveJobsToStorage = (jobs: Job[]) => {
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    } catch (err) {
      console.error('Failed to save jobs:', err);
    }
  };

  // Create a new download job
  const createJob = async (fileIds: number[]) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/v1/download/initiate`, {
        file_ids: fileIds
      });
      
      const newJob: Job = {
        jobId: response.data.jobId,
        status: response.data.status,
        fileIds: fileIds,
        totalFileIds: response.data.totalFileIds,
        createdAt: new Date().toISOString()
      };

      const updatedJobs = [newJob, ...jobs];
      setJobs(updatedJobs);
      saveJobsToStorage(updatedJobs);
      
      return newJob;
    } catch (err) {
      console.error('Failed to create job:', err);
      throw err;
    }
  };

  // Use useCallback for the fetching logic
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load jobs from localStorage since backend doesn't have a jobs list endpoint
      const storedJobs = loadJobsFromStorage();
      
      // Sort jobs: processing first, then queued, then completed/failed by time
      const sortedJobs = storedJobs.sort((a, b) => {
        const statusOrder = (status: string) => 
          status.toLowerCase() === 'processing' ? 0 : 
          status.toLowerCase() === 'queued' ? 1 :
          status.toLowerCase() === 'failed' ? 2 : 
          3;
        
        const statusDiff = statusOrder(a.status) - statusOrder(b.status);
        if (statusDiff !== 0) return statusDiff;

        // Fallback to sorting by creation date if status is the same
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setJobs(sortedJobs);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load jobs from storage.');
      console.error('Error loading download jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // Initial fetch

    // Auto-refresh/Polling setup
    const interval = setInterval(fetchData, POLLING_INTERVAL_MS);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchData]);


  // --- Render Loading State ---
  if (loading && jobs.length === 0) {
    return (
      <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-700/50">
        <h2 className="text-2xl font-extrabold text-white mb-4">Background Job Queue</h2>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-6 w-6 text-blue-400 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <div className="text-gray-400">Loading jobs...</div>
        </div>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    // Card with Glassmorphism and interactive shadow
    <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-700/50 hover:shadow-blue-500/20 transition-all duration-300">
      
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-gray-700/50 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Download Jobs ({jobs.length})</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Job Button */}
          <button
            onClick={async () => {
              try {
                // Generate 5-10 random file IDs for demo
                const count = Math.floor(Math.random() * 6) + 5;
                const fileIds = Array.from({ length: count }, () => 
                  Math.floor(Math.random() * 90000000) + 10000
                );
                await createJob(fileIds);
              } catch (err) {
                setError('Failed to create job');
              }
            }}
            className="px-4 py-2 bg-emerald-600/50 hover:bg-emerald-700/70 text-white rounded-lg font-medium transition-all duration-200 text-sm flex items-center gap-2 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Job
          </button>
          
          {/* Manual Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-700/70 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 shadow-md"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {loading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-600/15 border border-red-500/40 rounded-lg text-red-300 font-medium text-sm">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500 mb-4">
        Last updated: {lastRefresh.toLocaleTimeString()} | Auto-refresh: {POLLING_INTERVAL_MS / 1000}s
      </p>

      {/* Job List Display */}
      {jobs.length > 0 ? (
        <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
          {jobs.map(job => (
            <div 
              key={job.jobId} 
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-indigo-500/50 hover:bg-gray-700/50 transition-all duration-200 shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusClasses(job.status)}`}>
                      {job.status}
                    </span>
                    <span className="font-mono text-sm text-cyan-300 truncate" title={job.jobId}>
                        {job.jobId.substring(0, 8)}...
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Files: <span className="font-medium text-white">{job.totalFileIds}</span>
                    <span className="ml-4 text-gray-500 italic">
                      Created: {new Date(job.createdAt).toLocaleTimeString()}
                    </span>
                  </p>
                </div>
                
                {/* Details Button */}
                <button 
                  onClick={() => setSelectedJob(job)} 
                  className="px-4 py-2 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-400 rounded-lg transition-colors text-sm font-semibold flex-shrink-0 border border-indigo-400/50"
                >
                  Inspect Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 1 006.586 13H4" />
          </svg>
          <p>No active or recent download jobs found.</p>
        </div>
      )}
      
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
              Job Inspection
            </h3>
            <div className="mb-4">
                <span className="font-mono text-cyan-400 text-sm block mb-2">ID: {selectedJob.jobId}</span>
                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${getStatusClasses(selectedJob.status)}`}>
                    Status: {selectedJob.status}
                </span>
            </div>
            <h4 className="text-lg font-semibold text-gray-200 mt-6 mb-2">Raw Job Data:</h4>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 shadow-inner">
              {/* Display full object for professional inspection */}
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