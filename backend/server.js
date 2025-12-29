// backend/server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'personality_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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
      SELECT c.*, pt.code as personality_code, pt.name as personality_name 
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
      SELECT c.*, pt.code as personality_code, pt.name as personality_name 
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
    const { name, surname, relationship, personality_type_id, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO contacts (name, surname, relationship, personality_type_id, notes) VALUES (?, ?, ?, ?, ?)',
      [name, surname, relationship, personality_type_id || null, notes]
    );

    const [newContact] = await pool.query(`
      SELECT c.*, pt.code as personality_code, pt.name as personality_name 
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
    const { name, surname, relationship, personality_type_id, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    await pool.query(
      'UPDATE contacts SET name = ?, surname = ?, relationship = ?, personality_type_id = ?, notes = ? WHERE id = ?',
      [name, surname, relationship, personality_type_id || null, notes, req.params.id]
    );

    const [updatedContact] = await pool.query(`
      SELECT c.*, pt.code as personality_code, pt.name as personality_name 
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
    const [byType] = await pool.query(`
      SELECT pt.code, pt.name, COUNT(c.id) as count 
      FROM personality_types pt 
      LEFT JOIN contacts c ON pt.id = c.personality_type_id 
      GROUP BY pt.id, pt.code, pt.name
      ORDER BY count DESC
    `);
    
    res.json({
      total: total[0].count,
      byType: byType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});