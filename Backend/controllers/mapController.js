const pool = require('../db');

// Guardar mapa
exports.saveMap = async (req, res) => {
  try {
    const { headquarters, floor, objects } = req.body;
    // Buscar o crear headquarters
    const hqRows = await pool.query('SELECT id FROM headquarters WHERE name = ?', [headquarters]);
    const hqId = hqRows.length ? hqRows[0].id : (await pool.query('INSERT INTO headquarters (name) VALUES (?)', [headquarters])).insertId;
    // Buscar o crear floor
    const floorRows = await pool.query('SELECT id FROM floors WHERE name = ? AND headquarters_id = ?', [floor, hqId]);
    const floorId = floorRows.length ? floorRows[0].id : (await pool.query('INSERT INTO floors (name, headquarters_id) VALUES (?, ?)', [floor, hqId])).insertId;
    // Antes de insertar, eliminar registros previos para evitar duplicados
    await pool.query('DELETE FROM map_objects WHERE floor_id = ?', [floorId]);

    // Guardar objetos
    for (const obj of objects) {
      await pool.query('INSERT INTO map_objects (floor_id, type, name, x, y, width, height, placed, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [floorId, obj.type, obj.name, obj.x, obj.y, obj.width, obj.height, obj.placed, obj.isDefault]);
    }
    res.json({ message: 'Mapa guardado correctamente' });
  } catch (err) {
    console.error('Error guardando mapa:', err);
    res.status(500).json({ error: 'Error guardando mapa' });
  }
};

// Editar mapa
exports.editMap = async (req, res) => {
  try {
    const { headquarters, floor, objects } = req.body;
    // Buscar headquarters y floor
    const hqRows = await pool.query('SELECT id FROM headquarters WHERE name = ?', [headquarters]);
    if (!hqRows.length) return res.status(404).json({ error: 'Headquarters no encontrado' });
    const flRows = await pool.query('SELECT id FROM floors WHERE name = ? AND headquarters_id = ?', [floor, hqRows[0].id]);
    if (!flRows.length) return res.status(404).json({ error: 'Floor no encontrado' });
    const floorId = flRows[0].id;
    // Eliminar objetos previos
    await pool.query('DELETE FROM map_objects WHERE floor_id = ?', [floorId]);
    // Insertar nuevos objetos
    for (const obj of objects) {
      await pool.query('INSERT INTO map_objects (floor_id, type, name, x, y, width, height, placed, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [floorId, obj.type, obj.name, obj.x, obj.y, obj.width, obj.height, obj.placed, obj.isDefault]);
    }
    res.json({ message: 'Mapa editado correctamente' });
  } catch (err) {
    console.error('Error editando mapa:', err);
    res.status(500).json({ error: 'Error editando mapa' });
  }
};

// Ver mapa
exports.viewMap = async (req, res) => {
  try {
    const { headquarters, floor } = req.query;
    const hqRows = await pool.query('SELECT id FROM headquarters WHERE name = ?', [headquarters]);
    if (!hqRows.length) return res.status(404).json({ error: 'Headquarters no encontrado' });
    const flRows = await pool.query('SELECT id FROM floors WHERE name = ? AND headquarters_id = ?', [floor, hqRows[0].id]);
    if (!flRows.length) return res.status(404).json({ error: 'Floor no encontrado' });
    const floorId = flRows[0].id;
    const objects = await pool.query('SELECT * FROM map_objects WHERE floor_id = ?', [floorId]);
    res.json({ headquarters, floor, objects });
  } catch (err) {
    console.error('Error viendo mapa:', err);
    res.status(500).json({ error: 'Error viendo mapa' });
  }
};

// Listar headquarters y floors (y combinaciones de mapas guardados)
exports.getOptions = async (req, res) => {
  try {
    const headquartersRows = await pool.query('SELECT name FROM headquarters');
    const floorRows = await pool.query('SELECT name FROM floors');

    // Obtener combinaciones de mapas guardados para facilitar la selección en el frontend
    const savedMaps = await pool.query(
      `SELECT DISTINCT h.name AS headquarters, f.name AS floor
       FROM map_objects mo
       JOIN floors f ON mo.floor_id = f.id
       JOIN headquarters h ON f.headquarters_id = h.id`
    );

    res.json({
      headquarters: headquartersRows.map(h => h.name),
      floors: floorRows.map(f => f.name),
      savedMaps: savedMaps.map(m => ({ headquarters: m.headquarters, floor: m.floor })),
    });
  } catch (err) {
    console.error('Error obteniendo opciones:', err);
    res.status(500).json({ error: 'Error obteniendo opciones' });
  }
};
