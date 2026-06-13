// Redis client setup with cache helpers (get, set, delete, pattern delete)

const Redis = require("ioredis");

let client = null;

// Connect if REDIS_URL is set, otherwise skip caching
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

// Get cached data by key
const getCache = async (key) => {
    if (!client) return null;
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

// Save data to cache with TTL in seconds
const setCache = async (key, data, ttl) => {
    if (!client) return;
    try {
        await client.setex(key, ttl, JSON.stringify(data));
    } catch (err) {
        console.warn(`Cache write failed for key "${key}": ${err.message}`);
    }
};

// Delete a single cached key
const deleteCache = async (key) => {
    if (!client) return;
    try {
        await client.del(key);
    } catch (err) {
        console.warn(`Cache delete failed for key "${key}": ${err.message}`);
    }
};

// Delete all keys matching a wildcard pattern (e.g. "debates:*")
async function deleteCachePattern(pattern) {
    if (!client) return;
    try {
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