const { generateSecretKey, getPublicKey, finalizeEvent, verifyEvent } = require("nostr-tools/pure");
const { Relay } = require("nostr-tools/relay");

async function sendLog(sk, message, recipientPublicKey) {
  let event = finalizeEvent(
    {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", recipientPublicKey]],
      content: message,
    },
    sk
  );

  let isGood = verifyEvent(event);
  console.log("Event verification:", isGood);

  const relay = await Relay.connect("wss://relay.damus.io");

  await relay.publish(event);
  console.log("Log sent!");

  relay.close();
}

// Generate secret and public keys
const sk = generateSecretKey();
const pk = getPublicKey(sk);

// Replace with actual recipient's public key
const recipientPk = "npub176qdmkxp8uww4wfwm56ftu8uuarmhqxzwrsgr7qvwsqma7mzmf7qu9ktln";
const message = "Hello from Nostric!";

sendLog(sk, message, recipientPk).catch((err) => console.error(err));
