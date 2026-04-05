// Modelo de cita veterinaria.
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    petId: {
      // Referencia al paciente atendido.
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    },
    veterinarianName: {
      type: String,
      required: true,
      trim: true
    },
    dateTime: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['programada', 'atendida', 'cancelada'],
      default: 'programada'
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

module.exports = mongoose.model('Appointment', appointmentSchema);
