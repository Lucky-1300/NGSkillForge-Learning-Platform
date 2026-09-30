require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const User = require('./models/user.model');
const Course = require('./models/course.model');
const Lecture = require('./models/lecture.model');
const LectureContent = require('./models/lectureContent.model');

const { globalSearch } = require('./controllers/search.controller');

// Helper to create mock Express req & res
function createMockReqRes({ params = {}, query = {}, body = {}, user = null } = {}) {
    const req = { params, query, body, user };
    let responseData = null;
    let statusCode = 200;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            responseData = data;
            return this;
        },
        getStatusCode() {
            return statusCode;
        },
        getData() {
            return responseData;
        },
    };
    return { req, res };
}

async function runPhase12Tests() {
    console.log('========================================================================');
    console.log('NGSkillForge Phase 12: Global Search System Test');
    console.log('========================================================================\n');

    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Identify test Admin and Student users
        const adminUser = await User.findOne({ role: 'admin' });
        const studentUser = await User.findOne({ role: 'user' });

        // Target Course: JavaScript Foundations
        const course = await Course.findOne({ title: { $regex: /javascript/i } }) || await Course.findOne();
        if (!course) throw new Error('Target test course not found');
        console.log(`✓ Target Course: "${course.title}" (${course._id})\n`);

        // Setup a published LectureContent with Notes, Tasks, and MCQs for testing
        const targetLecture = await Lecture.findOne({ courseId: course._id }).sort({ lectureNumber: 1 });
        if (!targetLecture) throw new Error('Target lecture not found');

        // Clean up or ensure 1 published and 1 draft LectureContent
        await LectureContent.findOneAndUpdate(
            { courseId: course._id, lectureNumber: targetLecture.lectureNumber },
            {
                $set: {
                    lectureId: targetLecture._id,
                    courseId: course._id,
                    lectureNumber: targetLecture.lectureNumber,
                    status: 'published',
                    notes: '## JavaScript Foundations & Lexical Scope\nClosures allow inner functions to retain access to outer scope variables even after outer function execution terminates.',
                    structuredNotes: {
                        title: 'JavaScript Foundations and Closures',
                        overview: 'Deep dive into Lexical Scope and Javascript Closures.',
                    },
                    tasks: [
                        {
                            title: 'Implement a Counter using JavaScript Closure',
                            description: 'Create a function createCounter that returns increment and get methods using private closure state.',
                            difficulty: 'Medium',
                        },
                    ],
                    mcqs: [
                        {
                            question: 'What is a closure in JavaScript?',
                            options: [
                                'A function combined with its lexical environment',
                                'A way to close browser windows',
                                'A CSS layout technique',
                            ],
                            correctAnswer: 0,
                            explanation: 'A closure is the combination of a function bundled with references to its surrounding lexical state.',
                            difficulty: 'Medium',
                        },
                    ],
                },
            },
            { upsert: true, returnDocument: 'after' }
        );

        // Also create a DRAFT content that must NEVER appear in search
        const draftLecture = await Lecture.findOne({ courseId: course._id, lectureNumber: { $ne: targetLecture.lectureNumber } });
        if (draftLecture) {
            await LectureContent.findOneAndUpdate(
                { courseId: course._id, lectureNumber: draftLecture.lectureNumber },
                {
                    $set: {
                        lectureId: draftLecture._id,
                        courseId: course._id,
                        lectureNumber: draftLecture.lectureNumber,
                        status: 'draft', // DRAFT STATUS
                        notes: 'SECRET_DRAFT_NOTES_KEYWORD: This is unapproved draft curriculum that should never be searched.',
                        tasks: [
                            {
                                title: 'SECRET_DRAFT_TASK_KEYWORD',
                                description: 'Draft task description',
                                difficulty: 'Hard',
                            },
                        ],
                        mcqs: [
                            {
                                question: 'SECRET_DRAFT_MCQ_KEYWORD: Which option is draft?',
                                options: ['Draft A', 'Draft B'],
                                correctAnswer: 0,
                            },
                        ],
                    },
                },
                { upsert: true }
            );
        }

        // -----------------------------------------------------------------
        // TEST 1: Search Course by Title (Case-Insensitive & Partial)
        // -----------------------------------------------------------------
        console.log('--- TEST 1: Search Course by Title ---');
        const { req: q1Req, res: q1Res } = createMockReqRes({
            query: { q: 'javascript' },
        });
        await globalSearch(q1Req, q1Res);
        const q1Data = q1Res.getData();
        if (!q1Data.success || q1Data.results.courses.length === 0) {
            throw new Error('Course search for "javascript" returned 0 courses');
        }
        console.log(`✓ Found ${q1Data.results.courses.length} course(s) for query "javascript":`);
        q1Data.results.courses.forEach((c) => console.log(`   - "${c.title}" (${c.category}, URL: ${c.url})`));

        // -----------------------------------------------------------------
        // TEST 2: Search Lecture by Title & Module
        // -----------------------------------------------------------------
        console.log('\n--- TEST 2: Search Lecture by Title ---');
        const { req: q2Req, res: q2Res } = createMockReqRes({
            query: { q: 'introduction' },
        });
        await globalSearch(q2Req, q2Res);
        const q2Data = q2Res.getData();
        if (!q2Data.success || q2Data.results.lectures.length === 0) {
            throw new Error('Lecture search for "introduction" returned 0 lectures');
        }
        console.log(`✓ Found ${q2Data.results.lectures.length} lecture(s) for query "introduction":`);
        q2Data.results.lectures.forEach((l) => console.log(`   - #${l.lectureNumber}: "${l.title}" (${l.courseTitle})`));

        // -----------------------------------------------------------------
        // TEST 3: Search Notes by Topic & Keyword
        // -----------------------------------------------------------------
        console.log('\n--- TEST 3: Search Published Notes by Content Keyword ---');
        const { req: q3Req, res: q3Res } = createMockReqRes({
            query: { q: 'closure' },
        });
        await globalSearch(q3Req, q3Res);
        const q3Data = q3Res.getData();
        if (!q3Data.success || q3Data.results.notes.length === 0) {
            throw new Error('Notes search for "closure" returned 0 notes');
        }
        console.log(`✓ Found ${q3Data.results.notes.length} note match(es) for "closure":`);
        q3Data.results.notes.forEach((n) => {
            console.log(`   - "${n.title}" (${n.subtitle}) -> snippet: "${n.snippet}"`);
        });

        // -----------------------------------------------------------------
        // TEST 4: Search Practice Tasks
        // -----------------------------------------------------------------
        console.log('\n--- TEST 4: Search Practice Tasks ---');
        if (q3Data.results.tasks.length === 0) {
            throw new Error('Task search for "closure" returned 0 tasks');
        }
        console.log(`✓ Found ${q3Data.results.tasks.length} task match(es) for "closure":`);
        q3Data.results.tasks.forEach((t) => {
            console.log(`   - [${t.difficulty}] "${t.title}" (${t.subtitle})`);
        });

        // -----------------------------------------------------------------
        // TEST 5: Search MCQs & Verify Answer Privacy Protection
        // -----------------------------------------------------------------
        console.log('\n--- TEST 5: Search MCQs & Verify Answer Privacy Protection ---');
        if (q3Data.results.mcqs.length === 0) {
            throw new Error('MCQ search for "closure" returned 0 MCQs');
        }
        console.log(`✓ Found ${q3Data.results.mcqs.length} MCQ match(es) for "closure":`);
        q3Data.results.mcqs.forEach((m) => {
            console.log(`   - "${m.question}" (${m.subtitle})`);
            // Check that correctAnswer and explanation are NOT exposed
            if (m.correctAnswer !== undefined || m.explanation !== undefined) {
                throw new Error('SECURITY BREACH: MCQ correct answer or explanation exposed in search results!');
            }
        });
        console.log(`✓ SECURITY CHECK PASSED: Zero MCQ correct answers or explanations exposed in search response.`);

        // -----------------------------------------------------------------
        // TEST 6: DRAFT Content Isolation Verification
        // -----------------------------------------------------------------
        console.log('\n--- TEST 6: Verify Draft Content is Strictly Excluded ---');
        const { req: draftReq, res: draftRes } = createMockReqRes({
            query: { q: 'SECRET_DRAFT' },
        });
        await globalSearch(draftReq, draftRes);
        const draftData = draftRes.getData();
        if (draftData.totalResults !== 0 || draftData.results.notes.length > 0 || draftData.results.tasks.length > 0 || draftData.results.mcqs.length > 0) {
            throw new Error('SECURITY VIOLATION: Draft/unpublished content was returned in student search results!');
        }
        console.log(`✓ Confirmed: 0 draft items returned for "SECRET_DRAFT". Draft content strictly isolated.`);

        // -----------------------------------------------------------------
        // TEST 7: Type Filtering (e.g. type=courses or type=notes)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 7: Type Filter Execution ---');
        const { req: typeReq, res: typeRes } = createMockReqRes({
            query: { q: 'javascript', type: 'courses' },
        });
        await globalSearch(typeReq, typeRes);
        const typeData = typeRes.getData();
        if (typeData.results.courses.length === 0 || typeData.results.lectures.length > 0 || typeData.results.notes.length > 0) {
            throw new Error('Type filter did not isolate courses strictly');
        }
        console.log(`✓ Type filter "courses" isolated exactly ${typeData.results.courses.length} courses and 0 other types.`);

        // -----------------------------------------------------------------
        // TEST 8: Empty Search & No Match Handlers
        // -----------------------------------------------------------------
        console.log('\n--- TEST 8: Empty Search & No Match Handlers ---');
        const { req: emptyReq, res: emptyRes } = createMockReqRes({
            query: { q: 'nonexistent_xyz_random_keyword_12345' },
        });
        await globalSearch(emptyReq, emptyRes);
        const emptyData = emptyRes.getData();
        if (emptyData.totalResults !== 0) {
            throw new Error('Expected 0 results for non-existent query');
        }
        console.log(`✓ Empty results handled cleanly with totalResults = 0.`);

        // -----------------------------------------------------------------
        // TEST 9: Uppercase / Lowercase Case-Insensitivity
        // -----------------------------------------------------------------
        console.log('\n--- TEST 9: Case-Insensitivity Verification ---');
        const { req: upperReq, res: upperRes } = createMockReqRes({
            query: { q: 'CLOSURE' },
        });
        await globalSearch(upperReq, upperRes);
        const upperData = upperRes.getData();
        if (upperData.totalResults === 0) {
            throw new Error('Case-insensitive search for "CLOSURE" failed');
        }
        console.log(`✓ "CLOSURE" (uppercase) successfully matched ${upperData.totalResults} published items.`);

        // -----------------------------------------------------------------
        // TEST 10: URL Navigation Validity
        // -----------------------------------------------------------------
        console.log('\n--- TEST 10: URL Navigation Validity ---');
        const sampleNote = q3Data.results.notes[0];
        const sampleLecture = q2Data.results.lectures[0];
        const sampleCourse = q1Data.results.courses[0];

        if (!sampleNote.url.includes('/courses/') || !sampleNote.url.includes('tab=notes')) {
            throw new Error(`Invalid note navigation URL: ${sampleNote.url}`);
        }
        if (!sampleLecture.url.includes('/courses/') || !sampleLecture.url.includes('/learn/')) {
            throw new Error(`Invalid lecture navigation URL: ${sampleLecture.url}`);
        }
        if (!sampleCourse.url.includes('/courses/')) {
            throw new Error(`Invalid course navigation URL: ${sampleCourse.url}`);
        }
        console.log(`✓ All search result navigation URLs validated:`);
        console.log(`   - Course: ${sampleCourse.url}`);
        console.log(`   - Lecture: ${sampleLecture.url}`);
        console.log(`   - Note: ${sampleNote.url}`);

        console.log('\n========================================================================');
        console.log('✅ ALL PHASE 12 GLOBAL SEARCH SYSTEM TESTS PASSED SUCCESSFULLY!');
        console.log('========================================================================');
    } catch (err) {
        console.error('\n❌ PHASE 12 TEST FAILED:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runPhase12Tests();
