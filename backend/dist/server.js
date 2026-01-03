"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/server.ts
const express_1 = __importDefault(require("express"));
const promise_1 = require("mysql2/promise");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../.env')
});
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Database connection pool
const pool = (0, promise_1.createPool)({
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'personality_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// Utility function to calculate personality_type_id from scales
const getPersonalityTypeId = async (scale_ei, scale_sn, scale_tf, scale_jp) => {
    const calculated_type = (scale_ei < 0 ? 'E' : 'I') +
        (scale_sn < 0 ? 'S' : 'N') +
        (scale_tf < 0 ? 'T' : 'F') +
        (scale_jp < 0 ? 'J' : 'P');
    const [rows] = await pool.query('SELECT id FROM personality_types WHERE code = ?', [calculated_type]);
    return rows.length === 1 ? rows[0].id : null;
};
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});
// Get all personality types
app.get('/api/personality-types', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM personality_types ORDER BY code');
        res.json(rows);
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
});
// Get all contacts
app.get('/api/contacts', async (_req, res) => {
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
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
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
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
});
// Create new contact
app.post('/api/contacts', async (req, res) => {
    try {
        const { name, surname, relationship, notes, scale_ei, scale_sn, scale_tf, scale_jp } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const personality_type_id = await getPersonalityTypeId(Number(scale_ei) || 0, Number(scale_sn) || 0, Number(scale_tf) || 0, Number(scale_jp) || 0);
        if (!personality_type_id) {
            return res.status(400).json({ error: 'Invalid personality type calculated' });
        }
        const [result] = await pool.query(`INSERT INTO contacts 
       (name, surname, relationship, personality_type_id, notes, scale_ei, scale_sn, scale_tf, scale_jp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            name,
            surname ?? null,
            relationship ?? null,
            personality_type_id,
            notes ?? null,
            Number(scale_ei) || 0,
            Number(scale_sn) || 0,
            Number(scale_tf) || 0,
            Number(scale_jp) || 0
        ]);
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
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
});

// Aggiungi questa API dopo le altre API esistenti
app.get('/api/contacts/relationships', async (req, res) => {
    try {
        const [relationships] = await pool.execute(`
      SELECT 
        c1.id as contact_1_id,
        CONCAT(c1.name, ' ', COALESCE(c1.surname, '')) as contact_1_name,
        pt1.code as contact_1_type,
        c2.id as contact_2_id,
        CONCAT(c2.name, ' ', COALESCE(c2.surname, '')) as contact_2_name,
        pt2.code as contact_2_type,
        r.relationship_term,
        r.emoji,
        r.color_code,
        r.compatibility_level,
        rt.description as relationship_description,
        CASE 
          WHEN r.compatibility_level >= 4 THEN 'Alta compatibilità'
          WHEN r.compatibility_level = 3 THEN 'Compatibilità media'
          WHEN r.compatibility_level = 2 THEN 'Compatibilità bassa'
          ELSE 'Compatibilità molto bassa'
        END as compatibility_text
      FROM contacts c1
      JOIN contacts c2 ON c1.id < c2.id
      JOIN personality_types pt1 ON c1.personality_type_id = pt1.id
      JOIN personality_types pt2 ON c2.personality_type_id = pt2.id
      JOIN mbti_relationships r ON pt1.code = r.type_a AND pt2.code = r.type_b
      JOIN mbti_relationship_types rt ON r.relationship_term = rt.term
      ORDER BY c1.id, r.compatibility_level DESC
    `);
        const [contacts] = await pool.execute('SELECT id, name, surname, personality_type_id FROM contacts ORDER BY name');
        const [personalityTypes] = await pool.execute('SELECT id, code FROM personality_types');
        const typeMap = {};
        personalityTypes.forEach((pt) => {
            typeMap[pt.id] = pt.code;
        });
        const matrixData = {
            contacts: contacts.map((contact) => ({
                id: contact.id,
                name: `${contact.name} ${contact.surname || ''}`.trim(),
                type: typeMap[contact.personality_type_id] || 'N/A'
            })),
            relationships: relationships.map((rel) => ({
                contact1: {
                    id: rel.contact_1_id,
                    name: rel.contact_1_name,
                    type: rel.contact_1_type
                },
                contact2: {
                    id: rel.contact_2_id,
                    name: rel.contact_2_name,
                    type: rel.contact_2_type
                },
                relationship: rel.relationship_term,
                emoji: rel.emoji,
                colorCode: rel.color_code,
                compatibility: rel.compatibility_level,
                description: rel.relationship_description,
                compatibilityText: rel.compatibility_text
            })),
            compatibilityLevels: [
                { level: 5, label: 'Alta', color: 'green' },
                { level: 4, label: 'Media-Alta', color: 'blue' },
                { level: 3, label: 'Media', color: 'yellow' },
                { level: 2, label: 'Bassa', color: 'orange' },
                { level: 1, label: 'Molto Bassa', color: 'red' }
            ]
        };
        res.json(matrixData);
    }
    catch (error) {
        console.error('Error fetching contact relationships:', error);
        res.status(500).json({ error: 'Errore nel recupero delle relazioni' });
    }
});
// API per popolare le tabelle delle relazioni (utile per sviluppo)
app.post('/api/admin/populate-relationships', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Operazione non permessa in produzione' });
    }
    try {
        const conn = await pool.getConnection();
        // 1. Popola la tabella mbti_relationship_types
        await conn.execute(`
      INSERT IGNORE INTO mbti_relationship_types (term, color_code, emoji, description, compatibility_level) VALUES
      ('Gemello', 'V', '🟢', 'Stesso tipo MBTI. Massima comprensione immediata.', 5),
      ('Fratello', 'V', '🟢', 'Gruppo cognitivo comune. Forte affinità naturale.', 5),
      ('Alleato', 'V', '🟢', 'Funzioni cognitive che si supportano. Buon equilibrio.', 4),
      ('Simili', 'B', '🔵', 'Condividono 3 lettere su 4. Visione affine.', 4),
      ('Complementari', 'B', '🔵', 'Funzioni opposte che si bilanciano idealmente.', 4),
      ('Polo opposto', 'R', '🔴', 'Differiscono su 3 lettere.', 2),
      ('Opposti', 'N', '⚫', 'Opposti su tutte 4 lettere. Massimo potenziale.', 1),
      ('Logici', 'B', '🔵', 'Si incontrano sulla funzione Thinking.', 3),
      ('Empatici', 'B', '🔵', 'Si incontrano sulla funzione Feeling.', 3),
      ('Strutturati', 'G', '🟡', 'Atteggiamento simile verso pianificazione (J).', 2)
    `);
        // 2. Popola la matrice mbti_relationships con le relazioni più comuni
        // (Inserisco solo alcuni esempi per non rendere il codice troppo lungo)
        await conn.execute(`
      INSERT IGNORE INTO mbti_relationships 
        (type_a, type_b, relationship_term, color_code, emoji, compatibility_level, notes) 
      VALUES
        ('INTJ', 'INTJ', 'Gemello', 'V', '🟢', 5, 'Stesso tipo'),
        ('INTJ', 'INTP', 'Logici', 'B', '🔵', 3, 'Condividono T'),
        ('INTJ', 'INFJ', 'Fratello', 'V', '🟢', 4, 'Stesse funzioni'),
        ('INTJ', 'ENTP', 'Cognitivi', 'G', '🟡', 3, 'Complementari'),
        ('INFJ', 'ENFP', 'Complementari', 'B', '🔵', 4, 'Opposti che si attraggono'),
        ('ISTJ', 'ENFP', 'Opposti', 'N', '⚫', 1, 'Tutte lettere opposte')
    `);
        conn.release();
        res.json({
            message: 'Tabelle delle relazioni popolate',
            note: 'Per la matrice completa 16x16, esegui lo script SQL separato'
        });
    }
    catch (error) {
        console.error('Error populating relationships:', error);
        res.status(500).json({ error: 'Errore nel popolamento delle relazioni' });
    }
});
// API per verificare lo stato delle tabelle delle relazioni
app.get('/api/admin/relationships-status', async (req, res) => {
    try {
        const [typesCount] = await pool.execute('SELECT COUNT(*) as count FROM mbti_relationship_types');
        const [relationshipsCount] = await pool.execute('SELECT COUNT(*) as count FROM mbti_relationships');
        res.json({
            mbti_relationship_types: typesCount[0].count,
            mbti_relationships: relationshipsCount[0].count,
            status: typesCount[0].count > 0 && relationshipsCount[0].count > 0
                ? 'Tabelle popolate'
                : 'Tabelle vuote o non esistenti'
        });
    }
    catch (error) {
        console.error('Error checking relationships status:', error);
        res.status(500).json({ error: 'Errore nel controllo dello stato' });
    }
});

// Update contact
app.put('/api/contacts/:id', async (req, res) => {
    try {
        const { name, surname, relationship, notes, scale_ei, scale_sn, scale_tf, scale_jp } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const personality_type_id = await getPersonalityTypeId(Number(scale_ei) ?? 0, Number(scale_sn) ?? 0, Number(scale_tf) ?? 0, Number(scale_jp) ?? 0);
        if (!personality_type_id) {
            return res.status(400).json({ error: 'Invalid personality type calculated' });
        }
        await pool.query(`UPDATE contacts SET
        name = ?, surname = ?, relationship = ?, personality_type_id = ?, notes = ?,
        scale_ei = ?, scale_sn = ?, scale_tf = ?, scale_jp = ?
       WHERE id = ?`, [
            name,
            surname ?? null,
            relationship ?? null,
            personality_type_id,
            notes ?? null,
            Number(scale_ei) ?? 0,
            Number(scale_sn) ?? 0,
            Number(scale_tf) ?? 0,
            Number(scale_jp) ?? 0,
            req.params.id
        ]);
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
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
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
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
});
// Get statistics
app.get('/api/stats', async (_req, res) => {
    try {
        const [total] = await pool.query('SELECT COUNT(*) as count FROM contacts');
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
            byRelationship
        });
    }
    catch (error) {
        const err = error;
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
