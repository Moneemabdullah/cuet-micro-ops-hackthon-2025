import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

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
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
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
      if (
        !data ||
        data.status?.toLowerCase() === "unhealthy" ||
        data.status?.toLowerCase() === "error"
      ) {
        throw new Error(`Service reported status: ${data.status}`);
      }

      setHealthData(data);
    } catch (err) {
      // Handle API request error or unhealthy status reported by the service
      const errorMessage =
        err instanceof Error ? err.message : "Unknown connection error";
      setHealthData(null); // Clear previous data on error
      setError(`Health Check Failed: ${errorMessage}.`);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch(`${baseUrl}/health`);
        const data = await res.json();
        setHealth(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHealth();
  }, [baseUrl]);

  const statusColor = health?.status === "healthy" ? "green" : "red";

  return (
    <div className="p-6 bg-white rounded shadow flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Health Status</h2>
      {health ? (
        <>
          <div className={`w-4 h-4 rounded-full mb-2 bg-${statusColor}-500`} />
          <p className="text-gray-700">Service: {health.status}</p>
          <p className="text-gray-500">Storage: {health.checks.storage}</p>
        </>
      ) : (
        <p className="text-gray-500">Loading...</p>
      )}
    </div>
  );
};

export default HealthStatus;
