const Redis = require("ioredis");

let client = null;

if (process.env.REDIS_URL) {
    // Create client
    client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 300,
        lazyConnect: true,
    });

    client.on("connect", () => console.log("Redis connected"));
    client.on("error", (err) => {
        console.warn(`Redis error: ${err.message}`);
    });

    // Attempt connection
    client.connect().catch((err) => {
        console.warn(`Redis connection failed: ${err.message}. Caching disabled.`);
        client = null;
    });
} else {
    console.warn("REDIS_URL not set — caching disabled");
}

// Get cached value by key
const getCache = async (key) => {
    if (!client) return null;
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

// Set cache with TTL (seconds)
const setCache = async (key, data, ttl) => {
    if (!client) return;
    try {
        await client.setex(key, ttl, JSON.stringify(data));
    } catch {
        // Silently fail
    }
};

// Delete single cache by key
const deleteCache = async (key) => {
    if (!client) return;
    try {
        await client.del(key);
    } catch {
        // Silently fail
    }
};

// Delete multiple cache keys using a pattern with SCAN
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
        console.error(`Error deleting cache pattern ${pattern}: ${err.message}`);
    }
}

module.exports = { getCache, setCache, deleteCache, deleteCachePattern };
