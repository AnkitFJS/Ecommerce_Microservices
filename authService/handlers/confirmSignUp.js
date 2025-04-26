const { CognitoIdentityProviderClient, ConfirmSignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');


const client = new CognitoIdentityProviderClient({
});

const CLIENT_ID = process.env.CLIENT_ID;

// export the confirmSignUp function to handle new user registration

exports.confirmSignUp = async (event) => {
    const { email, code } = JSON.parse(event.body);

    const params = {
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code
    }

    try {
        const command = new ConfirmSignUpCommand(params);

        const response = await client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                msg: 'Confirmation Success!',
                data: response
            })
        }

    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: 'Confirmation Failed!',
                error: error.message
            })
        }

    }
}