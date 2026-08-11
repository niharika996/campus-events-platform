const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET ALL CLUBS
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clubs ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
});

// CREATE CLUB - Admin only
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Club name is required' });
        }
        
        const result = await pool.query(
            'INSERT INTO clubs (name, description) VALUES ($1, $2) RETURNING *',
            [name, description || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating club:', error);
        res.status(500).json({ error: 'Failed to create club' });
    }
});

module.exports = router;