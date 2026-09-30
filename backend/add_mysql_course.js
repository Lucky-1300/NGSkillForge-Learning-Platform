require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('./models/course.model');

const courseOrders = [
  { title: 'HTML5 Foundations', order: 1 },
  { title: 'CSS3 & Modern Layouts', order: 2 },
  { title: 'JavaScript Foundations', order: 3 },
  { title: 'React Interface Workshop', order: 4 },
  { title: 'Node.js API Engineering', order: 5 },
  { title: 'Express.js Framework & REST APIs', order: 6 },
  { title: 'Artificial Intelligence & Machine Learning', order: 7 },
  { title: 'MongoDB Data Modeling', order: 8 },
  {
    title: 'MySQL Database & SQL Mastery',
    description: 'Learn relational database architecture, SQL queries, table joins, schema design, normalization, indexing, and transactional ACID principles.',
    instructor: 'Chinedu Eze',
    price: 0,
    thumbnail: '',
    category: 'Database',
    level: 'Beginner',
    duration: '6 weeks',
    order: 9,
  },
  { title: 'Git and Collaborative Development', order: 10 },
  { title: 'Full-Stack Project Lab', order: 11 },
  { title: 'Data Structures & Algorithms (DSA)', order: 12 },
];

async function syncMysqlCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const item of courseOrders) {
      const existing = await Course.findOne({ title: item.title });
      if (!existing && item.description) {
        await Course.create(item);
        console.log(`Created course: [${item.order}] ${item.title}`);
      } else if (existing) {
        await Course.updateOne({ _id: existing._id }, { $set: { order: item.order, price: 0 } });
        console.log(`Updated course order: [${item.order}] ${item.title}`);
      }
    }

    const all = await Course.find({}).sort({ order: 1 });
    console.log('\n--- UPDATED COURSE SEQUENCE IN MONGODB ---');
    all.forEach((c) => {
      console.log(`${c.order}. ${c.title} (${c.category}) - Price: $${c.price}`);
    });

    await mongoose.disconnect();
    console.log('Sync finished.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

syncMysqlCourse();
