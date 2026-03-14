const Redis = require("ioredis");
const logger = require("../utils/logger");

let client = null;

if (process.env.REDIS_URL) {
    client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 300,
        lazyConnect: true,
    });

    client.on("connect", () => logger.info("Redis connected"));
    client.on("error", (err) => {
        logger.warn(`Redis error: ${err.message}`);
    });

    // Attempt connection
    client.connect().catch((err) => {
        logger.warn(`Redis connection failed: ${err.message}. Caching disabled.`);
        client = null;
    });
} else {
    logger.warn("REDIS_URL not set — caching disabled");
}

/**
 * Get cached value by key
 */
const getCache = async (key) => {
    if (!client) return null;
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

/**
 * Set cache with TTL (seconds)
 */
const setCache = async (key, data, ttl) => {
    if (!client) return;
    try {
        await client.setex(key, ttl, JSON.stringify(data));
    } catch {
        // Silently fail — caching is optional
    }
};

/**
 * Delete cache by key
 */
const deleteCache = async (key) => {
    if (!client) return;
    try {
        await client.del(key);
    } catch {
        // Silently fail
    }
};

module.exports = { getCache, setCache, deleteCache };
