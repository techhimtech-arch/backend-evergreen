const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema(
{
  name: { type: String, required: true },

  scientificName: String,

  category: {
    type: String,
    enum: ["FOREST", "FRUIT", "MEDICINAL", "ORNAMENTAL"]
  },

  description: String,
  image: String
},
{ timestamps: true }
);

module.exports = mongoose.model("Plant", plantSchema);
