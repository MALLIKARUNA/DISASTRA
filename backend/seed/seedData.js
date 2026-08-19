// ─────────────────────────────────────────────────────────────────────────────
// seed/seedData.js — Development seed data for DISASTRA
// Creates demo users for all 4 roles: CITIZEN, RESPONDER, DISPATCHER, ADMIN
//
// ⚠️  DEVELOPMENT ONLY — these credentials are for local demo/testing.
//     Do NOT use in production.
//
// Run with:  npm run seed   (from backend/)
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = [
    {
        name: 'Demo Citizen',
        email: 'citizen@disastra.dev',
        password: 'Citizen@123',
        role: 'CITIZEN',
        phone: '+91 98765 43210',
        address: '12 MG Road, Bengaluru, Karnataka',
    },
    {
        name: 'Demo Responder',
        email: 'responder@disastra.dev',
        password: 'Responder@123',
        role: 'RESPONDER',
        phone: '+91 91234 56780',
        agency: 'NDRF',
        designation: 'Field Rescue Officer',
    },
    {
        name: 'Demo Dispatcher',
        email: 'dispatcher@disastra.dev',
        password: 'Dispatcher@123',
        role: 'DISPATCHER',
        phone: '+91 90000 11111',
        department: 'State Emergency Operations Centre',
    },
    {
        name: 'Demo Admin',
        email: 'admin@disastra.dev',
        password: 'Admin@123',
        role: 'ADMIN',
        phone: '+91 90000 22222',
        department: 'DISASTRA Platform Administration',
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ Connected to MongoDB');

        // Clear existing users (dev only)
        await User.deleteMany({});
        console.log('🧹 Cleared existing users');

        // Create seed users
        const created = await User.create(seedUsers);
        console.log(`✅ Created ${created.length} demo users:`);
        console.log('');
        console.log('┌─────────────────────────────────────────────────────────────┐');
        console.log('│  DEMO CREDENTIALS (DEVELOPMENT ONLY)                        │');
        console.log('├─────────────────┬──────────────────────────┬────────────────┤');
        console.log('│ Role            │ Email                    │ Password       │');
        console.log('├─────────────────┼──────────────────────────┼────────────────┤');
        created.forEach((u) => {
            const role = u.role.padEnd(15);
            const email = u.email.padEnd(25);
            const pass = seedUsers.find((s) => s.email === u.email)?.password || '?';
            console.log(`│ ${role}│ ${email}│ ${pass.padEnd(14)}│`);
        });
        console.log('└─────────────────┴──────────────────────────┴────────────────┘');
        console.log('');
        console.log('⚠️  These are development-only credentials. Do not use in production.');

        await mongoose.disconnect();
        console.log('✅ Seed complete — MongoDB disconnected');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seed();