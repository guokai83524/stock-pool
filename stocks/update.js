import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

function handleError(callback) {
  console.error('Validation Failed');
  callback(null, {
    statusCode: 400,
    headers: { 'Content-Type': 'text/plain' },
    body: "Couldn't update the stock",
  });
}

export function update(event, context, callback) {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  if (typeof data.name !== 'string') {
    handleError(callback);
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      symbol: event.pathParameters.symbol,
    },
    ExpressionAttributeNames: {
      '#stock_name': 'name',
    },
    ExpressionAttributeValues: {
      ':name': data.name,
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET #stock_name = :name, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };

  dynamoDb.update(params, (error, result) => {
    if (error) {
      handleError(callback);
      return;
    }

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(params.Attributes),
    };
    callback(null, response);
  });
}
