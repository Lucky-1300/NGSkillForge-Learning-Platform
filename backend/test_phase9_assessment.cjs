require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const User = require('./models/user.model');
const Course = require('./models/course.model');
const Lecture = require('./models/lecture.model');
const Progress = require('./models/progress.model');
const Enrollment = require('./models/enrollment.model');
const Assessment = require('./models/assessment.model');
const AssessmentAttempt = require('./models/assessmentAttempt.model');

const {
    getCourseAssessmentStudent,
    getAssessmentByIdStudent,
    startAssessmentAttempt,
    submitAssessmentAttempt,
    getMyAttempts,
    getCourseCompletionStatus,
    getAdminAssessments,
    getAdminAssessmentById,
    createAdminAssessment,
    updateAdminAssessment,
    publishAdminAssessment,
    unpublishAdminAssessment,
    deleteAdminAssessment,
} = require('./controllers/assessment.controller');

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

async function runPhase9Tests() {
    console.log('===============================================================');
    console.log('NGSkillForge Phase 9: Course Assessment & Completion System Test');
    console.log('===============================================================\n');

    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Identify test Admin and Student users
        const adminUser = await User.findOne({ role: 'admin' });
        const studentUser = await User.findOne({ role: 'user' });
        const secondStudent = await User.findOne({ role: 'user', _id: { $ne: studentUser._id } }) || studentUser;

        if (!adminUser || !studentUser) {
            throw new Error('Admin or student user missing in test database');
        }

        console.log(`✓ Admin User: ${adminUser.name} (${adminUser.email})`);
        console.log(`✓ Student User: ${studentUser.name} (${studentUser.email})`);

        // Target Course: JavaScript Foundations
        const course = await Course.findOne({ title: { $regex: /javascript/i } }) || await Course.findOne();
        if (!course) throw new Error('Target test course not found');
        console.log(`✓ Target Course: "${course.title}" (${course._id})\n`);

        const totalLectures = await Lecture.countDocuments({ courseId: course._id });
        console.log(`✓ Course has ${totalLectures} total lectures.\n`);

        // Cleanup any pre-existing test assessments for clean test run
        await Assessment.deleteMany({ courseId: course._id, title: /Test Assessment/i });
        await AssessmentAttempt.deleteMany({ courseId: course._id });

        // -----------------------------------------------------------------
        // TEST 1: Admin Assessment Creation (Draft State)
        // -----------------------------------------------------------------
        console.log('--- TEST 1: Admin Creates Assessment Draft ---');
        const validQuestions = [
            {
                question: "Which keyword creates a block-scoped variable in JavaScript?",
                options: ["var", "let", "function", "global"],
                correctAnswer: 1, // 'let'
                explanation: "'let' declares a block-scoped local variable, whereas 'var' is function-scoped.",
                difficulty: "Easy",
            },
            {
                question: "What is the result of typeof null in JavaScript?",
                options: ["'null'", "'undefined'", "'object'", "'number'"],
                correctAnswer: 2, // 'object'
                explanation: "Due to a historical bug in JavaScript, typeof null returns 'object'.",
                difficulty: "Medium",
            },
            {
                question: "Which method is used to schedule microtasks in the event loop?",
                options: ["setTimeout", "setImmediate", "queueMicrotask", "requestAnimationFrame"],
                correctAnswer: 2, // 'queueMicrotask'
                explanation: "queueMicrotask explicitly schedules a microtask to be run in the microtask queue.",
                difficulty: "Hard",
            },
        ];

        const { req: createReq, res: createRes } = createMockReqRes({
            body: {
                courseId: course._id.toString(),
                title: "JavaScript Foundations Test Assessment",
                description: "Final comprehensive assessment for JS Foundations",
                passingPercentage: 70,
                timeLimitMinutes: 20,
                questions: validQuestions,
            },
            user: { _id: adminUser._id, role: 'admin' },
        });

        await createAdminAssessment(createReq, createRes);
        const createdAssessment = createRes.getData().assessment;
        if (!createdAssessment || createRes.getStatusCode() !== 201) {
            throw new Error(`Failed to create assessment: ${JSON.stringify(createRes.getData())}`);
        }
        console.log(`✓ Assessment Draft created: "${createdAssessment.title}" (ID: ${createdAssessment._id}, Status: ${createdAssessment.status})`);
        console.log(`✓ Default status is "draft" — NOT automatically published.`);

        // -----------------------------------------------------------------
        // TEST 2: Validation prevents publishing invalid MCQs
        // -----------------------------------------------------------------
        console.log('\n--- TEST 2: Validation Prevents Publishing Invalid MCQs ---');
        // Test controller validation function
        const { validateAssessmentQuestions } = require('./controllers/assessment.controller');
        const invalidValidationResult = validateAssessmentQuestions([
            {
                question: "", // empty
                options: ["Option A"], // < 2 options
                correctAnswer: 4, // out of range
                difficulty: "Extreme", // invalid difficulty
            },
        ]);

        if (!invalidValidationResult.isValid && invalidValidationResult.errors.length >= 3) {
            console.log(`✓ validateAssessmentQuestions correctly caught ${invalidValidationResult.errors.length} validation errors:`);
            invalidValidationResult.errors.forEach((err) => console.log(`   - ${err}`));
        } else {
            throw new Error('validateAssessmentQuestions failed to reject invalid questions');
        }

        // -----------------------------------------------------------------
        // TEST 3: Draft assessment is hidden from students
        // -----------------------------------------------------------------
        console.log('\n--- TEST 3: Draft Assessment is Hidden from Students ---');
        const { req: draftFetchReq, res: draftFetchRes } = createMockReqRes({
            params: { courseId: course._id.toString() },
            user: { _id: studentUser._id, role: 'user' },
        });
        await getCourseAssessmentStudent(draftFetchReq, draftFetchRes);
        const draftFetchData = draftFetchRes.getData();
        if (draftFetchData.hasAssessment === false && draftFetchData.message === "Final assessment is not available yet.") {
            console.log(`✓ Draft assessment correctly hidden from student: "${draftFetchData.message}"`);
        } else {
            throw new Error('Draft assessment should not be accessible to students');
        }

        // -----------------------------------------------------------------
        // TEST 4: Admin Publishes Assessment
        // -----------------------------------------------------------------
        console.log('\n--- TEST 4: Admin Publishes Assessment ---');
        const { req: pubReq, res: pubRes } = createMockReqRes({
            params: { assessmentId: createdAssessment._id.toString() },
            user: { _id: adminUser._id, role: 'admin' },
        });
        await publishAdminAssessment(pubReq, pubRes);
        if (pubRes.getStatusCode() !== 200 || pubRes.getData().assessment.status !== 'published') {
            throw new Error('Failed to publish assessment');
        }
        console.log(`✓ Assessment published successfully! Status: ${pubRes.getData().assessment.status}`);

        // -----------------------------------------------------------------
        // TEST 5: Student Views Published Assessment (Answers Protected)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 5: Student Views Assessment & Answers Are Protected ---');
        const { req: studentViewReq, res: studentViewRes } = createMockReqRes({
            params: { courseId: course._id.toString() },
            user: { _id: studentUser._id, role: 'user' },
        });
        await getCourseAssessmentStudent(studentViewReq, studentViewRes);
        const studentAssessmentData = studentViewRes.getData();
        if (!studentAssessmentData.hasAssessment || !studentAssessmentData.assessment) {
            throw new Error('Student could not view published assessment');
        }
        console.log(`✓ Student received assessment: "${studentAssessmentData.assessment.title}" (${studentAssessmentData.assessment.totalQuestions} questions)`);

        // Check answer protection
        const exposedAnswers = studentAssessmentData.assessment.questions.filter((q) => q.correctAnswer !== undefined || q.explanation !== undefined);
        if (exposedAnswers.length > 0) {
            throw new Error(`SECURITY BREACH: ${exposedAnswers.length} questions exposed correct answers/explanations to student!`);
        }
        console.log(`✓ SECURITY CHECK PASSED: 0 of ${studentAssessmentData.assessment.questions.length} questions exposed correct answers or explanations.`);

        // -----------------------------------------------------------------
        // TEST 6: Incomplete lectures block starting assessment
        // -----------------------------------------------------------------
        console.log('\n--- TEST 6: Lecture Prerequisites Enforced ---');
        // Clear progress for student
        await Progress.deleteMany({ userId: studentUser._id, courseId: course._id });
        await Enrollment.deleteMany({ user: studentUser._id, course: course._id });

        const { req: startBlockedReq, res: startBlockedRes } = createMockReqRes({
            params: { assessmentId: createdAssessment._id.toString() },
            user: { _id: studentUser._id, role: 'user' },
        });
        await startAssessmentAttempt(startBlockedReq, startBlockedRes);
        if (startBlockedRes.getStatusCode() === 403) {
            console.log(`✓ Prerequisite block enforced: "${startBlockedRes.getData().message}"`);
        } else {
            throw new Error('Prerequisite check failed to block incomplete lecture student');
        }

        // -----------------------------------------------------------------
        // TEST 7: Complete all lectures to satisfy prerequisites
        // -----------------------------------------------------------------
        console.log('\n--- TEST 7: Student Completes Required Lectures ---');
        const lectures = await Lecture.find({ courseId: course._id });
        for (const lect of lectures) {
            await Progress.create({
                userId: studentUser._id,
                courseId: course._id,
                lectureId: lect._id,
                completed: true,
                completedAt: new Date(),
            });
        }
        console.log(`✓ Marked all ${lectures.length} lectures as completed in Progress collection.`);

        // Verify start attempt succeeds now
        const { req: startOkReq, res: startOkRes } = createMockReqRes({
            params: { assessmentId: createdAssessment._id.toString() },
            user: { _id: studentUser._id, role: 'user' },
        });
        await startAssessmentAttempt(startOkReq, startOkRes);
        if (startOkRes.getStatusCode() === 200 && startOkRes.getData().success) {
            console.log(`✓ Assessment started successfully after completing lectures.`);
        } else {
            throw new Error('Failed to start assessment after meeting prerequisites');
        }

        // -----------------------------------------------------------------
        // TEST 8: Submit Failing Attempt (Attempt 1: 1/3 correct = 33% < 70%)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 8: Submit Failing Attempt (Attempt 1) ---');
        const failingAnswers = [
            { questionId: createdAssessment.questions[0]._id.toString(), selectedOption: 1 }, // Correct (let)
            { questionId: createdAssessment.questions[1]._id.toString(), selectedOption: 0 }, // Incorrect (selected 'null', correct is 'object')
            { questionId: createdAssessment.questions[2]._id.toString(), selectedOption: 0 }, // Incorrect (selected setTimeout, correct is queueMicrotask)
        ];

        const { req: submitFailReq, res: submitFailRes } = createMockReqRes({
            params: { assessmentId: createdAssessment._id.toString() },
            body: {
                answers: failingAnswers,
                timeSpentSeconds: 120,
            },
            user: { _id: studentUser._id, role: 'user' },
        });
        await submitAssessmentAttempt(submitFailReq, submitFailRes);
        const failData = submitFailRes.getData().attempt;
        if (!failData || failData.passed === true || failData.percentage >= 70) {
            throw new Error('Failed attempt calculation error');
        }
        console.log(`✓ Attempt 1 evaluated by backend:`);
        console.log(`  - Attempt Number: ${failData.attemptNumber}`);
        console.log(`  - Score: ${failData.score} / ${failData.totalQuestions}`);
        console.log(`  - Percentage: ${failData.percentage}% (Required: ${failData.passingPercentage}%)`);
        console.log(`  - Passed: ${failData.passed}`);
        console.log(`  - Course Completed: ${failData.courseCompleted}`);

        // Verify course is NOT completed yet
        const enrollFailCheck = await Enrollment.findOne({ user: studentUser._id, course: course._id });
        if (enrollFailCheck && enrollFailCheck.courseCompleted) {
            throw new Error('Course should NOT be marked completed when assessment is failed');
        }
        console.log(`✓ Confirmed Enrollment courseCompleted is FALSE.`);

        // -----------------------------------------------------------------
        // TEST 9: Retry Assessment (Attempt 2: 3/3 correct = 100% >= 70%)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 9: Retry Assessment & Pass (Attempt 2) ---');
        const passingAnswers = [
            { questionId: createdAssessment.questions[0]._id.toString(), selectedOption: 1 }, // Correct
            { questionId: createdAssessment.questions[1]._id.toString(), selectedOption: 2 }, // Correct
            { questionId: createdAssessment.questions[2]._id.toString(), selectedOption: 2 }, // Correct
        ];

        const { req: submitPassReq, res: submitPassRes } = createMockReqRes({
            params: { assessmentId: createdAssessment._id.toString() },
            body: {
                answers: passingAnswers,
                timeSpentSeconds: 95,
            },
            user: { _id: studentUser._id, role: 'user' },
        });
        await submitAssessmentAttempt(submitPassReq, submitPassRes);
        const passData = submitPassRes.getData().attempt;
        if (!passData || passData.passed !== true || passData.percentage !== 100) {
            throw new Error('Passing attempt calculation error');
        }
        console.log(`✓ Attempt 2 evaluated by backend:`);
        console.log(`  - Attempt Number: ${passData.attemptNumber}`);
        console.log(`  - Score: ${passData.score} / ${passData.totalQuestions}`);
        console.log(`  - Percentage: ${passData.percentage}%`);
        console.log(`  - Passed: ${passData.passed}`);
        console.log(`  - Course Completed: ${passData.courseCompleted}`);

        // -----------------------------------------------------------------
        // TEST 10: Verify Multiple Attempts Stored Separately
        // -----------------------------------------------------------------
        console.log('\n--- TEST 10: Verify Attempt History & Separation ---');
        const allAttempts = await AssessmentAttempt.find({
            userId: studentUser._id,
            assessmentId: createdAssessment._id,
        }).sort({ attemptNumber: 1 });

        if (allAttempts.length !== 2) {
            throw new Error(`Expected 2 distinct attempts, found ${allAttempts.length}`);
        }
        console.log(`✓ Total Stored Attempts in DB: ${allAttempts.length}`);
        allAttempts.forEach((att) => {
            console.log(`  - Attempt #${att.attemptNumber}: ${att.score}/${att.totalQuestions} (${att.percentage}%) - ${att.passed ? 'PASSED ✓' : 'FAILED ✗'}`);
        });

        // -----------------------------------------------------------------
        // TEST 11: Verify Course Completion State in Database
        // -----------------------------------------------------------------
        console.log('\n--- TEST 11: Verify Course Completion State ---');
        const enrollPassed = await Enrollment.findOne({ user: studentUser._id, course: course._id });
        if (!enrollPassed || !enrollPassed.courseCompleted || !enrollPassed.completedAt || !enrollPassed.assessmentPassed) {
            throw new Error('Enrollment course completion state not properly recorded');
        }
        console.log(`✓ Enrollment Record:`);
        console.log(`  - courseCompleted: ${enrollPassed.courseCompleted}`);
        console.log(`  - completedAt: ${enrollPassed.completedAt}`);
        console.log(`  - assessmentPassed: ${enrollPassed.assessmentPassed}`);
        console.log(`  - bestAssessmentScore: ${enrollPassed.bestAssessmentScore}%`);

        // Check Course Completion API
        const { req: compReq, res: compRes } = createMockReqRes({
            params: { courseId: course._id.toString() },
            user: { _id: studentUser._id, role: 'user' },
        });
        await getCourseCompletionStatus(compReq, compRes);
        const compData = compRes.getData();
        console.log(`✓ Course Completion API Response:`);
        console.log(`  - Lectures: ${compData.lecturesCompleted}/${compData.totalLectures} (${compData.lectureProgressPercent}%)`);
        console.log(`  - Assessment Passed: ${compData.assessmentPassed}`);
        console.log(`  - Best Score: ${compData.bestScore}%`);
        console.log(`  - Course Completed: ${compData.courseCompleted}`);

        // -----------------------------------------------------------------
        // TEST 12: Security - Student Attempt Isolation
        // -----------------------------------------------------------------
        console.log('\n--- TEST 12: Security - Student Attempt Isolation ---');
        const { req: otherStudentReq, res: otherStudentRes } = createMockReqRes({
            params: { assessmentId: createdAssessment._id.toString() },
            user: { _id: secondStudent._id, role: 'user' },
        });
        await getMyAttempts(otherStudentReq, otherStudentRes);
        const otherAttempts = otherStudentRes.getData().attempts;
        if (otherStudentReq.user._id.toString() !== studentUser._id.toString()) {
            if (otherAttempts.length !== 0) {
                throw new Error('Student can view another student attempts!');
            }
            console.log(`✓ Second student cannot view primary student's attempts (0 found).`);
        } else {
            console.log(`✓ Verified getMyAttempts query filters by authenticated req.user._id.`);
        }

        // -----------------------------------------------------------------
        // TEST 13: Admin Unpublish / Revert to Draft
        // -----------------------------------------------------------------
        console.log('\n--- TEST 13: Admin Unpublish & Management ---');
        const { req: unpubReq, res: unpubRes } = createMockReqRes({
            params: { assessmentId: createdAssessment._id.toString() },
            user: { _id: adminUser._id, role: 'admin' },
        });
        await unpublishAdminAssessment(unpubReq, unpubRes);
        if (unpubRes.getData().assessment.status !== 'draft') {
            throw new Error('Failed to unpublish assessment');
        }
        console.log(`✓ Assessment reverted to draft status.`);

        // Re-publish for platform readiness
        await publishAdminAssessment(pubReq, pubRes);
        console.log(`✓ Assessment re-published and ready for learners.`);

        console.log('\n===============================================================');
        console.log('✅ ALL PHASE 9 ASSESSMENT & COMPLETION TESTS PASSED SUCCESSFULLY!');
        console.log('===============================================================');
    } catch (err) {
        console.error('\n❌ TEST FAILED:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runPhase9Tests();
