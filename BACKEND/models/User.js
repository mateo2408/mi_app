// Modelo de usuario del sistema (acceso y roles).
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      // Nunca se guarda contraseña en texto plano.
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'recepcion', 'veterinario'],
      default: 'recepcion'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
