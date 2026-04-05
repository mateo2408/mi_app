// Modelo de paciente (mascota) vinculado a un dueño.
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    ownerId: {
      // Referencia directa al documento de Owner.
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    species: {
      type: String,
      required: true,
      trim: true
    },
    breed: {
      type: String,
      default: ''
    },
    sex: {
      type: String,
      enum: ['macho', 'hembra', 'desconocido'],
      default: 'desconocido'
    },
    birthDate: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Pet', petSchema);
