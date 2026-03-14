const Report = require("../models/Report");

/**
 * Create a report
 */
const createReport = async ({ userId, argumentId, reason }) => {
    if (!argumentId || !reason) {
        const error = new Error("argumentId and reason are required");
        error.statusCode = 400;
        throw error;
    }

    return Report.create({ userId, argumentId, reason });
};

/**
 * Get all pending reports
 */
const getReports = async () => {
    return Report.find({ status: "pending" })
        .populate("userId", "name email")
        .populate({
            path: "argumentId",
            populate: { path: "author", select: "name" },
        })
        .sort({ createdAt: -1 });
};

/**
 * Resolve a report
 */
const resolveReport = async (reportId) => {
    const report = await Report.findById(reportId);
    if (!report) {
        const error = new Error("Report not found");
        error.statusCode = 404;
        throw error;
    }

    report.status = "resolved";
    await report.save();
    return { message: "Report resolved", report };
};

module.exports = { createReport, getReports, resolveReport };
