const express = require('express');
const pool = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET DASHBOARD STATS - Admin only
router.get('/', authenticate, isAdmin, async (req, res) => {
    try {
        console.log('📊 Fetching dashboard stats...');
        
        // Get all stats
        const totalEvents = await pool.query('SELECT COUNT(*) FROM events');
        const totalRegistrations = await pool.query('SELECT COUNT(*) FROM registrations');
        const upcomingEvents = await pool.query("SELECT COUNT(*) FROM events WHERE date >= NOW()");
        const totalClubs = await pool.query('SELECT COUNT(*) FROM clubs');
        
        // Get popular events
        const popularEvents = await pool.query(
            `SELECT e.title, COUNT(r.id) as registrations
             FROM events e
             LEFT JOIN registrations r ON e.id = r.event_id
             WHERE e.date >= NOW()
             GROUP BY e.id
             ORDER BY registrations DESC
             LIMIT 5`
        );
        
        // Get category stats
        const categoryStats = await pool.query(
            `SELECT category, COUNT(*) as count
             FROM events
             GROUP BY category
             ORDER BY count DESC`
        );
        
        res.json({
            totalEvents: parseInt(totalEvents.rows[0].count),
            totalRegistrations: parseInt(totalRegistrations.rows[0].count),
            upcomingEvents: parseInt(upcomingEvents.rows[0].count),
            totalClubs: parseInt(totalClubs.rows[0].count),
            popularEvents: popularEvents.rows,
            categoryStats: categoryStats.rows
        });
        
    } catch (error) {
        console.error('❌ Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data: ' + error.message });
    }
});

module.exports = router;