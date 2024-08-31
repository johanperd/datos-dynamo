require('./tracing'); 
const express = require('express');
const serverless = require('serverless-http');
const logger = require('./logger'); 
const app = express();

const carros = [
    { id: 1, nombre: 'cerato' },
    { id: 2, nombre: 'corolla' },
    { id: 3, nombre: 'rio' },
    { id: 4, nombre: 'captiva' },
    { id: 5, nombre: 'civic' },
];


app.get('/datos-dynamo', (req, res) => {
    logger.info('Ruta /datos-dynamo accedida, retornado datos-dynamo {'+JSON.stringify(carros)+'}'); // Log de información
    res.send(JSON.stringify(carros));
});

// Exporta el manejador para AWS Lambda
module.exports.handler = serverless(app);
