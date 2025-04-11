const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();
const { AWS_BUCKET_REGION,ID_S3,KEY_S3,AWS_BUCKET_NAME } = process.env;
const s3 = new S3Client({
   region: AWS_BUCKET_REGION,
   credentials: {
      accessKeyId: ID_S3,
      secretAccessKey: KEY_S3,
   },
});
const upload = multer({
   storage: multerS3({
      s3,
      bucket: AWS_BUCKET_NAME,
      ContentType(req, file, cb) {
         cb(null, file.mimetype); // Set the content type dynamically based on the file's mimetype
      },
      key(req, file, cb) {
         const newFileName = `${Date.now()  }-${  file.originalname}`;
         const fullPath = `rentte/${  newFileName}`;
         cb(null, fullPath);
      },
   }),
});

module.exports = upload;
