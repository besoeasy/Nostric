const {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  verifyEvent,
} = require("nostr-tools/pure");

const WebSocket = require("ws"); // Import the 'ws' package for WebSocket support

// Constants
const RELAY_URL = "wss://nos.lol"; // Relay to connect to

/**
 * Helper to wait for WebSocket events using Promises
 * @param {WebSocket} socket
 * @param {string} event
 * @returns {Promise}
 */
function waitForSocketEvent(socket, event) {
  return new Promise((resolve, reject) => {
    if (event === "error") {
      socket.on("error", reject);
    } else {
      socket.on(event, resolve);
    }
  });
}

/**
 * Create and finalize a Nostr event
 * @param {string} sk - Sender's secret key
 * @param {string} message - Message content
 * @param {string} recipientPublicKey - Recipient's public key
 * @returns {object} - Finalized Nostr event
 */
function createEvent(sk, message, recipientPublicKey) {
  const event = finalizeEvent(
    {
      kind: 1, // Kind 1 is typically used for "text" events
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", recipientPublicKey]], // Add a tag pointing to the recipient's public key
      content: message,
    },
    sk
  );

  if (!verifyEvent(event)) {
    throw new Error("Event verification failed.");
  }

  console.log("Event created and verified:", event);
  return event;
}

/**
 * Send a Nostr log message
 * @param {string} sk - Sender's secret key
 * @param {string} message - Message content
 * @param {string} recipientPublicKey - Recipient's public key
 */
async function sendLog(sk, message, recipientPublicKey) {
  const event = createEvent(sk, message, recipientPublicKey);

  // Connect to the relay
  const relay = new WebSocket(RELAY_URL);

  try {
    console.log("Connecting to relay...");

    // Wait for WebSocket to open
    await waitForSocketEvent(relay, "open");

    console.log("Connected to relay. Sending log...");
    relay.send(JSON.stringify(["EVENT", event]));

    console.log("Log sent successfully!");
  } catch (error) {
    console.error("Failed to send log:", error.message);
  } finally {
    // Gracefully close the relay connection
    if (relay.readyState === WebSocket.OPEN) {
      relay.close();
      console.log("Relay connection closed.");
    }
  }
}

// Generate sender's secret key
const sk = generateSecretKey();

// Replace with actual recipient's public key
const recipientPk = "npub19r9egcyrrsdulr2q4vyy7jzq5n53fj6rupnp9xrh9c24t23wt9lqdk7sc6";

// Message to send
const message = "Hello from Nostric!";

// Send the log
sendLog(sk, message, recipientPk).catch((err) => console.error("Unhandled error:", err.message));
