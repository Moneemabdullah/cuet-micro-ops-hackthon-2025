import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

// Define the Job interface
interface Job {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  fileIds: number[];
  totalFileIds: number;
  createdAt: string;
  completedAt?: string;
  results?: Array<{
    file_id: number;
    status: "completed" | "failed";
    downloadUrl?: string;
  }>;
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const POLLING_INTERVAL_MS = 15000; // Refresh every 15 seconds

// Local storage key for jobs
const JOBS_STORAGE_KEY = "download_jobs";

// Helper to determine status color (Pure Tailwind Classes)
const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-600/20 text-green-400 border border-green-500/50";
    case "processing":
      // Use animate-pulse for visual feedback on active jobs
      return "bg-yellow-600/20 text-yellow-400 border border-yellow-500/50 animate-pulse";
    case "failed":
    case "error":
      return "bg-red-600/20 text-red-400 border border-red-500/50";
    default:
      return "bg-gray-600/20 text-gray-400 border border-gray-500/50";
  }
};

export const DownloadJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load jobs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setJobs(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load jobs from storage:", err);
    }
  }, []);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (err) {
      console.error("Failed to save jobs to storage:", err);
    }
  }, [jobs]);

  const createJob = async () => {
    setLoading(true);
    setError(null);
    try {
      // Generate 5-10 random file IDs between 10000 and 100000000
      const count = Math.floor(Math.random() * 6) + 5;
      const file_ids = Array.from(
        { length: count },
        () => Math.floor(Math.random() * 99990001) + 10000,
      );

      const res = await fetch(`${baseUrl}/v1/download/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_ids }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const newJob: Job = {
        ...data,
        createdAt: new Date().toISOString(),
      };
      setJobs((prev) => [newJob, ...prev]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create job";
      setError(message);
      console.error("Error creating job:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearJobs = () => {
    setJobs([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="p-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          ⬇️ Download Jobs
          {jobs.length > 0 && (
            <span className="text-sm font-normal text-slate-500">
              ({jobs.length})
            </span>
          )}
        </h2>

        <div className="flex gap-2">
          {jobs.length > 0 && (
            <button
              onClick={clearJobs}
              className="
                bg-red-500 hover:bg-red-600 
                transition-all duration-300 
                text-white px-4 py-2 rounded-xl 
                shadow-md hover:shadow-lg
                text-sm
              "
            >
              Clear All
            </button>
          )}
          <button
            onClick={createJob}
            disabled={loading}
            className="
              bg-teal-600 hover:bg-teal-700 
              transition-all duration-300 
              text-white px-4 py-2 rounded-xl 
              shadow-md hover:shadow-lg
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              "New Job"
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-2">No jobs yet.</p>
          <p className="text-sm text-slate-400">
            Click "New Job" to create a download job
          </p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {jobs.map((job) => (
            <li
              key={job.jobId}
              className="
                p-4 bg-slate-50 rounded-xl border border-slate-200 
                shadow-sm hover:shadow-md transition-shadow
              "
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left Side - Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-700 text-sm font-mono truncate">
                      {job.jobId.substring(0, 8)}...
                    </span>
                    {/* Status badge */}
                    <span
                      className={`
                        px-2 py-1 rounded-full text-white text-xs font-medium
                        ${
                          job.status === "queued"
                            ? "bg-amber-500"
                            : job.status === "processing"
                              ? "bg-blue-600 animate-pulse"
                              : job.status === "completed"
                                ? "bg-green-600"
                                : "bg-red-600"
                        }
                      `}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>📦 {job.totalFileIds} files</span>
                    {job.createdAt && (
                      <span>
                        🕐 {new Date(job.createdAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DownloadJobs;
