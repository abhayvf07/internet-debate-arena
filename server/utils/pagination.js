/**
 * Reusable pagination helper
 *
 * @param {Object} model    — Mongoose model
 * @param {Object} filter   — query filter
 * @param {Object} query    — req.query (page, limit)
 * @param {Object} options  — { populate, sort, select }
 * @returns { results, page, totalPages, total }
 */
const paginate = async (model, filter = {}, query = {}, options = {}) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    let dbQuery = model.find(filter);

    if (options.populate) {
        dbQuery = dbQuery.populate(options.populate);
    }
    if (options.select) {
        dbQuery = dbQuery.select(options.select);
    }

    const sort = options.sort || { createdAt: -1 };
    dbQuery = dbQuery.sort(sort).skip(skip).limit(limit);

    if (options.lean !== false) {
        dbQuery = dbQuery.lean();
    }

    const [results, total] = await Promise.all([
        dbQuery,
        model.countDocuments(filter),
    ]);

    return {
        results,
        page,
        totalPages: Math.ceil(total / limit),
        total,
    };
};

module.exports = { paginate };
