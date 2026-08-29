// Report service — create, list, and resolve argument reports
const Report = require("../models/Report");
const { paginate } = require("../utils/pagination");

// Create a report on an argument
const createReport = async ({ userId, argumentId, reason }) => {
  if (!argumentId || !reason) {
    const error = new Error("argumentId and reason are required");
    error.statusCode = 400;
    throw error;
  }

  // Prevent duplicate reports
  const existing = await Report.findOne({
    userId,
    argumentId,
    status: "pending",
  });
  if (existing) {
    const error = new Error("You have already reported this argument");
    error.statusCode = 409;
    throw error;
  }

  return Report.create({ userId, argumentId, reason });
};

// Get all pending reports (paginated)
const getReports = async (query = {}) => {
  const data = await paginate(Report, { status: "pending" }, query, {
    populate: [
      { path: "userId", select: "name email" },
      { path: "argumentId", populate: { path: "author", select: "name" } },
    ],
    sort: { createdAt: -1 },
  });

  return {
    reports: data.results,
    page: data.page,
    totalPages: data.totalPages,
    total: data.total,
  };
};

// Mark a report as resolved
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