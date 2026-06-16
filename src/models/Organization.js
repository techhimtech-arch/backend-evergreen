const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
{
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },

  organizationType: {
    type: String,
    enum: ["GOVERNMENT", "NGO", "SCHOOL", "CSR", "CSR_COMPANY", "PSU", "TRUST"],
    required: true
  },

  description: String,
  contactEmail: String,
  contactPhone: String,

  address: String,
  logo: String,
  
  // CSR specific fields
  csrContactPerson: String,
  csrEmail: String,
  csrPhone: String,
  annualCSRBudget: Number,
  website: String,

  status: {
    type: String,
    enum: ["ACTIVE", "SUSPENDED"],
    default: "ACTIVE"
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
