// Redis cache middleware — serves cached response or caches new one with TTL

const { getCache, setCache } = require("../config/redis");

const cacheMiddleware = (key, ttl) => {
    return async (req, res, next) => {
        // Build unique key using the full URL
        const cacheKey = req.originalUrl ? `${key}:${req.originalUrl}` : key;

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Intercept res.json to save response to cache
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            setCache(cacheKey, data, ttl);
            return originalJson(data);
        };

        next();
    };
};

module.exports = { cacheMiddleware };
