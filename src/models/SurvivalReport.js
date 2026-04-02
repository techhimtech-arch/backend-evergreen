const mongoose = require('mongoose');

const survivalReportSchema = new mongoose.Schema({
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'PlantationSite', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Verifier or group leader depending on workflow
  reportDate: { type: Date, default: Date.now },
  period: { type: Number, enum: [30, 60, 90, 180, 365], required: true }, // Monitoring period (e.g., 30 days)
  livePlants: { type: Number, required: true },
  deadPlants: { type: Number, required: true },
  replacementNeeded: { type: Number, default: 0 },
  remarks: { type: String }
}, { timestamps: true });

survivalReportSchema.virtual('survivalPercentage').get(function() {
  const total = this.livePlants + this.deadPlants;
  if (total === 0) return 0;
  return (this.livePlants / total) * 100;
});

module.exports = mongoose.model('SurvivalReport', survivalReportSchema);
