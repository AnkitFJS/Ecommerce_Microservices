// import necessary aws sdk modules for dynamodb
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

// initalize dynamodb client

const dynamodbClient = new DynamoDBClient({
    region: 'ap-south-1',
});

// lambda function to confirm upload and store in dynamodb

exports.confirmUpload = async (event) => {
    try {
        
        const tableName = process.env.DYNAMO_TABLE;
        
        const bucketName = process.env.BUCKET_NAME;

        // extract file details from s3 notification

        const record = event.Records[0]; // get first record
        
        // extract the filename form the s3 notification

        const fileName = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

        //construct the public url

        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

        // prepare the file meta data to store in dynamodb

        const fileMetaData = {
            fileName,
            imageUrl,
            bucketName,
            createdAt: new Date().toISOString(),
        };

        // prepare the command to put item in dynamodb

        const command = new PutItemCommand({
            TableName: tableName,
            Item: {
                fileName: { S: fileMetaData.fileName },
                imageUrl: { S: fileMetaData.imageUrl },
                bucketName: { S: fileMetaData.bucketName },
                createdAt: { S: fileMetaData.createdAt },
            },
        });

        // put item in dynamodb

        await dynamodbClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'File uploaded successfully',
                fileMetaData,
            }),
        };

    } catch (error) {
        console.error('Error confirming upload:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error confirming upload' }),
        };
        
    }
}