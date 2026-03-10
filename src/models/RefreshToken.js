const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  token: { type: String, required: true },

  expiresAt: Date
},
{ timestamps: true }
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
