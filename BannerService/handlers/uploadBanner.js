// required s3 module to get presigned URL
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
    region: 'ap-south-1',
});

const bucketName = process.env.BUCKET_NAME;

exports.getUploadUrl = async (event) => {
    const { fileName, fileType } = JSON.parse(event.body);

    if (!fileName || !fileType) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'fileName and fileType are required',
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


