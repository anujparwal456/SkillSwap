const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    const mongoOptions = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false
    };
    
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test basic operation
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Database collections:', collections.map(c => c.name));
    
    // Test ping
    await db.admin().ping();
    console.log('🏓 Database ping successful');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.message.includes('IP')) {
      console.log('\n🔒 IP Whitelisting Issue:');
      console.log('1. Go to MongoDB Atlas dashboard');
      console.log('2. Navigate to Security → Network Access');
      console.log('3. Add your current IP address or use 0.0.0.0/0 for all IPs (development only)');
      console.log('4. Make sure the IP whitelist is properly configured');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 Authentication Issue:');
      console.log('1. Check your MongoDB username and password');
      console.log('2. Ensure the password is URL-encoded properly');
      console.log('3. Verify the database user has proper permissions');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🌐 DNS/Network Issue:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the cluster URL is correct');
      console.log('3. Try connecting from a different network');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testConnection();
