const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authModel = require('../models/authModel');

const SECRET_KEY = process.env.JWT_SECRET || 'supersecret';

const login = async (req, res) => {
  const email = req.body.institutional_email || req.body.email;
  const password = req.body.password;
  try {
    console.log('Intentando login con:', { email, password });
    const user = await authModel.getUserByEmail(email);
    console.log('Usuario encontrado:', user);
    if (!user) {
      console.error('Usuario no encontrado:', email);
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const valid = await bcrypt.compare(password, user.password);
    console.log('Password válido:', valid);
    if (!valid) {
      console.error('Contraseña incorrecta para usuario:', email);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    console.log('Token generado:', token);
    res.json({ token, user });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en login', detail: err.message });
  }
};

module.exports = { login };