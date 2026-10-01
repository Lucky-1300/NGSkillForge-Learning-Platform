require('dotenv').config({ path: __dirname + '/../.env' });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('../models/course.model');
const CourseNote = require('../models/courseNote.model');
const htmlNotesData = require('./data/html_notes_data.json');

async function seedHtmlNotes() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas Connected ✅\n');

    // Find HTML course in database
    const htmlCourse = await Course.findOne({
      title: { $regex: /HTML5 Foundations|HTML/i }
    });

    if (!htmlCourse) {
      console.error('❌ HTML course not found in database! Please run course seeding first.');
      process.exit(1);
    }

    console.log(`Found HTML Course: [${htmlCourse._id}] "${htmlCourse.title}"`);

    // Upsert CourseNote document
    const updated = await CourseNote.findOneAndUpdate(
      { courseId: htmlCourse._id },
      {
        courseId: htmlCourse._id,
        courseSlug: 'html',
        courseTitle: htmlCourse.title,
        sourceUrl: 'https://docs.google.com/document/d/1yaAkalg-AxdMLTUsjjd3K73KSuytZBdwLLhTs-ENuKw/edit?usp=sharing',
        topics: htmlNotesData.topics,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`\n🎉 Successfully saved CourseNote for ${htmlCourse.title}!`);
    console.log(`Total Topics Stored: ${updated.topics.length}`);
    updated.topics.forEach(t => {
      console.log(`  ${t.order}. [${t.topicId}] ${t.title} (${t.content.length} chars)`);
    });

    await mongoose.disconnect();
    console.log('\nMongoDB Disconnected. Done.');
  } catch (err) {
    console.error('Error seeding HTML notes:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  seedHtmlNotes();
}

module.exports = seedHtmlNotes;
