const { CognitoIdentityProviderClient, SignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');

const userModel = require('../models/userModel');

const client = new CognitoIdentityProviderClient({
});

// Define Cognito app client APP ID for user pool authentication
const CLIENT_ID = process.env.CLIENT_ID;

// export the signup function to handle new user registration
exports.signUp = async (event) => {
    
    // parse the incoming request body to extract user data
    const { fullName, password, email } = JSON.parse(event.body);

    const params = {
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'name', Value: fullName }
        ]
    }

    try {
        // Create the user in cognito user pool
        const command = new SignUpCommand(params);

        // execute the command
        const response = await client.send(command);

        // save user data to DynamoDB
        const user = new userModel(email, fullName);
        await user.save();

        // return success response to the client
        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: 'Signup Success! Please verify your email',
                data: response
            })
        }
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: 'Signup Failed!',
                error: error.message
            })
        }
    }

} 