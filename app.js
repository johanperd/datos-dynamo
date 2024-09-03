require('./tracing');
const express = require('express');
const serverless = require('serverless-http');
const logger = require('./logger');
const AWS = require('aws-sdk');
const app = express();
const fetch = require('node-fetch');

const getData = async () => {
    try {
      const response = await fetch('https://6frj5r2n4l.execute-api.us-east-2.amazonaws.com/data');
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

  const headers = req.headers;
  
  const getData = fetch('https://6frj5r2n4l.execute-api.us-east-2.amazonaws.com/data', {
    method: 'GET',
    headers: headers
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));


     logger.info('LLAMANDO AL SERVICIO CLIENTE');
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
