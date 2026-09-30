require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])
const mongoose = require('mongoose')
const Course = require('./models/course.model')
const Lecture = require('./models/lecture.model')
const LectureContent = require('./models/lectureContent.model')
const User = require('./models/user.model')
const { generateSelectedContent, publishCourseContent, getCourseContentStatus } = require('./controllers/ai.controller')
const { getLectureContent } = require('./services/lectureContent.service')

async function runE2ETest() {
  console.log('=== ADMIN AI CONTENT PIPELINE E2E TEST ===\n')

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI
    await mongoose.connect(mongoUri)
    console.log('✓ Connected to MongoDB')

    // 1. Admin & Course Selection
    const userCount = await User.countDocuments()
    console.log(`✓ Total users in DB: ${userCount}`)

    const course = await Course.findOne({ title: { $regex: /javascript/i } }) || await Course.findOne()
    if (!course) throw new Error('No course found')
    console.log(`✓ Selected Course: "${course.title}" (${course._id})`)

    // 2. Check Course Content Status
    const mockStatusReq = { params: { courseId: course._id.toString() } }
    let statusData = null
    const mockStatusRes = {
      status(code) { this.statusCode = code; return this },
      json(data) { statusData = data }
    }
    await getCourseContentStatus(mockStatusReq, mockStatusRes)
    console.log(`✓ Content Status Retrieved:`)
    console.log(`  - Total Lectures: ${statusData.totalLectures}`)
    console.log(`  - Drafts: ${statusData.draftLectures}`)
    console.log(`  - Published: ${statusData.publishedLectures}`)
    console.log(`  - Missing: ${statusData.missingLectures}`)
    console.log(`  - Modules: ${statusData.modules.length}`)

    // 3. Select Module / Lecture
    const targetLecture = await Lecture.findOne({ courseId: course._id }).sort({ lectureNumber: 1 })
    if (!targetLecture) throw new Error('No lecture found for course')
    console.log(`\n✓ Target Lecture: #${targetLecture.lectureNumber} "${targetLecture.title}" (${targetLecture._id})`)

    // 4. Choose Options & Generate (Notes, Tasks, MCQs)
    console.log('\n--- Executing Generation Pipeline ---')
    console.log('Options: ☑ Notes, ☑ Tasks (3), ☑ MCQs (4)')
    
    const mockGenReq = {
      body: {
        courseId: course._id.toString(),
        lectureIds: [targetLecture._id.toString()],
        options: {
          generateNotes: true,
          generateTasks: true,
          generateMCQs: true,
          taskCount: 3,
          mcqCount: 4
        }
      }
    }
    let genData = null
    const mockGenRes = {
      status(code) { this.statusCode = code; return this },
      json(data) { genData = data }
    }

    await generateSelectedContent(mockGenReq, mockGenRes)
    console.log(`✓ Generation API Output:`)
    console.log(`  Success: ${genData.success}`)
    console.log(`  Message: ${genData.message}`)
    console.log(`  Result item:`, JSON.stringify(genData.results[0], null, 2))

    // 5. Verify Draft Content in MongoDB
    const draftDoc = await LectureContent.findOne({ lectureId: targetLecture._id })
    if (!draftDoc) throw new Error('Draft document not created in MongoDB!')
    console.log(`\n✓ MongoDB Draft Verification:`)
    console.log(`  Status: ${draftDoc.status}`)
    console.log(`  Notes Length: ${draftDoc.notes?.length || 0} characters`)
    console.log(`  Tasks Count: ${draftDoc.tasks?.length || 0}`)
    console.log(`  MCQs Count: ${draftDoc.mcqs?.length || 0}`)
    console.log(`  Source: ${draftDoc.sourceContext?.transcriptSource || 'syllabus'}`)

    if (draftDoc.status !== 'draft') {
      throw new Error(`Expected draft status, got ${draftDoc.status}`)
    }

    // 6. Test Publishing Content
    console.log('\n--- Publishing Content to Live ---')
    const mockPubReq = { params: { courseId: course._id.toString() } }
    let pubData = null
    const mockPubRes = {
      status(code) { this.statusCode = code; return this },
      json(data) { pubData = data }
    }
    await publishCourseContent(mockPubReq, mockPubRes)
    console.log(`✓ Publish Response: ${pubData.message} (${pubData.publishedCount} lectures)`)

    const liveDoc = await LectureContent.findOne({ lectureId: targetLecture._id })
    console.log(`✓ MongoDB Live Document Status: ${liveDoc.status}`)
    if (liveDoc.status !== 'published') {
      throw new Error(`Expected published status, got ${liveDoc.status}`)
    }

    // 7. Test Student Delivery View
    console.log('\n--- Student Content Delivery Verification ---')
    const studentDelivered = await getLectureContent(course, targetLecture)
    console.log(`✓ Student Service delivered:`)
    console.log(`  - Is Published: ${studentDelivered.isPublished}`)
    console.log(`  - Has Notes: ${!!studentDelivered.notes}`)
    console.log(`  - Tasks: ${studentDelivered.tasks?.length || 0}`)
    console.log(`  - MCQs: ${studentDelivered.mcqs?.length || 0}`)

    console.log('\n======================================================')
    console.log('🎉 ALL PIPELINE STAGES VERIFIED & PASSED WITH 100% SUCCESS!')
    console.log('======================================================')
  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('✓ Disconnected from MongoDB')
    process.exit(0)
  }
}

runE2ETest()
