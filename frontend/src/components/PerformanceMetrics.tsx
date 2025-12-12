<<<<<<< HEAD
import React, { useEffect, useState } from "react";
=======
import Chart from "./Chart";
>>>>>>> 2841dc2 (feat: add sentry & OTEL)

const PerformanceMetrics = () => {
  return <Chart />;
};

<<<<<<< HEAD
export const PerformanceMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsState>({
    responseTime: 120,
    successRate: 98,
    failureRate: 2,
    requestsPerMin: 45,
  });

  // --- Real-time Data Simulation (Interactive/Live Feature) ---
  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        responseTime: Math.floor(Math.random() * 80) + 100, // 100ms - 179ms
        successRate: Math.floor(Math.random() * 5) + 95, // 95% - 99%
        failureRate: Math.floor(Math.random() * 3) + 1, // 1% - 3%
        requestsPerMin: Math.floor(Math.random() * 30) + 30, // 30 - 59 RPM
      }));
    }, 4000); // Faster refresh for a better "live" feel
    return () => clearInterval(interval);
  }, []);

  // --- Metric Card Definitions ---
  const metricCards = [
    {
      label: "Avg Response Time",
      value: `${metrics.responseTime}ms`,
      icon: "⚡",
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-500/20",
      textColor: "text-yellow-400",
      description: "Typical latency for API requests.",
    },
    {
      label: "Success Rate",
      value: `${metrics.successRate}%`,
      icon: "✅", // Enhanced icon
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/20",
      textColor: "text-green-400",
      description: "Percentage of requests returning 2xx status codes.",
    },
    {
      label: "Error Rate (5xx)",
      value: `${metrics.failureRate}%`,
      icon: "🚨", // Enhanced icon
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
      // Highlight the failure rate visually if it's high
      pulse: metrics.failureRate > 2,
      description: "Percentage of requests returning 5xx status codes.",
    },
    {
      label: "Requests/Minute",
      value: metrics.requestsPerMin,
      icon: "📈", // Enhanced icon
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-400",
      description: "Current load on the service endpoint.",
    },
  ];

  return (
    // Outer Container: Glassmorphism Card (backdrop-blur-lg)
    <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-700/50 hover:shadow-purple-500/20 transition-all duration-300">
      <div className="flex items-center justify-between gap-3 mb-6 border-b border-gray-700/50 pb-3">
        {/* Header Title and Icon */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl flex-shrink-0">
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Live Performance Metrics
          </h2>
        </div>

        {/* Live Indicator (Interactive Element) */}
        <div className="flex items-center text-sm text-gray-400">
          <span className="mr-2 font-mono italic">Live</span>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            // Individual Metric Card styling
            className={`bg-gray-800/50 rounded-lg p-5 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-200 shadow-lg group ${metric.pulse ? "ring-2 ring-red-500/50 animate-pulse" : ""}`}
          >
            <div className="flex justify-between items-start mb-3">
              {/* Icon Circle */}
              <div className={`inline-flex p-3 rounded-full ${metric.bgColor}`}>
                <span className="text-3xl">{metric.icon}</span>
              </div>
              {/* Value (Large) */}
              <p
                className={`text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${metric.color} transition-all duration-300 group-hover:scale-105`}
              >
                {metric.value}
              </p>
            </div>

            {/* Label and Description */}
            <p className="text-gray-200 text-lg font-semibold mb-1">
              {metric.label}
            </p>
            <p className="text-gray-500 text-xs">{metric.description}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-right">
        Data simulated for demonstration. Refresh rate: 4 seconds.
      </p>
    </div>
  );
};
=======
export default PerformanceMetrics;
>>>>>>> 2841dc2 (feat: add sentry & OTEL)
