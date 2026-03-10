require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const deskRoutes = require('./routes/deskRoutes');
const mapRoutes = require('./routes/mapRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/desks', deskRoutes);
app.use('/api/maps', mapRoutes);


// Configuración de conexión a MariaDB (reutiliza el pool central)
const pool = require('./db');

// Verificar conexión a la base de datos al iniciar
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado correctamente a MariaDB');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MariaDB:', err);
  });

app.get('/', (req, res) => {
  res.send('Backend funcionando');
});

// Puerto
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

module.exports = { app, pool };