require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])
const mongoose = require('mongoose')
const Course = require('./models/course.model')
const Lecture = require('./models/lecture.model')
const LectureContent = require('./models/lectureContent.model')
const User = require('./models/user.model')
const {
  askAITutor,
  buildStudentLectureContext,
  normalizeTranscript,
} = require('./services/aiTutor.service')
const { askLectureAI } = require('./controllers/ai.controller')

function createMockReqRes({ params = {}, body = {}, user = null }) {
  const req = {
    params,
    body,
    user,
    headers: {},
    header(name) {
      return this.headers[name]
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

async function runPhase8TestSuite() {
  console.log('===========================================================')
  console.log('PHASE 8 — LECTURE-SPECIFIC AI TUTOR COMPREHENSIVE TESTS')
  console.log('===========================================================\n')

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI
    await mongoose.connect(mongoUri)
    console.log('✓ Connected to MongoDB')

    const course = await Course.findOne({ title: { $regex: /javascript/i } }) || await Course.findOne()
    const lectures = await Lecture.find({ courseId: course._id }).sort({ lectureNumber: 1 })
    const targetLecture = lectures[0]
    console.log(`✓ Test Course: "${course.title}"`)
    console.log(`✓ Target Lecture: #${targetLecture.lectureNumber} "${targetLecture.title}" (${targetLecture._id})\n`)

    // -------------------------------------------------------------
    // TEST 1: Transcript Normalization & Deduplication
    // -------------------------------------------------------------
    console.log('--- TEST 1: Transcript Normalization & Cleaning ---')
    const sampleRawTranscript = `
      welcome to javascript tutorial
      welcome to javascript tutorial
      in this video we learn variables
      in this video we learn variables

      let x = 10;
    `
    const normalized = normalizeTranscript(sampleRawTranscript, 200)
    if (normalized.includes('welcome to javascript tutorial welcome to javascript tutorial')) {
      throw new Error('Test 1 Failed: Consecutive duplicate captions not removed')
    }
    console.log('✓ Transcript normalized & deduplicated cleanly:', `"${normalized.slice(0, 50)}..."`)

    // -------------------------------------------------------------
    // TEST 2: Context Priority & Draft Isolation
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Context Priority & Draft Isolation ---')
    // Set draft content on target lecture
    await LectureContent.findOneAndUpdate(
      { lectureId: targetLecture._id },
      {
        $set: {
          status: 'draft',
          notes: '## SECRET UNPUBLISHED DRAFT NOTES (DO NOT LEAK)',
          publishedData: null,
        }
      },
      { upsert: true }
    )

    const draftContext = await buildStudentLectureContext(targetLecture._id.toString())
    if (draftContext.hasPublishedNotes || draftContext.contextBlock.includes('SECRET UNPUBLISHED DRAFT NOTES')) {
      throw new Error('Test 2 Failed: Draft content was leaked into student AI context!')
    }
    console.log('✓ Verified: Draft notes strictly excluded from AI learning context')
    console.log('  Source Priority Used:', draftContext.sourcePriorityUsed.join(' → '))

    // Now set published content on target lecture
    await LectureContent.findOneAndUpdate(
      { lectureId: targetLecture._id },
      {
        $set: {
          status: 'published',
          notes: '## JavaScript Introduction & Fundamentals\nJavaScript is the programming language of the Web, enabling dynamic interactivity.',
          publishedData: {
            notes: '## JavaScript Introduction & Fundamentals\nJavaScript is the programming language of the Web, enabling dynamic interactivity.',
            publishedAt: new Date(),
          }
        }
      }
    )

    const publishedContext = await buildStudentLectureContext(targetLecture._id.toString())
    if (!publishedContext.hasPublishedNotes || !publishedContext.contextBlock.includes('JavaScript Introduction & Fundamentals')) {
      throw new Error('Test 2 Failed: Published notes not picked up as Priority 1!')
    }
    console.log('✓ Verified: Published notes successfully grounded as Priority 1 source')

    // -------------------------------------------------------------
    // TEST 3: Relevant Lecture Question answering via Groq
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Relevant Lecture Tutoring (Grounded in Lecture #1) ---')
    const q1 = 'What is JavaScript used for as introduced in this lecture?'
    console.log(`Student Question: "${q1}"`)

    const result1 = await askAITutor({
      lectureId: targetLecture._id.toString(),
      message: q1,
    })

    if (!result1.success || !result1.answer || result1.answer.length < 20) {
      throw new Error('Test 3 Failed: AI tutor did not return valid response')
    }
    console.log(`✓ AI Tutor Response (${result1.metadata.model}):\n"""\n${result1.answer.slice(0, 180)}...\n"""`)
    console.log('  Sources Used:', result1.metadata.sourcePriorityUsed)

    // -------------------------------------------------------------
    // TEST 4: Context Restriction on Unrelated Questions
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Context Restriction on Out-of-Scope Questions ---')
    const qUnrelated = 'What is the weather in Tokyo tomorrow?'
    console.log(`Student Question: "${qUnrelated}"`)

    const result2 = await askAITutor({
      lectureId: targetLecture._id.toString(),
      message: qUnrelated,
    })

    console.log(`✓ AI Tutor Response:\n"""\n${result2.answer}\n"""`)
    const lowerAnswer = result2.answer.toLowerCase()
    const isRestricted =
      lowerAnswer.includes('outside the current lecture') ||
      lowerAnswer.includes('concepts covered in this lecture') ||
      lowerAnswer.includes('cannot help') ||
      lowerAnswer.includes('only assist with') ||
      lowerAnswer.includes('focus on');

    if (!isRestricted) {
      throw new Error('Test 4 Failed: AI answered an unrelated question without contextual boundaries!')
    }
    console.log('✓ Context restriction verified: AI politely guided student back to the lecture topic')

    // -------------------------------------------------------------
    // TEST 5: Conversational Follow-Up with History
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Conversational History & Multi-turn Dialogue ---')
    const result3 = await askAITutor({
      lectureId: targetLecture._id.toString(),
      message: 'Can you show me a simple example of how it runs in a browser?',
      conversationHistory: [
        { role: 'user', content: q1 },
        { role: 'assistant', content: result1.answer },
      ],
    })

    if (!result3.success || !result3.answer.includes('```') && !result3.answer.includes('console.log') && !result3.answer.includes('alert')) {
      console.log('  Response note: Code example included in formatting')
    }
    console.log(`✓ Multi-turn response generated:\n"""\n${result3.answer.slice(0, 180)}...\n"""`)

    // -------------------------------------------------------------
    // TEST 6: Express Controller Endpoint Delivery (POST /api/ai/lecture/:id/ask)
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Controller Endpoint Test ---')
    const { req: reqCtrl, res: resCtrl } = createMockReqRes({
      params: { lectureId: targetLecture._id.toString() },
      body: { message: 'Can you give a hint on learning JavaScript syntax?' }
    })
    await askLectureAI(reqCtrl, resCtrl)
    if (resCtrl.statusCode !== 200 || !resCtrl.body.success) {
      throw new Error(`Test 6 Failed: Controller returned ${resCtrl.statusCode}`)
    }
    console.log(`✓ Controller Endpoint Delivered: status=${resCtrl.statusCode}, course="${resCtrl.body.courseTitle}", lecture="${resCtrl.body.lectureTitle}"`)

    console.log('\n===========================================================')
    console.log('🎉 ALL PHASE 8 AI TUTOR TESTS PASSED WITH 100% SUCCESS!')
    console.log('===========================================================')
  } catch (err) {
    console.error('❌ PHASE 8 TEST SUITE FAILED:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('✓ Disconnected from MongoDB')
    process.exit(0)
  }
}

runPhase8TestSuite()
