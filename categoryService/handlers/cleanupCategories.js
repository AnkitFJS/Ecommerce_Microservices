// import required aws sdk modules
const { DynamoDBClient, ScanCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
// initailize the DynamoDB client

const dyanmodbClient = new DynamoDBClient({
    region: 'ap-south-1',
});

const snsClient = new SNSClient({
    region: 'ap-south-1'
});

// function to delete the category

exports.cleanupCategories = async () => {
    try {
        // get the table name from the environment variable
        const tableName = process.env.DYNAMO_TABLE;
        // get sns topic arn from environment
        const snsTopicArn = process.env.SNS_TOPIC_ARN;

        const onHourAgo = new Date(Date.now() - 60 * 1000).toISOString();

        // scan the table to get all the items
        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: 'createdAt < :onHourAgo AND attribute_not_exists(imageUrl)',
            ExpressionAttributeValues: {
                ':onHourAgo': { S: onHourAgo },
            },
        });

        const data = await dyanmodbClient.send(scanCommand);

        // loop through the items and delete them

        if (!data.Items || data.Items.length === 0) {
            console.log('No items to delete');
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'No items to delete' }),
            };
        }

        let deletedCount = 0;

        for (const item of data.Items) {
            const deleteCommand = new DeleteItemCommand({
                TableName: tableName,
                Key: {
                    fileName: {S: item.fileName.S},
                },
            });

            await dyanmodbClient.send(deleteCommand);

            deletedCount++;
        }

        // send an SNS notification
        const snsMessage = `${deletedCount} items deleted from ${tableName}`;

        await snsClient.send(new PublishCommand({
            TopicArn: snsTopicArn,
            Message: snsMessage,
            Subject: 'Category Cleanup Notification'
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `${deletedCount} items deleted` }),
        };

    } catch (error) {
        console.error('Error deleting items:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}