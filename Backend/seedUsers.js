const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  try {
    const passwordIT = await bcrypt.hash('ITpassword123', 10);
    const passwordEmp = await bcrypt.hash('Employee123', 10);

    await pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", ['Admin IT', 'itadmin@example.com', passwordIT, 'IT']);
    await pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", ['Employee User', 'employee@example.com', passwordEmp, 'Employees']);

    console.log('Usuarios de prueba insertados correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error al insertar usuarios:', err);
    process.exit(1);
  }
}

seedUsers();
