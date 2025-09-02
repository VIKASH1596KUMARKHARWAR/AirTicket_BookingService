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

// const subscribeMessage = async (channel, service, binding_key) => {
//   try {
//     const queueName = "REMINDER_QUEUE";

//     // Ensure the exchange exists
//     await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

//     // Ensure the queue exists
//     const applicationQueue = await channel.assertQueue(queueName, {
//       durable: true,
//     });

//     // Bind the queue to the exchange with the binding key
//     await channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

//     // Consume messages
//     channel.consume(applicationQueue.queue, (msg) => {
//       if (msg !== null) {
//         // Raw message (string)
//         const payload = JSON.parse(msg.content.toString());
//         try {
//           if (payload.service == "DEMO_SERVICE") {
//             //DO SOMETHING
//             console.log("call demo service");
//           }
//         } catch {}

//         // Log everything clearly
//         // console.log("📤 Message sent:", rawMessage); // exactly what was sent
//         console.log("🛠 Inside service layer:", payload);
//         console.log(" Received data:", payload);

//         // // Call service logic
//         service.myService(payload);

//         // Acknowledge
//         channel.ack(msg);
//       }
//     });

//     console.log(
//       ` Subscribed to queue "${queueName}" with binding key "${binding_key}"`
//     );
//   } catch (error) {
//     console.error(" Error subscribing to messages:", error);
//     throw error;
//   }
// };

const subscribeMessage = async (channel, service, binding_key) => {
  try {
    const queueName = "REMINDER_QUEUE";

    // Ensure the exchange exists
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

    // Ensure the queue exists
    const applicationQueue = await channel.assertQueue(queueName, {
      durable: true,
    });

    // Bind the queue to the exchange with the binding key
    await channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

    // Consume messages
    channel.consume(applicationQueue.queue, (msg) => {
      if (msg !== null) {
        // Raw message (string)
        const payload = JSON.parse(msg.content.toString());

        service(payload);

        // Log everything clearly
        console.log(" Received data:", payload);

        // Acknowledge
        channel.ack(msg);
      }
    });

    console.log(
      ` Subscribed to queue "${queueName}" with binding key "${binding_key}"`
    );
  } catch (error) {
    console.error("Error subscribing to messages:", error);
    throw error;
  }
};

// const publisherMessage = async (channel, binding_key, message) => {
//   try {
//     // Ensure the exchange exists
//     await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

//     // Optional: ensure the queue exists and is bound to the exchange
//     // we can replace QUEUE_NAME with your actual queue name
//     const queueName = "REMINDER_QUEUE";
//     await channel.assertQueue(queueName, { durable: true });
//     await channel.bindQueue(queueName, EXCHANGE_NAME, binding_key);

//     // Convert message to Buffer
//     const bufferMessage = Buffer.from(
//       typeof message === "string" ? message : JSON.stringify(message)
//     );

//     // Publish message to exchange with binding key
//     channel.publish(EXCHANGE_NAME, binding_key, bufferMessage);

//     console.log(
//       `Message sent to exchange "${EXCHANGE_NAME}" with binding key "${binding_key}":`,
//       message
//     );
//   } catch (error) {
//     console.error("Error publishing message:", error);
//     throw error;
//   }
// };

const publisherMessage = async (channel, binding_key, message) => {
  try {
    // Ensure the exchange exists
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

    // Ensure the queue exists and is bound to the exchange
    const queueName = "REMINDER_QUEUE";
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, EXCHANGE_NAME, binding_key);

    // Convert message to Buffer
    const bufferMessage = Buffer.from(
      typeof message === "string" ? message : JSON.stringify(message)
    );

    // Publish message to exchange with binding key, make it persistent
    const isPublished = channel.publish(
      EXCHANGE_NAME,
      binding_key,
      bufferMessage,
      {
        persistent: true, // ✅ ensures message is saved to disk if RabbitMQ restarts
      }
    );

    if (isPublished) {
      console.log(
        `✅ Message sent to exchange "${EXCHANGE_NAME}" with binding key "${binding_key}":`,
        message
      );
    } else {
      console.warn(
        "⚠️ Message was not published (internal buffer full):",
        message
      );
    }
  } catch (error) {
    console.error("❌ Error publishing message:", error);
    throw error;
  }
};

module.exports = {
  createChannel,
  subscribeMessage,
  publisherMessage,
};
