import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";

const provider = new WebTracerProvider();

const exporter = new OTLPTraceExporter({
  url: process.env.REACT_APP_OTEL_EXPORTER_OTLP_ENDPOINT,
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [new XMLHttpRequestInstrumentation()],
});

console.log("OpenTelemetry Initialized");
