// Modelo de dueño/responsable de mascota.
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
      cedula: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        default: ''
      },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
    ,
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null
    },
    province: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Province',
      default: null
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Owner', ownerSchema);
