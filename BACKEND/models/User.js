/**
 * @StudyGuide [MODELO] Autenticación / Veterinarios
 * Representa a los usuarios del sistema (Doctores, Administradores).
 * Demuestra la seguridad recomendada (Hash de contraseñas, enumeración de roles).
 */
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
      // @StudyGuide Nunca se guarda la contraseña en texto plano en la Base de Datos.
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
