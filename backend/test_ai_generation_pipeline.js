require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const Course = require('./models/course.model');
const Lecture = require('./models/lecture.model');
const LectureContent = require('./models/lectureContent.model');
const { generateSelectedContent, getCourseContentStatus, publishCourseContent } = require('./controllers/ai.controller');

function createMockRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
            return this;
        }
    };
}

async function testPipeline() {
    console.log('--- TESTING ADMIN AI CONTENT GENERATION PIPELINE ---');
    await mongoose.connect(process.env.MONGO_URI);

    const course = await Course.findOne({ title: /javascript foundations/i });
    const lectures = await Lecture.find({ courseId: course._id }).sort({ lectureNumber: 1 });

    console.log(`Course: "${course.title}" with ${lectures.length} lectures`);

    // 1. Test getCourseContentStatus
    const reqStatus = { params: { courseId: course._id.toString() } };
    const resStatus = createMockRes();
    await getCourseContentStatus(reqStatus, resStatus);
    console.log('✓ Course content status retrieved:');
    console.log('  Total:', resStatus.body.totalLectures);
    console.log('  Drafts:', resStatus.body.stats?.draftCount);
    console.log('  Published:', resStatus.body.stats?.publishedCount);
    console.log('  Missing:', resStatus.body.stats?.missingCount);
    console.log('  Modules count:', resStatus.body.modules?.length);

    // 2. Test generateSelectedContent for 1 lecture with Notes, Tasks, and MCQs
    const targetLec = lectures[0];
    console.log(`\nTesting generateSelectedContent for Lecture #${targetLec.lectureNumber} ("${targetLec.title}")`);

    const reqGen = {
        body: {
            lectureIds: [targetLec._id.toString()],
            generateNotes: true,
            generateTasks: true,
            generateMCQs: true,
            taskCount: 2,
            mcqCount: 3,
        }
    };
    const resGen = createMockRes();
    await generateSelectedContent(reqGen, resGen);

    console.log('✓ Generation Response:');
    console.log('  Success:', resGen.body.success);
    console.log('  Message:', resGen.body.message);
    console.log('  Results:', JSON.stringify(resGen.body.results, null, 2));

    // 3. Verify in MongoDB
    const doc = await LectureContent.findOne({ courseId: course._id, lectureNumber: targetLec.lectureNumber });
    console.log('\n✓ MongoDB LectureContent Document:');
    console.log('  Status:', doc.status);
    console.log('  Has Notes:', Boolean(doc.notes));
    console.log('  Tasks Count:', doc.tasks?.length);
    console.log('  MCQs Count:', doc.mcqs?.length);
    console.log('  Source Context:', doc.sourceContext?.transcriptSource);

    if (!doc || !doc.notes || doc.tasks?.length === 0 || doc.mcqs?.length === 0) {
        throw new Error('Verification failed: LectureContent incomplete');
    }

    console.log('\n✓ AI CONTENT GENERATION PIPELINE TEST PASSED 100%!');
    process.exit(0);
}

testPipeline().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
