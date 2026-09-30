require('dotenv').config({ path: __dirname + '/../.env' });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('../models/course.model');

const htmlData = require('./data/html_course_data');
const cssData = require('./data/css_course_data');
const reactData = require('./data/react_course_data');
const nodeData = require('./data/node_course_data');
const expressData = require('./data/express_course_data');
const aimlData = require('./data/aiml_course_data');
const mongodbData = require('./data/mongodb_course_data');
const mysqlData = require('./data/mysql_course_data');
const gitData = require('./data/git_course_data');
const fullstackData = require('./data/fullstack_course_data');
const dsaData = require('./data/dsa_course_data');

const courseDatasets = [
  htmlData,
  cssData,
  reactData,
  nodeData,
  expressData,
  aimlData,
  mongodbData,
  mysqlData,
  gitData,
  fullstackData,
  dsaData,
];

async function seedAllCourses() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas Connected ✅\n');

    let updatedCount = 0;

    for (const dataset of courseDatasets) {
      const course = await Course.findOne({
        title: { $regex: new RegExp(`^${dataset.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });

      if (!course) {
        console.warn(`⚠️ Course not found by title: "${dataset.title}". Creating new course record...`);
        await Course.create({
          title: dataset.title,
          description: dataset.description || `Comprehensive training in ${dataset.title}`,
          instructor: 'NGSkillForge Instructor Team',
          price: 0,
          category: 'Software Engineering',
          level: 'Beginner',
          duration: '6 weeks',
          modules: dataset.modules,
        });
        updatedCount++;
      } else {
        // Update modules and lessons
        course.modules = dataset.modules;
        await course.save();

        const totalLessons = dataset.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
        const totalQuestions = dataset.modules.reduce(
          (acc, m) => acc + (m.questions?.length || 0) + (m.lessons?.reduce((lacc, l) => lacc + (l.questions?.length || 0), 0) || 0),
          0
        );
        const totalTasks = dataset.modules.reduce(
          (acc, m) => acc + (m.tasks?.length || 0) + (m.lessons?.reduce((lacc, l) => lacc + (l.tasks?.length || 0), 0) || 0),
          0
        );

        console.log(`✅ Updated [${course.order}] ${course.title} -> ${dataset.modules.length} Topics | ${totalLessons} Subtopics | ${totalQuestions} Qs | ${totalTasks} Tasks`);
        updatedCount++;
      }
    }

    console.log(`\n======================================================`);
    console.log(`🎉 Successfully seeded ${updatedCount} courses with rich curriculum data!`);
    console.log(`======================================================\n`);

    // Print summary of all courses
    const allCourses = await Course.find({}).sort({ order: 1 });
    console.log('--- CURRENT DATABASE STATUS ---');
    for (const c of allCourses) {
      const modCount = c.modules ? c.modules.length : 0;
      const lessonCount = c.modules ? c.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) : 0;
      const qCount = c.modules ? c.modules.reduce((acc, m) => acc + (m.questions?.length || 0) + (m.lessons?.reduce((lacc, l) => lacc + (l.questions?.length || 0), 0) || 0), 0) : 0;
      const tCount = c.modules ? c.modules.reduce((acc, m) => acc + (m.tasks?.length || 0) + (m.lessons?.reduce((lacc, l) => lacc + (l.tasks?.length || 0), 0) || 0), 0) : 0;
      console.log(`[#${c.order}] ${c.title} (${c.category}) | ${modCount} Topics | ${lessonCount} Subtopics | ${qCount} Questions | ${tCount} Tasks`);
    }

    await mongoose.disconnect();
    console.log('\nMongoDB Disconnected. Done.');
  } catch (error) {
    console.error('Error during course seeding:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAllCourses();
