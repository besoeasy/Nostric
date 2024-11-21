const { generateSecretKey, getPublicKey, signEvent } = require("nostr-tools");
const WebSocket = require("ws");

const nostr_relays = [
  "wss://relay.damus.io", // Public relay
  "wss://nostr-pub.wellorder.net", // Another public relay
  "wss://relay.nostr.info", // Example relay
  
];

async function sendLog(privateKey, relays, message, recipientPublicKey) {
  const event = {
    kind: 1, // Kind 1 is typically used for "text" events
    created_at: Math.floor(Date.now() / 1000),
    tags: [["p", recipientPublicKey]], // Add a tag pointing to the recipient's public key
    content: message,
    pubkey: getPublicKey(privateKey), // Get the public key of the sender
  };

  // Sign the event (this finalizes it)
  const signedEvent = signEvent(event, privateKey);

  // Publish the event to all relays
  for (const relay of relays) {
    const relayConnection = new WebSocket(relay);

    relayConnection.on("open", () => {
      relayConnection.send(JSON.stringify(["EVENT", signedEvent]));
      console.log(`Log sent to ${relay}:`, signedEvent);
    });

    relayConnection.on("error", (error) => {
      console.error(`Relay connection error (${relay}):`, error);
    });
  }
}

// Example usage
const sk = generateSecretKey(); // Generate sender's secret key
const pk = getPublicKey(sk); // Generate sender's public key
const recipientPk = "npub176qdmkxp8uww4wfwm56ftu8uuarmhqxzwrsgr7qvwsqma7mzmf7qu9ktln"; // Replace with the recipient's public key
const message = "Hello from Nostric!";

sendLog(sk, nostr_relays, message, recipientPk);
