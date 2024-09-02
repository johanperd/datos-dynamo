const { LoggerProvider, SimpleLogProcessor } = require('@opentelemetry/sdk-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { LogLevel, LoggerProvider, SimpleLogProcessor } = require('@opentelemetry/sdk-logs');
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
    level: LogLevel.INFO,
    resource: {
      serviceName: 'datos-dynamo'
    }
  });
  
  loggerProvider.addLogProcessor(new SimpleLogProcessor(logExporter));
  loggerProvider.register();
  
  module.exports = loggerProvider.getLogger('default');

const logger = createLogger({
    level: 'info',
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
