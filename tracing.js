const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const logger = require('./logger'); 


const headers = {
  'Authorization': 'Basic OTg2MTA2OmdsY19leUp2SWpvaU1URTNOVE0yTmlJc0ltNGlPaUpoZDNNdFlYZHpMV3hoYldKa1lTSXNJbXNpT2lJMVJFUktORFk1VDA4eGVXaHdjVTh6VlRJM1NEWlBSRElpTENKdElqcDdJbklpT2lKMWN5SjlmUT09'
};

const traceExporter = new OTLPTraceExporter({
  url: 'https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1/traces',
  headers: headers
});

const metricExporter = new OTLPMetricExporter({
  url: 'https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1/metrics',
  headers: headers
});

const logExporter = new OTLPLogExporter({
  url: 'https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1/logs',
  headers: headers
});

const sdk = new NodeSDK({
  traceExporter: traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10000 // Exportar métricas cada 10 segundos
  }),
  logExporter: logExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

try {
    sdk.start();
    logger.info('Tracing initialized');
  } catch (error) {
    logger.info('Error initializing tracing', error);
  }
