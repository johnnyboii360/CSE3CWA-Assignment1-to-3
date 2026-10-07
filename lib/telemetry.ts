import { metrics, trace } from '@opentelemetry/api';

const meter = metrics.getMeter('speech-pathology-builder');

export const generationCounter = meter.createCounter('builder_generations_total', {
  description: 'Number of Wordle and Word Search generation attempts',
});

export const pageViewCounter = meter.createCounter('builder_page_views_total', {
  description: 'Number of page views recorded by the app',
});

export const timeOnPageHistogram = meter.createHistogram('builder_time_on_page_ms', {
  description: 'Time spent on a page in milliseconds',
  unit: 'ms',
});

export const tracer = trace.getTracer('speech-pathology-builder');