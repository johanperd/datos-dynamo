require('./tracing');
const express = require('express');
const serverless = require('serverless-http');
const logger = require('./logger');
const AWS = require('aws-sdk');
const app = express();
const fetch = require('node-fetch');

async function getData(headers) {
  logger.info('LLAMANDO AL SERVICIO CLIENTE');
  try {
    const response = await fetch("https://o5lqqv9t3f.execute-api.us-east-2.amazonaws.com/data", {
      method: method,
      headers: headers
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    logger.error('Error:', error);
  }
}


// Configura DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient();


const TABLE_NAME = 'datos';

app.get('/datos-dynamo', async (req, res) => {

  const headers = getData(req.headers);
  
    try {       
        const params = {
            TableName: TABLE_NAME
        };
        const datax = await dynamoDb.scan(params).promise();
        logger.info('Ruta /datos-dynamo accedida, retornando datos de DynamoDB', datax.Items); // Log de información
        res.json(datax.Items);
    
    
      } catch (error) {
        logger.error('Error al acceder a DynamoDB', error); // Log de error
        res.status(500).json({ error: 'No se pudieron obtener los datos de DynamoDB' + error});
    }
});

// Exporta el manejador para AWS Lambda
module.exports.handler = serverless(app);
