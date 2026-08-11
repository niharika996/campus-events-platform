const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET ALL EVENTS - Public (with filters)
router.get('/', async (req, res) => {
    try {
        const { category, date, search } = req.query;
        let query = `
            SELECT e.*, 
                   c.name as club_name,
                   u.name as organizer_name,
                   (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as registered_count
            FROM events e
            LEFT JOIN clubs c ON e.club_id = c.id
            LEFT JOIN users u ON e.created_by = u.id
            WHERE e.date >= NOW()
        `;
        const params = [];
        let paramCount = 0;
        
        if (category) {
            paramCount++;
            params.push(category);
            query += ` AND e.category = $${paramCount}`;
        }
        
        if (date) {
            paramCount++;
            params.push(date);
            query += ` AND DATE(e.date) = $${paramCount}`;
        }
        
        if (search) {
            paramCount++;
            params.push(`%${search}%`);
            query += ` AND (e.title ILIKE $${paramCount} OR e.description ILIKE $${paramCount})`;
        }
        
        query += ' ORDER BY e.date ASC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET SINGLE EVENT
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, 
                    c.name as club_name,
                    u.name as organizer_name,
                    (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as registered_count
             FROM events e
             LEFT JOIN clubs c ON e.club_id = c.id
             LEFT JOIN users u ON e.created_by = u.id
             WHERE e.id = $1`,
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// CREATE EVENT - Admin only
// CREATE EVENT - Admin only
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const { title, description, category, date, venue, max_capacity, club_id } = req.body;
        
        console.log('📝 Creating event with data:', req.body);
        
        // Validate required fields
        if (!title || !category || !date) {
            return res.status(400).json({ error: 'Title, category, and date are required' });
        }
        
        // Handle empty values - convert empty strings to null
        const cleanClubId = club_id && club_id !== '' && club_id !== 'null' ? parseInt(club_id) : null;
        const cleanVenue = venue && venue !== '' ? venue : null;
        const cleanDescription = description && description !== '' ? description : null;
        const cleanMaxCapacity = max_capacity && max_capacity !== '' ? parseInt(max_capacity) : 100;
        
        console.log('📝 Cleaned data:', {
            title,
            category,
            date,
            venue: cleanVenue,
            club_id: cleanClubId,
            max_capacity: cleanMaxCapacity
        });
        
        const result = await pool.query(
            `INSERT INTO events (title, description, category, date, venue, max_capacity, club_id, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                title, 
                cleanDescription, 
                category, 
                date, 
                cleanVenue, 
                cleanMaxCapacity, 
                cleanClubId, 
                req.user.id
            ]
        );
        
        console.log('✅ Event created successfully:', result.rows[0]);
        res.status(201).json(result.rows[0]);
        
    } catch (error) {
        console.error('❌ Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event: ' + error.message });
    }
});

// UPDATE EVENT - Admin only
// UPDATE EVENT - Admin only
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { title, description, category, date, venue, max_capacity, club_id } = req.body;
        
        console.log('📝 Updating event with data:', req.body);
        
        // Handle empty values - convert empty strings to null
        const cleanClubId = club_id && club_id !== '' && club_id !== 'null' ? parseInt(club_id) : null;
        const cleanVenue = venue && venue !== '' ? venue : null;
        const cleanDescription = description && description !== '' ? description : null;
        const cleanMaxCapacity = max_capacity && max_capacity !== '' ? parseInt(max_capacity) : null;
        
        const result = await pool.query(
            `UPDATE events 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 category = COALESCE($3, category),
                 date = COALESCE($4, date),
                 venue = COALESCE($5, venue),
                 max_capacity = COALESCE($6, max_capacity),
                 club_id = $7
             WHERE id = $8
             RETURNING *`,
            [
                title || null, 
                cleanDescription, 
                category || null, 
                date || null, 
                cleanVenue, 
                cleanMaxCapacity, 
                cleanClubId, 
                req.params.id
            ]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        console.log('✅ Event updated successfully:', result.rows[0]);
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('❌ Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event: ' + error.message });
    }
});

// DELETE EVENT - Admin only
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        // Delete registrations first (cascade should handle this, but let's be safe)
        await pool.query('DELETE FROM registrations WHERE event_id = $1', [req.params.id]);
        
        const result = await pool.query(
            'DELETE FROM events WHERE id = $1 RETURNING id',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json({ message: 'Event deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;