import { registerOTel } from '@vercel/otel';

export async function register() {
  const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');
  const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http');

  registerOTel({
    serviceName: 'next-app',
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 10000,
      }),
    ],
  });
}