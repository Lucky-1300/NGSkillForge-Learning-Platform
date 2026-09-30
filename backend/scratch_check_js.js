require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Course = require('./models/course.model');

async function checkJS() {
  await mongoose.connect(process.env.MONGO_URI);
  const js = await Course.findOne({ title: 'JavaScript Foundations' });
  if (js) {
    console.log(`JavaScript Foundations has ${js.modules.length} modules:`);
    js.modules.forEach(m => {
      const lCount = m.lessons ? m.lessons.length : 0;
      const qCount = (m.questions?.length || 0) + (m.lessons?.reduce((acc, l) => acc + (l.questions?.length || 0), 0) || 0);
      const tCount = (m.tasks?.length || 0) + (m.lessons?.reduce((acc, l) => acc + (l.tasks?.length || 0), 0) || 0);
      const hasContent = m.lessons ? m.lessons.filter(l => l.content && l.content.length > 50).length : 0;
      console.log(`Topic ${m.order}: ${m.title} | ${lCount} lessons (${hasContent} with content) | ${qCount} Qs | ${tCount} Tasks`);
    });
  }
  await mongoose.disconnect();
}
checkJS().catch(console.error);
