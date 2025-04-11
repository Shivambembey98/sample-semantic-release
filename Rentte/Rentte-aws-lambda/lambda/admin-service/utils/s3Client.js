const { S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ 
   region: process.env.AWS_REGION,
   credentials: {
      accessKeyId: process.env.ID_S3,
      secretAccessKey: process.env.KEY_S3,
   },
});

module.exports = { s3Client };
