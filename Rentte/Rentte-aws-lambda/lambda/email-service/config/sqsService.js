const AWS = require("aws-sdk");
const { sendEmail } = require("../helper/bulkEmailSmpt");
AWS.config.update({ region: 'ap-south-1' });
require("dotenv").config();
const sqs = new AWS.SQS();

const sendMessageToQueue = async (messageBody) => {
   const params = {
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify(messageBody),
   };
   return sqs.sendMessage(params).promise();
};

const receiveMessagesFromQueue = async () => {
   const params = {
      QueueUrl: process.env.QUEUE_URL,
      MaxNumberOfMessages: 10,
      VisibilityTimeout: 30,
      WaitTimeSeconds: 0,
   };
   return sqs.receiveMessage(params).promise();
};

const deleteMessageFromQueue = async (receiptHandle) => {
   const params = {
      QueueUrl: process.env.QUEUE_URL,
      ReceiptHandle: receiptHandle,
   };
   return sqs.deleteMessage(params).promise();
};

const processMessages = async () => {
   const data = await receiveMessagesFromQueue();
   if (!data.Messages || data.Messages.length === 0) {
      throw new Error('No messages in queue');
   }
   
   for (const message of data.Messages) {
      const { emailList, subject, body } = JSON.parse(message.Body);
      for (const email of emailList) {
         await sendEmail(email, subject, body);
      }
      await deleteMessageFromQueue(message.ReceiptHandle);
   }
   return true;
};

const chunkArray = (array, size) => {
   const chunks = [];
   for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
   }
   return chunks;
}
const createBatches = async (emailList,subject,body) => {
   const emailBatches = chunkArray(emailList, 10);
   for (let i = 0; i < emailBatches.length; i++) {
      const batch = emailBatches[i];
      const message = { 
         emailList: batch, 
         subject, 
         body, 
      }; 
      await sendMessageToQueue(message);
   }
}

module.exports = {
   sendMessageToQueue,
   receiveMessagesFromQueue,
   deleteMessageFromQueue,
   chunkArray,
   processMessages,
   createBatches,
};
