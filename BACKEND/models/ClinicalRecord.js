// Modelo de historia clínica por atención.
const mongoose = require('mongoose');

const clinicalRecordSchema = new mongoose.Schema(
  {
    petId: {
      // Referencia al paciente del registro.
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    },
    veterinarianName: {
      type: String,
      required: true,
      trim: true
    },
    recordDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    treatment: {
      type: String,
      required: true,
      trim: true
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

module.exports = mongoose.model('ClinicalRecord', clinicalRecordSchema);
