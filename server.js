require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3002;

const s3 = new S3Client({
    region: "us-east-1"
});
const ddb = new DynamoDBClient({
    region: "us-east-1"
});

const S3_BUCKET = 'drawing-gallery-bucket';
const TABLE_NAME = 'Drawings';

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

app.post('/save-drawing', async (req, res) => {
    const { image } = req.body;
    const imageId = uuidv4();
    const base64Data = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = image.split(';')[0].split('/')[1];

    const putObjectParams = {
        Bucket: S3_BUCKET,
        Key: `${imageId}.${type}`,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
    };

    try {
        await s3.send(new PutObjectCommand(putObjectParams));
        const dynamoParams = {
            TableName: TABLE_NAME,
            Item: {
                ImageID: { S: imageId },
                url: { S: `https://${S3_BUCKET}.s3.amazonaws.com/${imageId}.${type}` }
            }
        };
        await ddb.send(new PutItemCommand(dynamoParams));
        res.json({ success: true, imageUrl: dynamoParams.Item.url.S });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/gallery', async (req, res) => {
    const params = {
        TableName: TABLE_NAME
    };

    try {
        const data = await ddb.send(new ScanCommand(params));
        const images = data.Items.map(item => item.url.S);
        res.json({ success: true, images });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
