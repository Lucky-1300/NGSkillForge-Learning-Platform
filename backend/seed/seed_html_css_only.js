/**
 * Seed Script: HTML & CSS Courses Dedicated Seeder
 * Updates ONLY HTML5 Foundations and CSS3 & Modern Layouts in MongoDB.
 * Leaves JavaScript Foundations and all other courses 100% untouched.
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Course = require('../models/course.model');

const htmlData = require('./data/html_course_data');
const cssData = require('./data/css_course_data');

async function seedHtmlAndCss() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas Connected ✅\n');

    // 1. Seed HTML Course
    const htmlCourse = await Course.findOne({
      title: { $regex: new RegExp(`^${htmlData.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (htmlCourse) {
      htmlCourse.modules = htmlData.modules;
      htmlCourse.thumbnail = htmlData.thumbnail;
      htmlCourse.instructor = htmlData.instructor;
      htmlCourse.category = htmlData.category;
      htmlCourse.level = htmlData.level;
      htmlCourse.duration = htmlData.duration;
      await htmlCourse.save();

      const htmlLessons = htmlData.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
      const htmlQuestions = htmlData.modules.reduce(
        (acc, m) => acc + (m.lessons?.reduce((lacc, l) => lacc + (l.questions?.length || 0), 0) || 0),
        0
      );
      const htmlTasks = htmlData.modules.reduce(
        (acc, m) => acc + (m.lessons?.reduce((lacc, l) => lacc + (l.tasks?.length || 0), 0) || 0),
        0
      );
      console.log(`✅ [HTML5 Foundations] Successfully updated: ${htmlData.modules.length} Topics | ${htmlLessons} Subtopics | ${htmlQuestions} Questions | ${htmlTasks} Tasks`);
    } else {
      console.warn('⚠️ HTML Course not found, creating new...');
      await Course.create(htmlData);
    }

    // 2. Seed CSS Course
    const cssCourse = await Course.findOne({
      title: { $regex: new RegExp(`^${cssData.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (cssCourse) {
      cssCourse.modules = cssData.modules;
      cssCourse.thumbnail = cssData.thumbnail;
      cssCourse.instructor = cssData.instructor;
      cssCourse.category = cssData.category;
      cssCourse.level = cssData.level;
      cssCourse.duration = cssData.duration;
      await cssCourse.save();

      const cssLessons = cssData.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
      const cssQuestions = cssData.modules.reduce(
        (acc, m) => acc + (m.lessons?.reduce((lacc, l) => lacc + (l.questions?.length || 0), 0) || 0),
        0
      );
      const cssTasks = cssData.modules.reduce(
        (acc, m) => acc + (m.lessons?.reduce((lacc, l) => lacc + (l.tasks?.length || 0), 0) || 0),
        0
      );
      console.log(`✅ [CSS3 & Modern Layouts] Successfully updated: ${cssData.modules.length} Topics | ${cssLessons} Subtopics | ${cssQuestions} Questions | ${cssTasks} Tasks`);
    } else {
      console.warn('⚠️ CSS Course not found, creating new...');
      await Course.create(cssData);
    }

    // 3. Verify JavaScript course is untouched
    const jsCourse = await Course.findOne({
      title: { $regex: /^JavaScript Foundations$/i },
    });
    if (jsCourse) {
      const jsLessons = jsCourse.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
      const jsQuestions = jsCourse.modules.reduce(
        (acc, m) => acc + (m.questions?.length || 0) + (m.lessons?.reduce((lacc, l) => lacc + (l.questions?.length || 0), 0) || 0),
        0
      );
      const jsTasks = jsCourse.modules.reduce(
        (acc, m) => acc + (m.tasks?.length || 0) + (m.lessons?.reduce((lacc, l) => lacc + (l.tasks?.length || 0), 0) || 0),
        0
      );
      console.log(`\n🔒 [JavaScript Foundations] Intact & Untouched: ${jsCourse.modules.length} Topics | ${jsLessons} Subtopics | ${jsQuestions} Questions | ${jsTasks} Tasks`);
    }

    await mongoose.disconnect();
    console.log('\nSeeding completed successfully.');
  } catch (error) {
    console.error('Error seeding HTML/CSS courses:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedHtmlAndCss();
