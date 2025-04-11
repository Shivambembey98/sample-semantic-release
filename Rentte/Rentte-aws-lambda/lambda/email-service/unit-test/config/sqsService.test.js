const { sendMessageToQueue, receiveMessagesFromQueue, deleteMessageFromQueue, chunkArray, processMessages, createBatches } = require("../../config/sqsService");
const AWS = require("aws-sdk");
const { sendEmail } = require("../../helper/bulkEmailSmpt");

jest.mock("aws-sdk", () => {
  const mockSendMessage = jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue("message sent") });
  const mockReceiveMessage = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Messages: [
        {
          Body: JSON.stringify({ emailList: ["user1@example.com"], subject: "Test", body: "Body" }),
          ReceiptHandle: "fake-handle",
        },
      ],
    }),
  });
  const mockDeleteMessage = jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue("deleted") });

  return {
    SQS: jest.fn(() => ({
      sendMessage: mockSendMessage,
      receiveMessage: mockReceiveMessage,
      deleteMessage: mockDeleteMessage,
    })),
    config: {
      update: jest.fn(),
    },
  };
});

jest.mock("../../helper/bulkEmailSmpt", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

describe("SQS Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.QUEUE_URL = "https://sqs.fake-region.amazonaws.com/123456789012/fake-queue";
  });

  test("sendMessageToQueue should send a message to SQS", async () => {
    const result = await sendMessageToQueue({ test: "message" });
    expect(result).toBe("message sent");
  });

  test("receiveMessagesFromQueue should receive messages from SQS", async () => {
    const result = await receiveMessagesFromQueue();
    expect(result.Messages.length).toBeGreaterThan(0);
  });

  test("deleteMessageFromQueue should delete a message from SQS", async () => {
    const result = await deleteMessageFromQueue("fake-handle");
    expect(result).toBe("deleted");
  });

  test("chunkArray should split array into chunks", () => {
    const input = [1, 2, 3, 4, 5];
    const result = chunkArray(input, 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  test("processMessages should send emails and delete messages", async () => {
    const result = await processMessages();
    expect(sendEmail).toHaveBeenCalledWith("user1@example.com", "Test", "Body");
    expect(result).toBe(true);
  });

  test("processMessages should throw an error if no messages", async () => {
    const mockSQS = new AWS.SQS();
    mockSQS.receiveMessage.mockReturnValueOnce({
      promise: () => Promise.resolve({ Messages: [] }), // returns empty array
    });
  
    await expect(processMessages()).rejects.toThrow("No messages in queue");
  });  

  test("createBatches should call sendMessageToQueue for each batch", async () => {
    const emailList = Array.from({ length: 25 }, (_, i) => `user${i}@example.com`);
    await createBatches(emailList, "Hello", "Test body");
    // should batch into 3: 10, 10, 5
    expect(AWS.SQS().sendMessage).toHaveBeenCalledTimes(3);
  });
});
