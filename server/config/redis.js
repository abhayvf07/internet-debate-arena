const Redis = require("ioredis");

let client = null;

// Connect to Redis if we have a URL setup, otherwise just run without caching
if (process.env.REDIS_URL) {
    client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 300,
        lazyConnect: true,
    });

    client.on("connect", () => console.log("Redis connected"));
    client.on("error", (err) => {
        console.warn(`Redis error: ${err.message}`);
    });

    client.connect().catch((err) => {
        console.warn(`Redis connection failed: ${err.message}. Caching disabled.`);
        client = null;
    });
} else {
    console.warn("REDIS_URL not set — caching disabled");
}

// Grab saved data from the cache
const getCache = async (key) => {
    if (!client) return null;
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null; // Returning null is safe here so the app just fetches fresh data instead
    }
};

// Save data to the cache with an expiration timer (TTL in seconds)
const setCache = async (key, data, ttl) => {
    if (!client) return;
    try {
        await client.setex(key, ttl, JSON.stringify(data));
    } catch (err) {
        // Log the error for monitoring, but don't crash the app
        console.warn(`Cache write failed for key "${key}": ${err.message}`);
    }
};

// Remove a specific cached item
const deleteCache = async (key) => {
    if (!client) return;
    try {
        await client.del(key);
    } catch (err) {
        console.warn(`Cache delete failed for key "${key}": ${err.message}`);
    }
};

// Find and delete a bunch of cached items using a wildcard (like "debates:*")
async function deleteCachePattern(pattern) {
    if (!client) return;
    try {
        // Scan in small batches so we don't lock up the database
        const stream = client.scanStream({
            match: pattern,
            count: 100
        });

        for await (const keys of stream) {
            if (keys.length) {
                await client.del(keys);
            }
        }
    } catch (err) {
        console.error(`Error deleting cache pattern "${pattern}": ${err.message}`);
    }
}

module.exports = { getCache, setCache, deleteCache, deleteCachePattern };