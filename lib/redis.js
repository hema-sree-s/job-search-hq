const { Redis } = require("@upstash/redis");

let _redis = null;

// Vercel's Upstash integration auto-injects UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN once you connect a database in the project's
// Storage tab. No manual config needed beyond that.
function getRedis() {
  if (_redis) return _redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
      "No database connected. In your Vercel project, go to Storage → Connect Database → Upstash → create a Redis database, then redeploy."
    );
  }
  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return _redis;
}

// Defensive helpers: the Upstash SDK usually auto (de)serializes JSON, but
// we parse manually too in case a value ever comes back as a raw string.
async function getJSON(redis, key) {
  const v = await redis.get(key);
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch (e) { return v; }
  }
  return v;
}

async function setJSON(redis, key, value) {
  return redis.set(key, value);
}

module.exports = { getRedis, getJSON, setJSON };
