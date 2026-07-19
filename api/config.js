// Public, unauthenticated. Only ever exposes things that are safe for the
// browser to see (a Google OAuth *client* ID is public by design — it's not
// a secret, the same way an app's App Store ID isn't a secret).
module.exports = async (req, res) => {
  res.status(200).json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  });
};
