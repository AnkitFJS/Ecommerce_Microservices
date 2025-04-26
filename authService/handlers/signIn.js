const { CognitoIdentityProviderClient,
    InitiateAuthCommand,
    AuthFlowType, } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({
});

const CLIENT_ID = process.env.CLIENT_ID;

exports.signIn = async (event) => {
    const { username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Username and password are required' }),
        };
    }

    try {
        const command = new InitiateAuthCommand({
            AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        });

        const response = await client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Sign-in successful',
                tokens: response.AuthenticationResult,
            }),
        };
    } catch (error) {
        console.error('Error during sign-in:', error);
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'Sign-in failed',
                error: error.message || 'Unknown error',
            }),
        };
    }
};