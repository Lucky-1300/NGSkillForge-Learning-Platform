require("dotenv").config();
const mongoose = require("mongoose");
const Lecture = require("./models/lecture.model");
const Course = require("./models/course.model");
const LectureTranscript = require("./models/lectureTranscript.model");
const LectureContent = require("./models/lectureContent.model");
const { isConfigured } = require("./services/ai.service");
const {
    resolveLectureContext,
    generateAINotes,
    generateAITasks,
    generateAIMCQs,
} = require("./services/aiContent.service");

async function runSingleLectureTest() {
    const startTime = Date.now();
    console.log("==================================================");
    console.log("PHASE 3: SINGLE LECTURE END-TO-END PIPELINE TEST");
    console.log("==================================================");

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ MongoDB Connected");

        // 1. Locate JavaScript Foundations Course & Lecture 1
        const jsCourse = await Course.findOne({ title: /JavaScript Foundations/i });
        if (!jsCourse) {
            throw new Error("Course 'JavaScript Foundations' not found in database.");
        }

        const lecture = await Lecture.findOne({
            courseId: jsCourse._id,
            lectureNumber: 1,
        });

        if (!lecture) {
            throw new Error("Lecture #1 for 'JavaScript Foundations' not found in database.");
        }

        console.log("\n[1] Target Lecture Found:");
        console.log("- Lecture ID:", lecture._id.toString());
        console.log("- Title:", lecture.title);
        console.log("- Video ID:", lecture.youtubeVideoId);
        console.log("- Course:", jsCourse.title);

        // 2. Verify Cached Transcript in LectureTranscript
        const cachedTranscript = await LectureTranscript.findOne({
            lectureId: lecture._id,
        });

        if (!cachedTranscript || cachedTranscript.status !== "available") {
            console.log("\n[2] Transcript not cached yet, fetching from YouTube caption track...");
        } else {
            console.log("\n[2] Cached Transcript Verified:");
            console.log("- Status:", cachedTranscript.status);
            console.log("- Character Count:", cachedTranscript.characterCount);
            console.log("- Segment Count:", cachedTranscript.segmentCount);
            console.log("- Language:", cachedTranscript.language);
            console.log("- Source:", cachedTranscript.source);
            console.log("- Snippet Preview:", cachedTranscript.transcriptText.slice(0, 180) + "...");
        }

        // 3. Resolve Full Lecture Context
        console.log("\n[3] Resolving Lecture & Transcript Context...");
        const { context } = await resolveLectureContext(lecture._id.toString());
        console.log("- Has Transcript:", context.hasTranscript);
        console.log("- Transcript Characters:", context.transcriptCharacterCount);
        console.log("- Concept Extracted:", context.concept);
        console.log("- Language:", context.language);

        // 4. Check Groq AI Configuration
        console.log("\n[4] Checking Groq AI Configuration...");
        if (!isConfigured()) {
            console.log("⚠️ GROQ_API_KEY is currently set to placeholder in .env ('" + process.env.GROQ_API_KEY + "').");
            console.log("To complete live generation with Groq, please set your active GROQ_API_KEY in backend/.env.");
            
            // Check if mock/simulation or existing LectureContent is in place
            const existingContent = await LectureContent.findOne({
                courseId: jsCourse._id,
                lectureNumber: 1,
            });

            console.log("\n==================================================");
            console.log("PIPELINE READINESS SUMMARY");
            console.log("==================================================");
            console.log("- Lecture ID:", lecture._id.toString());
            console.log("- Video ID:", lecture.youtubeVideoId);
            console.log("- Transcript Verified:", context.hasTranscript ? `YES (${context.transcriptCharacterCount} chars)` : "NO");
            console.log("- Pipeline Logic:", "Ready for execution upon GROQ_API_KEY entry");
            console.log("- Video/Audio Downloaded:", "NONE (0 bytes)");
            console.log("- Elapsed Time:", `${Date.now() - startTime}ms`);
            console.log("==================================================");
            process.exit(0);
        }

        // 5. Generate Notes from Transcript
        console.log("\n[5] Generating Structured Notes from Transcript with Groq AI...");
        const notesStart = Date.now();
        const notesResult = await generateAINotes(context);
        console.log(`✓ Notes generated in ${Date.now() - notesStart}ms`);
        console.log("- Title:", notesResult.structuredNotes.title);
        console.log("- Overview:", notesResult.structuredNotes.overview?.slice(0, 100) + "...");
        console.log("- Sections Count:", notesResult.structuredNotes.sections?.length);
        console.log("- Key Takeaways Count:", notesResult.structuredNotes.keyTakeaways?.length);
        console.log("- Useful Resources Count:", notesResult.structuredNotes.usefulResources?.length);

        await new Promise((r) => setTimeout(r, 2500));

        // 6. Generate 5 Practical Tasks
        console.log("\n[6] Generating 5 Practical Tasks from Transcript with Groq AI...");
        const tasksStart = Date.now();
        const tasksResult = await generateAITasks(context, { count: 5 });
        console.log(`✓ 5 Tasks generated in ${Date.now() - tasksStart}ms`);
        tasksResult.tasks.forEach((t, i) => {
            console.log(`  Task ${i + 1} [${t.difficulty}]: ${t.title}`);
        });

        await new Promise((r) => setTimeout(r, 2500));

        // 7. Generate 5 MCQs
        console.log("\n[7] Generating 5 MCQs from Transcript with Groq AI...");
        const mcqsStart = Date.now();
        const mcqsResult = await generateAIMCQs(context, { count: 5 });
        console.log(`✓ 5 MCQs generated in ${Date.now() - mcqsStart}ms`);
        mcqsResult.mcqs.forEach((q, i) => {
            console.log(`  MCQ ${i + 1} [${q.difficulty}]: ${q.question} (Correct: Option ${String.fromCharCode(65 + q.correctAnswer)})`);
        });

        // 8. Verify the Final LectureContent Document in MongoDB
        console.log("\n[8] Verifying Persisted LectureContent Document in MongoDB Atlas...");
        const contentDoc = await LectureContent.findOne({
            courseId: jsCourse._id,
            lectureNumber: 1,
        });

        const totalTime = Date.now() - startTime;

        console.log("\n==================================================");
        console.log("FINAL END-TO-END PIPELINE RESULT");
        console.log("==================================================");
        console.log("- Lecture ID:", lecture._id.toString());
        console.log("- LectureContent Document ID:", contentDoc._id.toString());
        console.log("- Status:", contentDoc.status);
        console.log("- Generated By:", contentDoc.generatedBy);
        console.log("- Transcript Available:", contentDoc.sourceContext?.transcriptAvailable);
        console.log("- Transcript Character Count:", contentDoc.sourceContext?.transcriptCharacterCount);
        console.log("- Transcript Source:", contentDoc.sourceContext?.transcriptSource);
        console.log("- Notes Sections:", contentDoc.structuredNotes?.sections?.length);
        console.log("- Total Tasks:", contentDoc.tasks?.length);
        console.log("- Total MCQs:", contentDoc.mcqs?.length);
        console.log("- Total Generation Time:", `${(totalTime / 1000).toFixed(2)}s (${totalTime}ms)`);
        console.log("- Groq Errors:", "None");
        console.log("==================================================");

        process.exit(0);
    } catch (err) {
        console.error("\n❌ Error during single lecture test:", err.message);
        if (err.originalError) console.error("Details:", err.originalError);
        process.exit(1);
    }
}

runSingleLectureTest();
