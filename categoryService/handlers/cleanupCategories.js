// import required aws sdk modules
import { DynamoDBClient, ScanCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

// initailize the DynamoDB client

const dyanmodbClient = new DynamoDBClient({
    region: 'ap-south-1',
});

// function to delete the category

exports.cleanupCategories = async () => {
    try {
        // get the table name from the environment variable
        const tableName = process.env.DYNAMO_TABLE;

        const onHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

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

        const deletedCount = 0;

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