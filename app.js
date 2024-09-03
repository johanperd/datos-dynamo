require('./tracing');
const express = require('express');
const serverless = require('serverless-http');
const logger = require('./logger');
const AWS = require('aws-sdk');
const app = express();
const fetch = require('node-fetch');

const getData = async () => {
    try {
      const response = await fetch('https://vwb3xxy643.execute-api.us-east-2.amazonaws.com/data');
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };



// Configura DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'datos';

app.get('/datos-dynamo', async (req, res) => {
    
    try {
        const dataService = getData();
        const params = {
            TableName: TABLE_NAME
        };
        const data = await dynamoDb.scan(params).promise();
        logger.info('Ruta /datos-dynamo accedida, retornando datos de DynamoDB', data.Items); // Log de información
        res.json(
            (data.Items), dataService);
    } catch (error) {
        logger.error('Error al acceder a DynamoDB', error); // Log de error
        res.status(500).json({ error: 'No se pudieron obtener los datos de DynamoDB' + error});
    }
});

// Exporta el manejador para AWS Lambda
module.exports.handler = serverless(app);
