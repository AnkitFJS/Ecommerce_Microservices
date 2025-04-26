// import aws sdk modules for dynamodb
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamodbClient = new DynamoDBClient({
    region: 'ap-south-1',
});

const tableName = process.env.DYNAMO_TABLE;

exports.updateCategoryImage = async (event) => {
    try {
        
        // extract first record

        const record = event.Records[0];
        const bucketName = record.s3.bucket.name;
        const fileName = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

        // prepare the command to update item in dynamodb

        const command = new UpdateItemCommand({
            TableName: tableName,
            Key: {
                fileName: { S: fileName },
            },
            UpdateExpression: 'SET imageUrl = :imageUrl', // update only imageUrl
            ExpressionAttributeValues: {
                ':imageUrl': { S: imageUrl },
            },
        });

        // update item in dynamodb

        await dynamodbClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Category image updated successfully',
                imageUrl,
            }),
        };

    } catch (error) {
        console.error('Error updating category image:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
            }),
        };
        
    }
}