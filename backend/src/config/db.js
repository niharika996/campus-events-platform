const { Pool } = require('pg');

// Decode the password if it's URL encoded
const decodePassword = (url) => {
    try {
        // If password contains %, decode it
        if (url.includes('%40')) {
            return url;
        }
        return url;
    } catch (error) {
        console.error('Error decoding password:', error);
        return url;
    }
};

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    },
    // Add connection timeout
    connectionTimeoutMillis: 10000,
    // Add idle timeout
    idleTimeoutMillis: 30000,
});

// Test database connection with better error handling
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        console.error('Please check your DATABASE_URL in .env file');
        console.error('Make sure your password is correctly encoded');
        return;
    }
    console.log('Connected to database successfully');
    release();
});

module.exports = pool;