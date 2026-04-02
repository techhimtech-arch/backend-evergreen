const expressAsyncHandler = require('express-async-handler');
const SurvivalReport = require('../../models/SurvivalReport');

exports.createReport = expressAsyncHandler(async (req, res) => {
  req.body.reportedBy = req.user ? req.user.id : null;
  const report = await SurvivalReport.create(req.body);
  res.status(201).json({ success: true, data: report });
});

exports.getReports = expressAsyncHandler(async (req, res) => {
  const reports = await SurvivalReport.find()
    .populate('site', 'areaName')
    .populate('reportedBy', 'name');
  res.status(200).json({ success: true, count: reports.length, data: reports });
});
