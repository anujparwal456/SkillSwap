const mongoose = require('mongoose');
require('dotenv').config();

async function debugConnection() {
  try {
    console.log('🔍 Debugging MongoDB connection...\n');
    
    const uri = process.env.MONGODB_URI;
    console.log('📝 Connection URI structure:');
    console.log('Full URI:', uri);
    
    // Parse the URI to show components
    const url = new URL(uri);
    console.log('Protocol:', url.protocol);
    console.log('Username:', url.username);
    console.log('Password:', url.password ? '***HIDDEN***' : 'NOT SET');
    console.log('Host:', url.hostname);
    console.log('Database:', url.pathname.slice(1).split('?')[0]);
    console.log('Search params:', url.search);
    console.log('');
    
    // Test connection with minimal options
    console.log('🔄 Attempting connection...');
    const mongoOptions = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };
    
    await mongoose.connect(uri, mongoOptions);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const admin = db.admin();
    
    console.log('🏓 Testing ping...');
    await admin.ping();
    console.log('✅ Ping successful');
    
    console.log('📊 Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));
    
    console.log('👤 Testing database user privileges...');
    try {
      await db.collection('test').findOne({});
      console.log('✅ Read access confirmed');
    } catch (error) {
      console.log('❌ Read access failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error codeName:', error.codeName);
    
    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.log('\n🔐 AUTHENTICATION ISSUE DETECTED:');
      console.log('1. ❌ Username or password is incorrect');
      console.log('2. ❌ User doesn\'t exist in the database');
      console.log('3. ❌ User doesn\'t have proper permissions');
      console.log('4. ❌ Password contains special characters that need URL encoding');
      console.log('\n🛠️  SOLUTIONS:');
      console.log('A. Go to MongoDB Atlas → Database Access');
      console.log('B. Verify the username exists');
      console.log('C. Reset the password and update .env file');
      console.log('D. Ensure user has readWrite permissions to the database');
      console.log('E. If password has special chars, URL encode them:');
      console.log('   @ → %40');
      console.log('   # → %23');
      console.log('   $ → %24');
      console.log('   % → %25');
      console.log('   & → %26');
    }
    
    if (error.message.includes('IP')) {
      console.log('\n🔒 IP WHITELISTING ISSUE:');
      console.log('1. Go to MongoDB Atlas → Security → Network Access');
      console.log('2. Add your current IP or use 0.0.0.0/0 for all IPs');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from MongoDB');
    }
    process.exit(0);
  }
}

debugConnection();
