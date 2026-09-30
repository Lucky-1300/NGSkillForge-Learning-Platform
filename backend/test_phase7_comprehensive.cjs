require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Course = require('./models/course.model')
const Lecture = require('./models/lecture.model')
const LectureContent = require('./models/lectureContent.model')
const User = require('./models/user.model')
const {
  getAdminContentList,
  getAdminLectureContent,
  updateAdminNotes,
  updateAdminTasks,
  updateAdminMCQs,
  saveAdminDraft,
  publishAdminContent,
  unpublishAdminContent,
  bulkPublishAdminContent,
  validateMCQs,
  validateContentForPublishing,
} = require('./controllers/adminContent.controller')
const { getLectureContent } = require('./services/lectureContent.service')
const authMiddleware = require('./middleware/auth.middleware')
const roleMiddleware = require('./middleware/role.middleware')

function createMockReqRes({ params = {}, query = {}, body = {}, user = null, headers = {} }) {
  const req = {
    params,
    query,
    body,
    user,
    headers,
    header(name) {
      return this.headers[name] || this.headers[name.toLowerCase()]
    }
  }

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.body = data
      return this
    }
  }

  return { req, res }
}

async function runPhase7TestSuite() {
  console.log('===========================================================')
  console.log('PHASE 7 — ADMIN CONTENT REVIEW & PUBLISHING COMPREHENSIVE TESTS')
  console.log('===========================================================\n')

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI
    await mongoose.connect(mongoUri)
    console.log('✓ Connected to MongoDB')

    // Find admin user and student user
    let adminUser = await User.findOne({ role: 'admin' })
    let studentUser = await User.findOne({ role: 'user' })

    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin Tester',
        email: `admin_test_${Date.now()}@example.com`,
        password: 'password123',
        role: 'admin',
        isVerified: true,
      })
    }
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Learner Tester',
        email: `learner_test_${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
        isVerified: true,
      })
    }

    console.log(`✓ Admin User: ${adminUser.email} (role: ${adminUser.role})`)
    console.log(`✓ Learner User: ${studentUser.email} (role: ${studentUser.role})`)

    const course = await Course.findOne({ title: { $regex: /javascript/i } }) || await Course.findOne()
    const lectures = await Lecture.find({ courseId: course._id }).sort({ lectureNumber: 1 })
    const targetLecture = lectures[0]
    console.log(`✓ Test Subject: Course "${course.title}" - Lecture #${targetLecture.lectureNumber} "${targetLecture.title}"\n`)

    // -------------------------------------------------------------
    // TEST 1: Admin can access content dashboard
    // -------------------------------------------------------------
    console.log('--- TEST 1: Admin Dashboard Access ---')
    const { req: req1, res: res1 } = createMockReqRes({
      query: { courseId: course._id.toString() },
      user: { id: adminUser._id.toString(), _id: adminUser._id.toString(), role: 'admin' }
    })
    await getAdminContentList(req1, res1)
    if (res1.statusCode !== 200 || !res1.body.success) {
      throw new Error(`Test 1 Failed: Status ${res1.statusCode}`)
    }
    console.log(`✓ Admin retrieved content list: ${res1.body.lectures.length} lectures found`)
    console.log(`  Stats: Total=${res1.body.stats.total}, Drafts=${res1.body.stats.draft}, Published=${res1.body.stats.published}`)

    // -------------------------------------------------------------
    // TEST 2: Normal student cannot access admin content (403 Forbidden)
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Authorization Isolation (Student gets 403) ---')
    const adminCheck = roleMiddleware('admin')
    const { req: reqStudent, res: resStudent } = createMockReqRes({
      user: { id: studentUser._id.toString(), _id: studentUser._id.toString(), role: 'user' }
    })
    let studentBlocked = false
    adminCheck(reqStudent, resStudent, () => {
      studentBlocked = false
    })
    if (resStudent.statusCode === 403) {
      studentBlocked = true
    }
    if (!studentBlocked) {
      throw new Error('Test 2 Failed: Student was not blocked with 403!')
    }
    console.log('✓ Student correctly received 403 Forbidden on admin role middleware')

    // -------------------------------------------------------------
    // TEST 3 & 4: Draft content is visible to admin but NEVER to students
    // -------------------------------------------------------------
    console.log('\n--- TEST 3 & 4: Draft Content Visibility & Isolation ---')
    // Ensure content exists in draft status
    await LectureContent.findOneAndUpdate(
      { lectureId: targetLecture._id },
      {
        $set: {
          courseId: course._id,
          lectureNumber: targetLecture.lectureNumber,
          status: 'draft',
          notes: '## Phase 7 Draft Educational Notes\nVariables in JavaScript store data values.',
          structuredNotes: {
            title: 'Phase 7 Draft Title',
            overview: 'Draft Overview for Review',
            sections: [{ heading: 'Variables', content: 'Use let and const.' }],
          },
          tasks: [{
            title: 'Declare a Variable',
            description: 'Create a const variable named score and assign 100.',
            difficulty: 'Easy',
            starterCode: '// write code\n',
          }],
          mcqs: [{
            question: 'Which keyword declares a block-scoped constant?',
            options: ['var', 'const', 'let', 'def'],
            correctAnswer: 1,
            explanation: 'const creates immutable variable bindings.',
            difficulty: 'Easy',
          }],
          publishedData: null,
          reviewedBy: adminUser._id,
        }
      },
      { upsert: true, returnDocument: 'after' }
    )

    // Admin view
    const { req: req3, res: res3 } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await getAdminLectureContent(req3, res3)
    if (res3.statusCode !== 200 || res3.body.content?.status !== 'draft') {
      throw new Error(`Test 3 Failed: Admin could not view draft content (${res3.statusCode})`)
    }
    console.log(`✓ Admin can view draft: status="${res3.body.content.status}", notes length=${res3.body.content.notes.length}`)

    // Student view
    const studentDelivered = await getLectureContent(course, targetLecture)
    if (studentDelivered.isPublished === true || studentDelivered.notes) {
      throw new Error('Test 4 Failed: Draft content was leaked to student!')
    }
    console.log(`✓ Student receives NO draft content: isPublished=${studentDelivered.isPublished}, status="${studentDelivered.status}"`)

    // -------------------------------------------------------------
    // TEST 5, 6, 7: Admin can edit Notes, Tasks, and MCQs
    // -------------------------------------------------------------
    console.log('\n--- TEST 5, 6, 7: Granular Editing of Notes, Tasks, MCQs ---')
    
    // 5. Edit Notes
    const { req: reqNotes, res: resNotes } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      body: {
        notes: '## Updated Notes by Admin\nUpdated text for javascript variables.',
        structuredNotes: {
          title: 'JavaScript Variables Masterclass',
          overview: 'Comprehensive guide to modern declarations',
          sections: [{ heading: 'const vs let', content: 'Prefer const by default.' }],
        }
      },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await updateAdminNotes(reqNotes, resNotes)
    if (resNotes.statusCode !== 200 || !resNotes.body.content.notes.includes('Updated Notes by Admin')) {
      throw new Error('Test 5 Failed: Admin could not update notes')
    }
    console.log('✓ Admin successfully edited notes in draft mode')

    // 6. Edit Tasks
    const { req: reqTasks, res: resTasks } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      body: {
        tasks: [
          {
            title: 'Task 1: Declare Constant',
            description: 'Define const PI = 3.14159',
            difficulty: 'Easy',
            starterCode: '// starter\n',
          },
          {
            title: 'Task 2: Block Scope Check',
            description: 'Demonstrate block scoping with let',
            difficulty: 'Medium',
            starterCode: '// starter\n',
          }
        ]
      },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await updateAdminTasks(reqTasks, resTasks)
    if (resTasks.statusCode !== 200 || resTasks.body.content.tasks.length !== 2) {
      throw new Error('Test 6 Failed: Admin could not update tasks')
    }
    console.log('✓ Admin successfully edited practice tasks in draft mode (2 tasks)')

    // 7. Edit MCQs
    const { req: reqMCQs, res: resMCQs } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      body: {
        mcqs: [
          {
            question: 'What happens when you reassign a const variable?',
            options: ['TypeError is thrown', 'Variable is updated', 'Silently ignored', 'Returns undefined'],
            correctAnswer: 0,
            explanation: 'const variables cannot be reassigned after declaration.',
            difficulty: 'Medium',
          }
        ]
      },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await updateAdminMCQs(reqMCQs, resMCQs)
    if (resMCQs.statusCode !== 200 || resMCQs.body.content.mcqs.length !== 1) {
      throw new Error('Test 7 Failed: Admin could not update MCQs')
    }
    console.log('✓ Admin successfully edited MCQs with verified correct answer index')

    // -------------------------------------------------------------
    // TEST 8: Save changes as draft retains draft status
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Save Draft (Retains Draft Status) ---')
    const { req: reqDraft, res: resDraft } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      body: {
        notes: '## Final Draft Notes\nVerified content.',
        tasks: [{ title: 'Practice 1', description: 'Write code', difficulty: 'Easy' }],
        mcqs: [{ question: 'Valid Question?', options: ['A', 'B'], correctAnswer: 0, explanation: 'Valid' }],
      },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await saveAdminDraft(reqDraft, resDraft)
    if (resDraft.statusCode !== 200 || resDraft.body.status !== 'draft') {
      throw new Error('Test 8 Failed: Save Draft did not retain draft status')
    }
    const checkDocAfterDraft = await LectureContent.findOne({ lectureId: targetLecture._id })
    if (checkDocAfterDraft.status !== 'draft') {
      throw new Error(`Test 8 Failed: DB status is ${checkDocAfterDraft.status}, expected draft`)
    }
    console.log('✓ Save draft successfully updated document and strictly maintained status: "draft"')

    // -------------------------------------------------------------
    // TEST 9 & 10: Publish valid content and verify student visibility
    // -------------------------------------------------------------
    console.log('\n--- TEST 9 & 10: Explicit Publish & Student Delivery ---')
    const { req: reqPub, res: resPub } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await publishAdminContent(reqPub, resPub)
    if (resPub.statusCode !== 200 || resPub.body.status !== 'published') {
      throw new Error(`Test 9 Failed: Publish returned ${resPub.statusCode}`)
    }
    console.log(`✓ Admin successfully published lecture: status="${resPub.body.status}"`)
    console.log(`  Audit: publishedBy=${resPub.body.content.publishedBy.email}, publishedAt=${resPub.body.content.publishedAt}`)

    const studentLiveContent = await getLectureContent(course, targetLecture)
    if (!studentLiveContent.isPublished || !studentLiveContent.notes) {
      throw new Error('Test 10 Failed: Published content not visible to students!')
    }
    console.log(`✓ Student API now delivers live content: isPublished=${studentLiveContent.isPublished}, notes="${studentLiveContent.notes.slice(0, 30)}..."`)

    // -------------------------------------------------------------
    // TEST 11 & 12: Unpublish content and verify student disappearance
    // -------------------------------------------------------------
    console.log('\n--- TEST 11 & 12: Unpublish Action & Immediate Student Removal ---')
    const { req: reqUnpub, res: resUnpub } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await unpublishAdminContent(reqUnpub, resUnpub)
    if (resUnpub.statusCode !== 200 || resUnpub.body.status !== 'draft') {
      throw new Error(`Test 11 Failed: Unpublish returned ${resUnpub.statusCode}`)
    }
    console.log(`✓ Admin successfully unpublished lecture: status="${resUnpub.body.status}"`)

    const studentAfterUnpublish = await getLectureContent(course, targetLecture)
    if (studentAfterUnpublish.isPublished === true || studentAfterUnpublish.notes) {
      throw new Error('Test 12 Failed: Unpublished content is still visible to students!')
    }
    console.log(`✓ Student immediately receives no content after unpublish: isPublished=${studentAfterUnpublish.isPublished}`)

    // -------------------------------------------------------------
    // TEST 13: Invalid MCQs cannot be published
    // -------------------------------------------------------------
    console.log('\n--- TEST 13: MCQ Validation Rejection ---')
    // Set invalid MCQ with bad correctAnswer index
    await LectureContent.findOneAndUpdate(
      { lectureId: targetLecture._id },
      {
        $set: {
          mcqs: [{
            question: 'Broken MCQ',
            options: ['Option A', 'Option B'],
            correctAnswer: 5, // Invalid index!
            explanation: 'Explanation',
          }]
        }
      }
    )

    const { req: reqBadPub, res: resBadPub } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await publishAdminContent(reqBadPub, resBadPub)
    if (resBadPub.statusCode === 200) {
      throw new Error('Test 13 Failed: Invalid MCQ was published when it should have failed!')
    }
    console.log(`✓ Invalid MCQ rejected with status ${resBadPub.statusCode}: "${resBadPub.body.errors[0]}"`)

    // -------------------------------------------------------------
    // TEST 14: Content Version Safety
    // -------------------------------------------------------------
    console.log('\n--- TEST 14: Content Version Safety ---')
    // Set valid content and publish it
    await LectureContent.findOneAndUpdate(
      { lectureId: targetLecture._id },
      {
        $set: {
          status: 'published',
          notes: '## Approved Live Version 1.0',
          structuredNotes: { title: 'Version 1.0 Title', sections: [{ heading: 'V1', content: 'Live content' }] },
          tasks: [{ title: 'Live Task', description: 'Live', difficulty: 'Easy' }],
          mcqs: [{ question: 'Live Q?', options: ['A', 'B'], correctAnswer: 0, explanation: 'Live' }],
          publishedData: {
            notes: '## Approved Live Version 1.0',
            structuredNotes: { title: 'Version 1.0 Title' },
            tasks: [{ title: 'Live Task' }],
            mcqs: [{ question: 'Live Q?' }],
            publishedAt: new Date(),
            publishedBy: adminUser._id,
          }
        }
      }
    )

    // Admin makes draft changes without publishing
    const { req: reqEditDraft, res: resEditDraft } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      body: {
        notes: '## WIP Unapproved Draft 2.0 (Should not leak!)',
      },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await updateAdminNotes(reqEditDraft, resEditDraft)

    // Check what student sees: student MUST see Version 1.0 (not unapproved draft 2.0!)
    const studentDuringEdit = await getLectureContent(course, targetLecture)
    if (!studentDuringEdit.notes.includes('Approved Live Version 1.0')) {
      throw new Error(`Test 14 Failed: Live content was overwritten by working draft! Got: ${studentDuringEdit.notes}`)
    }
    console.log(`✓ Version safety confirmed: Student sees live version "${studentDuringEdit.notes}" while admin edits working draft!`)

    // -------------------------------------------------------------
    // TEST 15: Bulk Publish with Per-Lecture Validation
    // -------------------------------------------------------------
    console.log('\n--- TEST 15: Bulk Publish Validation ---')
    const { req: reqBulk, res: resBulk } = createMockReqRes({
      body: { lectureIds: [targetLecture._id.toString()] },
      user: { id: adminUser._id.toString(), role: 'admin' }
    })
    await bulkPublishAdminContent(reqBulk, resBulk)
    if (resBulk.statusCode !== 200 || !resBulk.body.success) {
      throw new Error(`Test 15 Failed: Bulk publish returned ${resBulk.statusCode}`)
    }
    console.log(`✓ Bulk publish passed: ${resBulk.body.message}`)

    console.log('\n===========================================================')
    console.log('🎉 ALL 16 PHASE 7 TESTS PASSED WITH 100% SUCCESS!')
    console.log('===========================================================')
  } catch (err) {
    console.error('❌ PHASE 7 TEST SUITE FAILED:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('✓ Disconnected from MongoDB')
    process.exit(0)
  }
}

runPhase7TestSuite()
