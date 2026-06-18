const asyncHandler = require('express-async-handler');
const sponsorService = require('./sponsors.service');

const createSponsor = asyncHandler(async (req, res) => {
  const sponsor = await sponsorService.createSponsor(req.body);
  res.status(201).json({
    success: true,
    data: sponsor
  });
});

const getSponsors = asyncHandler(async (req, res) => {
  const sponsors = await sponsorService.getSponsors();
  res.status(200).json({
    success: true,
    data: sponsors
  });
});

const getSponsorById = asyncHandler(async (req, res) => {
  const sponsor = await sponsorService.getSponsorById(req.params.id);
  res.status(200).json({
    success: true,
    data: sponsor
  });
});

const addSponsorshipFund = asyncHandler(async (req, res) => {
  const sponsorship = await sponsorService.addSponsorshipFund(req.params.id, req.body);
  res.status(201).json({
    success: true,
    data: sponsorship
  });
});

const generateSponsorReport = asyncHandler(async (req, res) => {
  try {
    const pdfBuffer = await sponsorService.generateSponsorReport(req.params.id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sponsor-report-${req.params.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    if (error.message === 'Sponsor not found') {
      res.status(404);
      throw error;
    }
    throw new Error('Failed to generate PDF report');
  }
});

module.exports = {
  createSponsor,
  getSponsors,
  getSponsorById,
  addSponsorshipFund,
  generateSponsorReport
};
