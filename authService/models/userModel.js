const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
    region: 'ap-south-1', // replace with your AWS region
});

const TABLE_NAME = 'Users'; // replace with your DynamoDB table name

// user model class to represent a user and handle database operations

class UserModel { 
    constructor(email, fullName) {
        this.userId = uuidv4(); // Generate a unique user ID
        this.email = email;
        this.fullName = fullName;
        this.state = ''; // Default state
        this.city = ''; // Default city
        this.locality = ''; // Default locality
        this.createdAt = new Date().toISOString(); // Set the creation date
    }

    // Method to save user data to DynamoDB

    async save() {
        const params = {
            TableName: TABLE_NAME, // replace with your DynamoDB table name
            Item: {
                userId: { S: this.userId },
                email: { S: this.email },
                fullName: { S: this.fullName },
                state: { S: this.state },
                city: { S: this.city },
                locality: { S: this.locality },
                createdAt: { S: this.createdAt },
            },
        };

        try {
            const command = new PutItemCommand(params);
            await dynamoClient.send(command);
            console.log('User saved successfully:', this);
        } catch (error) {
            console.error('Error saving user:', error);
        }
    }
}

module.exports = UserModel;