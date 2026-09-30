require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('./models/course.model');

async function makeAllCoursesFree() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Course.updateMany({}, { $set: { price: 0 } });
    console.log('Courses update result:', result);

    const allCourses = await Course.find({}, 'title price category level');
    console.log('All courses now in database:');
    allCourses.forEach((c) => {
      console.log(`- ${c.title}: Price = $${c.price} (Free)`);
    });

    await mongoose.disconnect();
    console.log('Finished successfully.');
  } catch (error) {
    console.error('Error updating courses:', error);
    process.exit(1);
  }
}

makeAllCoursesFree();
