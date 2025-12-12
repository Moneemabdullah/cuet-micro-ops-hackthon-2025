import { useState } from "react";
import DownloadJobs from "./DownloadJobs";
import ErrorBoundary from "./ErrorBoundary";
import HealthStatus from "./HealthStatus";
import PerformanceMetrics from "./PerformanceMetrics";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Activity, BarChart3, Bug } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

const OTEL_URL =
  "http://localhost:16686/traces?service=delineate-hackathon-challenge";
const SENTRY_URL =
  "https://sentry.io/organizations/<org>/projects/<project>/events/";

const Dashboard = () => {
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [loadingSentry, setLoadingSentry] = useState(false);

  const handleTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      await fetch(`${BASE_URL}/v1/download/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: 10001 }),
      });
      window.open(OTEL_URL, "_blank");
    } finally {
      setLoadingTelemetry(false);
    }
  };

  const handleSentry = async () => {
    setLoadingSentry(true);
    try {
      await fetch(`${BASE_URL}/v1/download/check?sentry_test=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: 10001 }),
      });
      window.open(SENTRY_URL, "_blank");
    } finally {
      setLoadingSentry(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* HEADER */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Delineate Observability Dashboard
          </h1>
          <p className="text-slate-300">
            Real-time insights into system health, performance & events.
          </p>
        </header>

        {/* ACTION BUTTONS */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Monitoring Actions
            </CardTitle>
            <p className="text-slate-300 text-sm">
              Run synthetic events & open observability dashboards instantly.
            </p>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* OpenTelemetry Action */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleTelemetry}
                    disabled={loadingTelemetry}
                    className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    {loadingTelemetry ? (
                      "Processing…"
                    ) : (
                      <>
                        <Activity className="w-5 h-5 mr-2" />
                        Test Trace & Open OpenTelemetry
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Trigger a trace & open Jaeger dashboard
                </TooltipContent>
              </Tooltip>

              {/* Sentry Error Action */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSentry}
                    disabled={loadingSentry}
                    className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    {loadingSentry ? (
                      "Processing…"
                    ) : (
                      <>
                        <Bug className="w-5 h-5 mr-2" />
                        Test Error & Open Sentry
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Trigger an error & open Sentry dashboard
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-10 bg-white/20" />

        {/* GRID SECTION */}
        <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* HEALTH STATUS */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl rounded-2xl hover:bg-white/20 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="w-5 h-5 text-green-400" />
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HealthStatus baseUrl={BASE_URL} />
              </CardContent>
            </Card>

            {/* PERFORMANCE METRICS */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl rounded-2xl hover:bg-white/20 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceMetrics />
              </CardContent>
            </Card>

            {/* DOWNLOAD JOBS */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl rounded-2xl hover:bg-white/20 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  ⬇ Recent Download Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DownloadJobs baseUrl={BASE_URL} />
              </CardContent>
            </Card>
          </div>
        </ErrorBoundary>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
