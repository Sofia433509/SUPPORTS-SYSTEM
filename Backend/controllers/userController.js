const userModel = require('../models/userModel');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    const usersWithoutPassword = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(usersWithoutPassword);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios', detail: err.message });
  }
};

// Obtener usuario por ID
const getUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener usuario', detail: err.message });
  }
};

// Crear usuario
const bcrypt = require('bcryptjs');
const createUser = async (req, res) => {
  try {
    console.log('Datos recibidos para registro:', req.body);
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log('Contraseña hasheada:', hashedPassword);
    const userData = { ...req.body, password: hashedPassword };
    const result = await userModel.createUser(userData);
    const userId = result.insertId ? result.insertId.toString() : null;
    res.status(201).json({ message: 'Usuario creado', userId });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'El email ya está registrado.' });
    } else {
      res.status(500).json({ error: 'Error al crear usuario', detail: err.message });
    }
  }
};

module.exports = { getUsers, getUser, createUser };

// Recuperación de contraseña
const crypto = require('crypto');

const requestPasswordRecovery = async (req, res) => {
  const email = req.body.institutional_email || req.body.email;
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  // Generar código aleatorio
  const code = crypto.randomInt(100000, 999999).toString();
  try {
    await userModel.saveRecoveryCode(email, code);
    res.json({ message: 'Código generado', code }); // Mostrar código para pruebas
  } catch (err) {
    res.status(500).json({ error: 'Error generando código', detail: err.message });
  }
};

const verifyRecoveryCode = async (req, res) => {
  const email = req.body.institutional_email || req.body.email;
  const code = req.body.code;
  if (!email || !code) return res.status(400).json({ error: 'Email y código requeridos' });
  try {
    const valid = await userModel.verifyRecoveryCode(email, code);
    if (!valid) return res.status(400).json({ error: 'Código inválido o expirado' });
    res.json({ message: 'Código válido' });
  } catch (err) {
    res.status(500).json({ error: 'Error verificando código', detail: err.message });
  }
};

const resetPassword = async (req, res) => {
  const email = req.body.institutional_email || req.body.email;
  const code = req.body.code;
  const newPassword = req.body.new_password;
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Datos requeridos' });
  try {
    const valid = await userModel.verifyRecoveryCode(email, code);
    if (!valid) return res.status(400).json({ error: 'Código inválido o expirado' });
    // Hashear nueva contraseña
    const hashed = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(email, hashed);
    await userModel.deleteRecoveryCodes(email);
    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando contraseña', detail: err.message });
  }
};

module.exports.requestPasswordRecovery = requestPasswordRecovery;
module.exports.verifyRecoveryCode = verifyRecoveryCode;
module.exports.resetPassword = resetPassword;