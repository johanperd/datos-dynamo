const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { PeriodicExportingMetricReader,ConsoleMetricExporter, } = require('@opentelemetry/sdk-metrics');
const { LoggerProvider, SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');


const logger = require('./logger'); 

const headers = {
  'Authorization': 'Basic OTg2MTA2OmdsY19leUp2SWpvaU1URTNOVE0yTmlJc0ltNGlPaUpoZDNNdFlYZHpMV3hoYldKa1lTSXNJbXNpT2lJMVJFUktORFk1VDA4eGVXaHdjVTh6VlRJM1NEWlBSRElpTENKdElqcDdJbklpT2lKMWN5SjlmUT09'
};

// Configura el nivel de diagnóstico (opcional)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.TRACE);

// Configura el exportador de trazas
const traceExporter = new OTLPTraceExporter({
    url: 'https://otlp-gateway-prod-us-east-0.grafana.net/v1/traces', // Cambia la URL según tu backend de OTLP
    headers: headers
});

// Configura el exportador de métricas
const metricExporter = new OTLPMetricExporter({
    url: 'https://otlp-gateway-prod-us-east-0.grafana.net/v1/metrics', // Cambia la URL según tu backend de OTLP
    headers: headers
});


// Configura el exportador de logs
const logExporter = new OTLPLogExporter({
    url: 'https://otlp-gateway-prod-us-east-0.grafana.net/v1/logs', // Cambia la URL según tu backend de OTLP
    headers: headers
});

// Configura el proveedor de métricas
const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10000
});

// Configura el proveedor de logs
const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));

// Configura el SDK de Node con los exportadores y las instrumentaciones automáticas
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'datos-dynamo'
  }),
    traceExporter,
    metricReader,
    loggerProvider,
    instrumentations: [getNodeAutoInstrumentations()],
});

try {
  sdk.start();
  logger.info('Tracing initialized');
} catch (error) {
  logger.info('Error initializing tracing', error);
}

// Captura la finalización de la aplicación para limpiar el SDK
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('OpenTelemetry SDK cerrado'))
        .catch((error) => console.error('Error cerrando OpenTelemetry SDK', error))
        .finally(() => process.exit(0));
});
