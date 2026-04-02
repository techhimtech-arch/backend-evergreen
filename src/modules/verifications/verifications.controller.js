const expressAsyncHandler = require('express-async-handler');
const Verification = require('../../models/Verification');
const PlantationEntry = require('../../models/PlantationEntry');

exports.createVerification = expressAsyncHandler(async (req, res) => {
  req.body.verifiedBy = req.user ? req.user.id : null;
  const verification = await Verification.create(req.body);
  
  // Update associated PlantationEntry status
  if (req.body.entry) {
    let status = 'Pending';
    if (req.body.outcome === 'Approved') status = 'Verified';
    else if (req.body.outcome === 'Rejected' || req.body.outcome === 'Needs Rework') status = 'Rejected';
    
    await PlantationEntry.findByIdAndUpdate(req.body.entry, { verificationStatus: status });
  }

  res.status(201).json({ success: true, data: verification });
});

exports.getVerifications = expressAsyncHandler(async (req, res) => {
  const verifications = await Verification.find()
    .populate({ path: 'entry', populate: { path: 'site group' } })
    .populate('verifiedBy', 'name email');
  res.status(200).json({ success: true, count: verifications.length, data: verifications });
});
