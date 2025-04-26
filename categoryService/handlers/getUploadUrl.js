// required s3 module to get presigned URL
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const s3Client = new S3Client({
    region: 'ap-south-1',
});

const dynamodbClient = new DynamoDBClient({
    region: 'ap-south-1',
});

const bucketName = process.env.BUCKET_NAME;

exports.getUploadUrl = async (event) => {
    const { fileName, fileType, categoryName } = JSON.parse(event.body);

    if (!fileName || !fileType || !categoryName) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'fileName, fileType and categoryName are required',
            }),
        };
    }

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: fileType,
    });
    
    try {
        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
        });
    
        // Save the file name and category name to DynamoDB ( only fileName and categoryName )

        const params = {
            TableName: process.env.DYNAMO_TABLE,
            Item: {
                fileName: { S: fileName },
                categoryName: { S: categoryName },
                createdAt: { S: new Date().toISOString() },
            },
        };
        
        await dynamodbClient.send(new PutItemCommand(params));

    
        return {
            statusCode: 200,
            body: JSON.stringify({
                signedUrl,
            }),
        };
    
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error generating signed URL',
            }),
        };
    }
}


