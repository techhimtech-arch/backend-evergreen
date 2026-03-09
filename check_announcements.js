/**
 * Check existing announcements in database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Announcement = require('./src/models/Announcement');

async function checkAnnouncements() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check all announcements
    console.log('\n📋 Checking all announcements...');
    const allAnnouncements = await Announcement.find({});
    console.log(`Total announcements: ${allAnnouncements.length}`);

    if (allAnnouncements.length > 0) {
      console.log('\n📝 Announcement details:');
      allAnnouncements.forEach((announcement, index) => {
        console.log(`${index + 1}. "${announcement.title}"`);
        console.log(`   Status: ${announcement.status}`);
        console.log(`   Type: ${announcement.type}`);
        console.log(`   Priority: ${announcement.priority}`);
        console.log(`   Created: ${announcement.createdAt}`);
        console.log(`   Author: ${announcement.authorName}`);
        console.log('');
      });
    } else {
      console.log('❌ No announcements found in database');
    }

    // Check by status
    console.log('\n📊 Announcements by status:');
    const statuses = ['draft', 'published', 'scheduled', 'expired'];
    for (const status of statuses) {
      const count = await Announcement.countDocuments({ status });
      console.log(`${status}: ${count}`);
    }

    // Check published announcements specifically
    console.log('\n✅ Published announcements:');
    const publishedAnnouncements = await Announcement.find({ status: 'published' });
    console.log(`Published count: ${publishedAnnouncements.length}`);
    
    if (publishedAnnouncements.length > 0) {
      publishedAnnouncements.forEach((announcement, index) => {
        console.log(`${index + 1}. "${announcement.title}" (${announcement.priority})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAnnouncements();
