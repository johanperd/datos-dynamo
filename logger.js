const { LoggerProvider, SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const headers = {
    'Authorization': 'Basic OTg2MTA2OmdsY19leUp2SWpvaU1URTNOVE0yTmlJc0ltNGlPaUpoZDNNdFlYZHpMV3hoYldKa1lTSXNJbXNpT2lJMVJFUktORFk1VDA4eGVXaHdjVTh6VlRJM1NEWlBSRElpTENKdElqcDdJbklpT2lKMWN5SjlmUT09'
};

const logExporter = new OTLPLogExporter({
    url: 'https://otlp-gateway-prod-us-east-0.grafana.net/otlp/v1/logs',
    headers: headers
});

const loggerProvider = new LoggerProvider({
    level: "TRACE",
    resource: {
        serviceName: 'datos-dynamo'
    }
});

loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));
loggerProvider.register();

module.exports = loggerProvider.getLogger('default');

const logger = createLogger({
    level: 'TRACE',
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log' })
    ]
});

module.exports = logger;
