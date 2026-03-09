/**
 * Quick database check for announcements
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Announcement = require('./src/models/Announcement');

async function quickCheck() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Count all announcements
    const totalCount = await Announcement.countDocuments();
    console.log(`\n📊 Total announcements: ${totalCount}`);

    // Get latest 5 announcements
    const latest = await Announcement.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status type priority createdAt authorName');
    
    if (latest.length > 0) {
      console.log('\n📝 Latest announcements:');
      latest.forEach((ann, i) => {
        console.log(`${i+1}. "${ann.title}"`);
        console.log(`   Status: ${ann.status} | Type: ${ann.type} | Priority: ${ann.priority}`);
        console.log(`   Author: ${ann.authorName} | Created: ${ann.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No announcements found');
    }

    // Check by status
    const statusCounts = await Announcement.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 By status:');
    statusCounts.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

quickCheck();
