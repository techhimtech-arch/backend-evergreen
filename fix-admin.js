const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fix() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/backend-evergreen';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected');
    
    const db = client.db();
    
    // Also find the superadmin role and link it if needed
    const superadminRole = await db.collection('roles').findOne({ name: 'superadmin' });
    
    const result = await db.collection('users').updateOne(
      { email: 'admin@evergreen.com' },
      { 
        $set: { 
          userType: 'SUPER_ADMIN', 
          status: 'ACTIVE',
          roleId: superadminRole ? superadminRole._id : null
        } 
      }
    );
    console.log('Updated admin:', result.modifiedCount);
  } finally {
    await client.close();
  }
}
fix();

fix();