require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('./models/course.model');

async function syncCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Remove any previously added combined courses
    await Course.deleteMany({
      title: { $in: ['Modern HTML5 & Responsive CSS3', 'Applied AI & Machine Learning'] }
    });

    const newCourses = [
      {
        title: 'HTML5 Foundations',
        description: 'Learn modern semantic HTML5, accessible markup, document structure, forms, tables, media elements, and SEO best practices.',
        instructor: 'Elena Vance',
        price: 0,
        thumbnail: '',
        category: 'Frontend',
        level: 'Beginner',
        duration: '4 weeks',
      },
      {
        title: 'CSS3 & Modern Layouts',
        description: 'Master modern styling with CSS3 Flexbox, Grid, custom properties, animations, transitions, and responsive mobile-first design.',
        instructor: 'Sarah Jenkins',
        price: 0,
        thumbnail: '',
        category: 'Frontend',
        level: 'Beginner',
        duration: '5 weeks',
      },
      {
        title: 'Artificial Intelligence & Machine Learning',
        description: 'Explore core machine learning concepts, neural networks, supervised and unsupervised algorithms, and generative AI using Python.',
        instructor: 'Dr. Marcus Chen',
        price: 0,
        thumbnail: '',
        category: 'AI & ML',
        level: 'Intermediate',
        duration: '10 weeks',
      },
    ];

    for (const c of newCourses) {
      const existing = await Course.findOne({ title: c.title });
      if (!existing) {
        await Course.create(c);
        console.log(`Created course: ${c.title}`);
      } else {
        await Course.updateOne({ _id: existing._id }, { $set: { ...c } });
        console.log(`Updated course: ${c.title}`);
      }
    }

    const all = await Course.find({}, 'title category price thumbnail');
    console.log('Current Courses in Database:');
    all.forEach(course => {
      console.log(`- [${course.category}] ${course.title} | Price: $${course.price} | Thumbnail: "${course.thumbnail}"`);
    });

    await mongoose.disconnect();
    console.log('Sync complete.');
  } catch (error) {
    console.error('Error syncing courses:', error);
    process.exit(1);
  }
}

syncCourses();
