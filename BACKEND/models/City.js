const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('City', citySchema);
