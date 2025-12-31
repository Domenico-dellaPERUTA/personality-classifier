// backend/server.js
import express from 'express';
import { createPool } from 'mysql2/promise';
import cors from 'cors';
import { json } from 'body-parser';
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(json());

// Database connection pool
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'personality_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Funzione per calcolare personality_type_id dalle scale
const getPersonalityTypeId = async (scale_ei, scale_sn, scale_tf, scale_jp) => {
  const calculated_type = 
    (scale_ei < 0 ? 'E' : 'I') +
    (scale_sn < 0 ? 'S' : 'N') +
    (scale_tf < 0 ? 'T' : 'F') +
    (scale_jp < 0 ? 'J' : 'P');

  const [typeRows] = await pool.query('SELECT id FROM personality_types WHERE code = ?', [calculated_type]);
  
  if (typeRows.length === 1) {
    return typeRows[0].id;
  }
  
  return null;
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get all personality types
app.get('/api/personality-types', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM personality_types ORDER BY code');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.*,
        pt.code as personality_code,
        pt.name as personality_name,
        CONCAT(
          IF(c.scale_ei < 0, 'E', 'I'),
          IF(c.scale_sn < 0, 'S', 'N'),
          IF(c.scale_tf < 0, 'T', 'F'),
          IF(c.scale_jp < 0, 'J', 'P')
        ) as calculated_type
      FROM contacts c 
      LEFT JOIN personality_types pt ON c.personality_type_id = pt.id
      ORDER BY c.name, c.surname
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single contact
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.*,
        pt.code as personality_code,
        pt.name as personality_name,
        CONCAT(
          IF(c.scale_ei < 0, 'E', 'I'),
          IF(c.scale_sn < 0, 'S', 'N'),
          IF(c.scale_tf < 0, 'T', 'F'),
          IF(c.scale_jp < 0, 'J', 'P')
        ) as calculated_type
      FROM contacts c 
      LEFT JOIN personality_types pt ON c.personality_type_id = pt.id
      WHERE c.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new contact
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, surname, relationship, notes, scale_ei, scale_sn, scale_tf, scale_jp } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Calcola personality_type_id dalle scale
    const personality_type_id = await getPersonalityTypeId(
      scale_ei || 0,
      scale_sn || 0,
      scale_tf || 0,
      scale_jp || 0
    );

    if (!personality_type_id) {
      return res.status(400).json({ error: 'Invalid personality type calculated' });
    }

    const [result] = await pool.query(
      'INSERT INTO contacts (name, surname, relationship, personality_type_id, notes, scale_ei, scale_sn, scale_tf, scale_jp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        surname || null,
        relationship || null,
        personality_type_id,
        notes || null,
        scale_ei || 0,
        scale_sn || 0,
        scale_tf || 0,
        scale_jp || 0
      ]
    );

    const [newContact] = await pool.query(`
      SELECT 
        c.*,
        pt.code as personality_code,
        pt.name as personality_name,
        CONCAT(
          IF(c.scale_ei < 0, 'E', 'I'),
          IF(c.scale_sn < 0, 'S', 'N'),
          IF(c.scale_tf < 0, 'T', 'F'),
          IF(c.scale_jp < 0, 'J', 'P')
        ) as calculated_type
      FROM contacts c 
      LEFT JOIN personality_types pt ON c.personality_type_id = pt.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json(newContact[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { name, surname, relationship, notes, scale_ei, scale_sn, scale_tf, scale_jp } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Calcola personality_type_id dalle scale
    const personality_type_id = await getPersonalityTypeId(
      scale_ei ?? 0,
      scale_sn ?? 0,
      scale_tf ?? 0,
      scale_jp ?? 0
    );

    if (!personality_type_id) {
      return res.status(400).json({ error: 'Invalid personality type calculated' });
    }

    await pool.query(
      'UPDATE contacts SET name = ?, surname = ?, relationship = ?, personality_type_id = ?, notes = ?, scale_ei = ?, scale_sn = ?, scale_tf = ?, scale_jp = ? WHERE id = ?',
      [
        name,
        surname || null,
        relationship || null,
        personality_type_id,
        notes || null,
        scale_ei ?? 0,
        scale_sn ?? 0,
        scale_tf ?? 0,
        scale_jp ?? 0,
        req.params.id
      ]
    );

    const [updatedContact] = await pool.query(`
      SELECT 
        c.*,
        pt.code as personality_code,
        pt.name as personality_name,
        CONCAT(
          IF(c.scale_ei < 0, 'E', 'I'),
          IF(c.scale_sn < 0, 'S', 'N'),
          IF(c.scale_tf < 0, 'T', 'F'),
          IF(c.scale_jp < 0, 'J', 'P')
        ) as calculated_type
      FROM contacts c 
      LEFT JOIN personality_types pt ON c.personality_type_id = pt.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (updatedContact.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(updatedContact[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM contacts');
    
    // Statistiche per relazione con dettaglio dei tipi
    const [byRelationship] = await pool.query(`
      SELECT 
        COALESCE(c.relationship, 'Non specificato') as relationship,
        COUNT(c.id) as total_count,
        COUNT(DISTINCT pt.code) as unique_types,
        GROUP_CONCAT(DISTINCT pt.code ORDER BY pt.code SEPARATOR ', ') as types
      FROM contacts c
      LEFT JOIN personality_types pt ON c.personality_type_id = pt.id
      GROUP BY c.relationship
      ORDER BY total_count DESC
    `);
    
    res.json({
      total: total[0].count,
      byRelationship: byRelationship
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});