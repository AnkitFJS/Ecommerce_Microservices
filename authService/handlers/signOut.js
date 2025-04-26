const {
    CognitoIdentityProviderClient,
    GlobalSignOutCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({
});

exports.signOut = async (event) => {
    try {
        const { accessToken } = JSON.parse(event.body);

        const command = new GlobalSignOutCommand({
            AccessToken: accessToken
        });

        await client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User signed out successfully.' })
        };
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: err.message })
        };
    }
};