require('./tracing');
const express = require('express');
const serverless = require('serverless-http');
const logger = require('./logger');
const AWS = require('aws-sdk');
const app = express();

// Configura DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'datos';

app.get('/datos-dynamo', async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME
        };

        const data = await dynamoDb.scan(params).promise();
        logger.info('Ruta /datos-dynamo accedida, retornando datos de DynamoDB', data.Items); // Log de información
        res.json(data.Items);
    } catch (error) {
        logger.error('Error al acceder a DynamoDB', error); // Log de error
        res.status(500).json({ error: 'No se pudieron obtener los datos de DynamoDB' + error});
    }
});

// Exporta el manejador para AWS Lambda
module.exports.handler = serverless(app);
