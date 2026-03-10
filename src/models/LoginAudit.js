const mongoose = require("mongoose");

const loginAuditSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  ipAddress: String,
  userAgent: String,

  status: {
    type: String,
    enum: ["SUCCESS", "FAILED"]
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("LoginAudit", loginAuditSchema);
