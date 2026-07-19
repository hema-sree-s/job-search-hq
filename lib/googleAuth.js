const { OAuth2Client } = require("google-auth-library");

let _client = null;

function getClient() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not set on this deployment.");
  }
  if (!_client) _client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return _client;
}

// Verifies a Google Identity Services ID token (the "credential" the button
// hands back) and returns its payload — { sub, email, email_verified, name, ... }.
// Throws if the token is missing/invalid/expired/wrong-audience.
async function verifyGoogleIdToken(idToken) {
  const client = getClient();
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  return ticket.getPayload();
}

module.exports = { verifyGoogleIdToken };
