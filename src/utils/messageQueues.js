const amqplib = require("amqplib");
const { MESSAGE_BROKER_URL, EXCHANGE_NAME } = require("../config/serverConfig");

const createChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    // await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    return channel;
  } catch (error) {
    throw error;
  }
};

const subscribeMessage = async (channel, service, binding_key) => {
  try {
    const applicationQueue = await channel.assertQueue("QUEUE_NAME", {
      durable: true,
    });

    channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

    channel.consume(applicationQueue.queue, (msg) => {
      if (msg !== null) {
        console.log("✅ Received data:", msg.content.toString());

        // If you want to call some service logic:
        service(msg.content.toString());

        channel.ack(msg);
      }
    });
  } catch (error) {
    throw error;
  }
};

// const publisherMessage = async (channel, binding_key, message) => {
//   try {
//     await channel.assertQueue("QUEUE_NAME");
//     await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
//   } catch (error) {
//     throw error;
//   }
// };

const publisherMessage = async (channel, binding_key, message) => {
  try {
    const queue = "QUEUE_NAME";
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`✅ Message sent to queue ${queue}:`, message);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createChannel,
  subscribeMessage,
  publisherMessage,
};
