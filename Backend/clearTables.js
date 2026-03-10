const pool = require('./db');

async function clearTables() {
  try {
    // Eliminar datos de las tablas principales
    await pool.query('DELETE FROM tickets');
    await pool.query('DELETE FROM desks');
    await pool.query('DELETE FROM users');

    // Eliminar datos de mapas (para poder reiniciar el estado de mapeo)
    await pool.query('DELETE FROM map_objects');
    await pool.query('DELETE FROM floors');
    await pool.query('DELETE FROM headquarters');

    console.log('Datos de todas las tablas borrados correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error al borrar datos:', err);
    process.exit(1);
  }
}

clearTables();
