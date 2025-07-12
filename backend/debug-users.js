const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');
        
        // Get the User model
        const User = require('./models/User');
        
        // Count total users
        const userCount = await User.countDocuments();
        console.log(`Total users in database: ${userCount}`);
        
        // Get all users (excluding password)
        const users = await User.find({}, {
            firstName: 1,
            lastName: 1,
            email: 1,
            role: 1,
            isActive: 1,
            createdAt: 1,
            _id: 1
        });
        
        console.log('\nUsers in database:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
            console.log(`   Role: ${user.role}, Active: ${user.isActive}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log(`   ID: ${user._id}`);
            console.log('---');
        });
        
        // Check for admin users specifically
        const adminUsers = await User.find({ role: 'admin' });
        console.log(`\nAdmin users found: ${adminUsers.length}`);
        
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
