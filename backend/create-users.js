require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function createUsers() {
    console.log('🚀 Starting user creation...');
    
    try {
        // Test database connection
        const testResult = await pool.query('SELECT NOW()');
        console.log('✅ Database connected:', testResult.rows[0].now);
        
        // Create Admin User
        console.log('\n📝 Creating Admin User...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        // Check if admin exists
        const adminCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['admin@college.edu']
        );
        
        if (adminCheck.rows.length > 0) {
            console.log('🔄 Admin user already exists, updating password...');
            await pool.query(
                'UPDATE users SET password = $1 WHERE email = $2',
                [adminPassword, 'admin@college.edu']
            );
        } else {
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                ['Admin User', 'admin@college.edu', adminPassword, 'admin']
            );
        }
        console.log('✅ Admin user created/updated: admin@college.edu / admin123');
        
        // Create Student User
        console.log('\n📝 Creating Student User...');
        const studentPassword = await bcrypt.hash('admin123', 10);
        
        const studentCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['student@college.edu']
        );
        
        if (studentCheck.rows.length > 0) {
            console.log('🔄 Student user already exists, updating password...');
            await pool.query(
                'UPDATE users SET password = $1 WHERE email = $2',
                [studentPassword, 'student@college.edu']
            );
        } else {
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                ['Student User', 'student@college.edu', studentPassword, 'student']
            );
        }
        console.log('✅ Student user created/updated: student@college.edu / admin123');
        
        // Verify users
        console.log('\n📋 Verifying users in database...');
        const users = await pool.query('SELECT id, name, email, role FROM users');
        console.table(users.rows);
        
        console.log('\n🎉 All done! You can now login with:');
        console.log('👑 Admin: admin@college.edu / admin123');
        console.log('🎓 Student: student@college.edu / admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating users:', error);
        console.error('❌ Error details:', error.message);
        process.exit(1);
    }
}

createUsers();