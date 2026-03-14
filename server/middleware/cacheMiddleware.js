const { getCache, setCache } = require("../config/redis");

/**
 * TTL-based cache middleware factory
 * @param {string} key    — structured cache key (e.g. "debates:trending")
 * @param {number} ttl    — time to live in seconds
 */
const cacheMiddleware = (key, ttl) => {
    return async (req, res, next) => {
        // Build unique key with query params
        const cacheKey = req.originalUrl ? `${key}:${req.originalUrl}` : key;

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Wrap res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            setCache(cacheKey, data, ttl);
            return originalJson(data);
        };

        next();
    };
};

module.exports = { cacheMiddleware };
