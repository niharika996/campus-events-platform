const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// REGISTER FOR EVENT
router.post('/', authenticate, async (req, res) => {
    try {
        const { event_id } = req.body;
        const user_id = req.user.id;
        
        // Check if event exists
        const eventCheck = await pool.query(
            'SELECT id, max_capacity FROM events WHERE id = $1',
            [event_id]
        );
        
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Check if already registered
        const existing = await pool.query(
            'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',
            [user_id, event_id]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'You are already registered for this event' });
        }
        
        // Check capacity
        const count = await pool.query(
            'SELECT COUNT(*) FROM registrations WHERE event_id = $1',
            [event_id]
        );
        
        const registeredCount = parseInt(count.rows[0].count);
        const maxCapacity = eventCheck.rows[0].max_capacity;
        
        if (maxCapacity && registeredCount >= maxCapacity) {
            return res.status(400).json({ error: 'Event is full' });
        }
        
        // Register user
        const result = await pool.query(
            'INSERT INTO registrations (user_id, event_id) VALUES ($1, $2) RETURNING *',
            [user_id, event_id]
        );
        
        res.status(201).json({ 
            message: 'Successfully registered for event',
            registration: result.rows[0]
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// GET MY EVENTS
router.get('/my-events', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, 
                    c.name as club_name,
                    r.registered_at,
                    r.id as registration_id
             FROM registrations r
             JOIN events e ON r.event_id = e.id
             LEFT JOIN clubs c ON e.club_id = c.id
             WHERE r.user_id = $1
             ORDER BY e.date ASC`,
            [req.user.id]
        );
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching my events:', error);
        res.status(500).json({ error: 'Failed to fetch your events' });
    }
});

// CANCEL REGISTRATION
router.delete('/:event_id', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM registrations WHERE user_id = $1 AND event_id = $2 RETURNING id',
            [req.user.id, req.params.event_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        
        res.json({ message: 'Registration cancelled successfully' });
        
    } catch (error) {
        console.error('Error cancelling registration:', error);
        res.status(500).json({ error: 'Failed to cancel registration' });
    }
});

// CHECK IF USER IS REGISTERED FOR EVENT
router.get('/check/:event_id', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',
            [req.user.id, req.params.event_id]
        );
        
        res.json({ registered: result.rows.length > 0 });
        
    } catch (error) {
        console.error('Error checking registration:', error);
        res.status(500).json({ error: 'Failed to check registration' });
    }
});

module.exports = router;