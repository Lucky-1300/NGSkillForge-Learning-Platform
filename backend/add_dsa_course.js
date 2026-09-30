require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('./models/course.model');

async function addDsaCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const dsaCourse = {
      title: 'Data Structures & Algorithms (DSA)',
      description: 'Master fundamental data structures, arrays, linked lists, trees, graphs, dynamic programming, and algorithmic problem-solving for technical interviews.',
      instructor: 'Alex Chen',
      price: 0,
      thumbnail: '',
      category: 'Computer Science',
      level: 'Intermediate',
      duration: '10 weeks',
      order: 11,
    };

    const existing = await Course.findOne({ title: dsaCourse.title });
    if (!existing) {
      const created = await Course.create(dsaCourse);
      console.log('DSA Course created in MongoDB Atlas:', created.title);
    } else {
      await Course.updateOne({ _id: existing._id }, { $set: dsaCourse });
      console.log('DSA Course updated in MongoDB Atlas:', existing.title);
    }

    const allCourses = await Course.find({}).sort({ order: 1 });
    console.log('\n--- ALL COURSES IN DATABASE ---');
    allCourses.forEach(c => {
      console.log(`${c.order}. ${c.title} [${c.category}] - Price: $${c.price}`);
    });

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error adding DSA course:', err);
    process.exit(1);
  }
}

addDsaCourse();
