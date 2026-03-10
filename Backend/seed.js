const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MariaDB',
  database: 'otdbackend',
  connectionLimit: 5
});

const bcrypt = require('bcryptjs');

async function seed() {
  try {
    // Eliminar tablas si existen (borrar en orden para respetar FKs)
    await pool.query('DROP TABLE IF EXISTS tickets');
    await pool.query('DROP TABLE IF EXISTS desks');
    await pool.query('DROP TABLE IF EXISTS map_objects');
    await pool.query('DROP TABLE IF EXISTS floors');
    await pool.query('DROP TABLE IF EXISTS headquarters');
    await pool.query('DROP TABLE IF EXISTS users');

    // Crear tabla users
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL
    )`);

    // Crear tabla headquarters
    await pool.query(`CREATE TABLE IF NOT EXISTS headquarters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      connect VARCHAR(100),
      radio VARCHAR(100),
      bps VARCHAR(100)
    )`);

    // Crear tabla floors
    await pool.query(`CREATE TABLE IF NOT EXISTS floors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      headquarters_id INT,
      name VARCHAR(50) NOT NULL,
      description TEXT,
      FOREIGN KEY (headquarters_id) REFERENCES headquarters(id)
    )`);

    // Crear tabla map_objects
    await pool.query(`CREATE TABLE IF NOT EXISTS map_objects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      floor_id INT,
      type VARCHAR(50) NOT NULL,
      name VARCHAR(100),
      x INT,
      y INT,
      width INT,
      height INT,
      placed BOOLEAN DEFAULT FALSE,
      isDefault BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (floor_id) REFERENCES floors(id)
    )`);

    // Crear tabla desks
    await pool.query(`CREATE TABLE IF NOT EXISTS desks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      map_object_id INT,
      name VARCHAR(100) NOT NULL,
      location VARCHAR(100),
      status VARCHAR(50),
      hasReport BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (map_object_id) REFERENCES map_objects(id)
    )`);

    // Crear tabla tickets
    await pool.query(`CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      description TEXT,
      status VARCHAR(50),
      user_id INT,
      desk_id INT,
      priority VARCHAR(20),
      category VARCHAR(50),
      createdByName VARCHAR(100),
      assignedTo VARCHAR(100),
      assignedToName VARCHAR(100),
      location VARCHAR(100),
      createdAt DATETIME,
      updatedAt DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (desk_id) REFERENCES desks(id)
    )`);

    // Insertar datos de ejemplo para headquarters
    await pool.query("INSERT INTO headquarters (name, connect, radio, bps) VALUES (?, ?, ?, ?)", ['Caracol radio', '192.168.0.1', 'Radio A', '1000']);
    await pool.query("INSERT INTO headquarters (name, connect, radio, bps) VALUES (?, ?, ?, ?)", ['Conecta 80', '192.168.1.1', 'Radio B', '1000']);
    await pool.query("INSERT INTO headquarters (name, connect, radio, bps) VALUES (?, ?, ?, ?)", ['American BPS', '192.168.2.1', 'Radio C', '1000']);

    // Insertar usuarios de prueba
    const passwordIT = await bcrypt.hash('ITpassword123', 10);
    const passwordEmp = await bcrypt.hash('Employee123', 10);
    await pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", ['Admin IT', 'itadmin@example.com', passwordIT, 'IT']);
    await pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", ['Employee User', 'employee@example.com', passwordEmp, 'Employees']);

    console.log('Tablas y datos de prueba creados correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error creando tablas o usuarios:', err);
    process.exit(1);
  }
}

seed();
