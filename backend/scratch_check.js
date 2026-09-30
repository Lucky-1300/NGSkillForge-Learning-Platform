require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Course = require('./models/course.model');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const courses = await Course.find({}).sort({ order: 1 });
  console.log('Total courses in DB:', courses.length);
  for (const c of courses) {
    const modCount = c.modules ? c.modules.length : 0;
    const lessonCount = c.modules ? c.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) : 0;
    const qCount = c.modules ? c.modules.reduce((acc, m) => acc + (m.questions?.length || 0) + (m.lessons?.reduce((lacc, l) => lacc + (l.questions?.length || 0), 0) || 0), 0) : 0;
    const tCount = c.modules ? c.modules.reduce((acc, m) => acc + (m.tasks?.length || 0) + (m.lessons?.reduce((lacc, l) => lacc + (l.tasks?.length || 0), 0) || 0), 0) : 0;
    console.log(`[#${c.order}] ${c.title} (${c.category}) | Modules: ${modCount} | Lessons: ${lessonCount} | Questions: ${qCount} | Tasks: ${tCount}`);
    if (modCount > 0) {
      c.modules.forEach(m => {
        console.log(`   -> Topic ${m.order}: ${m.title} (${m.lessons?.length || 0} subtopics)`);
      });
    }
  }
  await mongoose.disconnect();
}
check().catch(console.error);
