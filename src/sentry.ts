import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_NODE, // backend DSN
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profileSessionSampleRate: 1.0,
    profileLifecycle: "trace",
    sendDefaultPii: true,
    enableLogs: true,
  });
  return Sentry;
};
