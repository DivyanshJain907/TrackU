const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !process.env[key]) {
      process.env[key] = valueParts.join('=');
    }
  });
}

async function dropUsernameIndex() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    console.log('Connecting to:', mongoUri.substring(0, 50) + '...');
    
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('Getting indexes...');
    // Get all indexes
    const indexes = await usersCollection.listIndexes().toArray();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Try to drop the unique index on username
    try {
      await usersCollection.dropIndex('username_1');
      console.log('✓ Successfully dropped username unique index (username_1)');
    } catch (err) {
      if (err.code === 27 || err.message.includes('index not found')) {
        console.log('✓ Index username_1 does not exist');
      } else {
        console.log('Error dropping username_1:', err.message);
      }
    }
    
    // Also try dropping email unique index to be safe
    try {
      await usersCollection.dropIndex('email_1');
      console.log('✓ Dropped email unique index (keeping this to ensure email uniqueness)');
      // Recreate email unique index
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('✓ Recreated email unique index');
    } catch (err) {
      console.log('Email index handling:', err.message);
    }
    
    console.log('✓ Database cleanup complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

dropUsernameIndex();
