const mongoose = require("mongoose");
const Lecture = require("../models/lecture.model");
const Course = require("../models/course.model");
const LectureContent = require("../models/lectureContent.model");
const { generateChatCompletion } = require("./ai.service");
const { getLectureTranscript } = require("./transcript.service");

/**
 * Clean up title to extract primary subject/concept
 */
function extractConcept(title) {
    if (!title) return "Core Concepts";
    return title
        .replace(/tutorial\s+in\s+hindi\s*\/?\s*urdu/gi, "")
        .replace(/tutorial\s+in\s+hindi/gi, "")
        .replace(/in\s+hindi\s*\/?\s*urdu/gi, "")
        .replace(/video\s+lecture/gi, "")
        .replace(/javascript\s+full\s+course\s*#?\d*/gi, "")
        .replace(/node\s+js\s+tutorial\s*#?\d*/gi, "")
        .replace(/video\s*-\s*\d+/gi, "")
        .replace(/#\d+/gi, "")
        .replace(/\|\s*/g, " ")
        .replace(/-\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Detect programming language or domain from course and lecture titles
 */
function detectLanguage(courseTitle = "", lectureTitle = "") {
    const combined = `${courseTitle} ${lectureTitle}`.toLowerCase();
    if (combined.includes("css") || combined.includes("flexbox") || combined.includes("grid")) return "css";
    if (combined.includes("react") || combined.includes("jsx")) return "jsx";
    if (combined.includes("sql") || combined.includes("mysql") || combined.includes("database")) return "sql";
    if (combined.includes("mongo") || combined.includes("nosql")) return "javascript";
    if (combined.includes("node") || combined.includes("express")) return "javascript";
    if (combined.includes("html")) return "html";
    if (combined.includes("git")) return "bash";
    if (combined.includes("python")) return "python";
    return "javascript";
}

/**
 * Safely parse JSON response from LLMs, handling markdown fences and minor formatting quirks
 */
function safeParseJSON(rawText) {
    if (!rawText || typeof rawText !== "string") {
        throw new Error("Empty or non-string response from AI service.");
    }

    let cleaned = rawText.trim();

    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    try {
        return JSON.parse(cleaned);
    } catch (firstErr) {
        const startIdx = cleaned.indexOf("{");
        const endIdx = cleaned.lastIndexOf("}");
        if (startIdx !== -1 && endIdx > startIdx) {
            try {
                return JSON.parse(cleaned.slice(startIdx, endIdx + 1));
            } catch {}
        }
        throw firstErr;
    }
}

/**
 * Resolve and validate complete lecture, course, and transcript context from database
 *
 * @param {string} lectureId - MongoDB ObjectId string of the lecture
 * @returns {Promise<{ lecture: Object, course: Object, context: Object }>}
 */
async function resolveLectureContext(lectureId) {
    if (!lectureId) {
        const err = new Error("Validation Error: 'lectureId' is required.");
        err.statusCode = 400;
        throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
        const err = new Error(`Validation Error: Invalid lecture ID format '${lectureId}'. Must be a 24-character hexadecimal ObjectId.`);
        err.statusCode = 400;
        throw err;
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        const err = new Error(`Lecture not found with ID '${lectureId}'.`);
        err.statusCode = 404;
        throw err;
    }

    const course = await Course.findById(lecture.courseId);
    if (!course) {
        const err = new Error(`Associated course not found for lecture '${lectureId}'.`);
        err.statusCode = 404;
        throw err;
    }

    const concept = extractConcept(lecture.title);
    const language = detectLanguage(course.title, lecture.title);

    // Look for matching lesson in course.modules if any
    let syllabusNotes = "";
    if (Array.isArray(course.modules)) {
        for (const mod of course.modules) {
            if (Array.isArray(mod.lessons)) {
                const matchedLesson = mod.lessons.find(
                    (l) => l.order === lecture.lectureNumber || l.title?.toLowerCase().includes(concept.toLowerCase())
                );
                if (matchedLesson) {
                    syllabusNotes = matchedLesson.notes || matchedLesson.content || "";
                    break;
                }
            }
        }
    }

    // Step: Attempt to retrieve transcript via Transcript Service
    let transcriptResult = null;
    try {
        transcriptResult = await getLectureTranscript(lecture._id.toString());
    } catch (tErr) {
        transcriptResult = {
            success: false,
            reason: "TRANSCRIPT_FETCH_ERROR",
            message: tErr.message,
        };
    }

    const hasTranscript = Boolean(transcriptResult && transcriptResult.success && transcriptResult.transcriptText);
    const transcriptText = hasTranscript ? transcriptResult.transcriptText : "";
    const transcriptLanguage = hasTranscript ? transcriptResult.language : null;
    const transcriptSource = hasTranscript ? transcriptResult.source : "metadata-only";
    const transcriptReason = hasTranscript ? null : (transcriptResult?.reason || "TRANSCRIPT_UNAVAILABLE");

    const context = {
        lectureId: lecture._id,
        courseId: course._id,
        lectureNumber: lecture.lectureNumber,
        lectureTitle: lecture.title,
        concept,
        language,
        duration: lecture.duration || "Standard",
        youtubeVideoId: lecture.youtubeVideoId,
        courseTitle: course.title,
        courseCategory: course.category || "Software Engineering",
        courseLevel: course.level || "Beginner",
        courseDescription: course.description || "",
        syllabusNotes,
        hasTranscript,
        transcriptText,
        transcriptLanguage,
        transcriptSource,
        transcriptReason,
        transcriptCharacterCount: transcriptText.length,
    };

    return { lecture, course, context };
}

/**
 * Build clean sourceContext snapshot metadata for LectureContent
 */
function buildSourceContextMetadata(context) {
    return {
        transcriptAvailable: context.hasTranscript,
        transcriptLanguage: context.transcriptLanguage,
        transcriptSource: context.transcriptSource,
        transcriptReason: context.transcriptReason,
        transcriptCharacterCount: context.transcriptCharacterCount,
        lectureTitle: context.lectureTitle,
        courseTitle: context.courseTitle,
        concept: context.concept,
        syllabusContext: context.syllabusNotes ? context.syllabusNotes.slice(0, 300) : "N/A",
        note: context.hasTranscript
            ? "Generated primarily from verified YouTube video transcript."
            : "Transcript unavailable. Generated content is based on available lecture metadata and course context.",
        generatedAt: new Date(),
    };
}

/**
 * Format structured sections into standard Markdown notes for UI rendering
 */
function buildMarkdownNotes(structuredNotes) {
    if (!structuredNotes) return "";
    let md = `## ${structuredNotes.title || "Lecture Notes"}\n\n`;

    if (structuredNotes.overview) {
        md += `${structuredNotes.overview}\n\n`;
    }

    if (Array.isArray(structuredNotes.sections)) {
        structuredNotes.sections.forEach((sec, idx) => {
            md += `### ${idx + 1}. ${sec.heading}\n\n`;
            if (sec.content) {
                md += `${sec.content}\n\n`;
            }
            if (sec.codeSnippet) {
                const lang = sec.language || "javascript";
                md += `\`\`\`${lang}\n${sec.codeSnippet.trim()}\n\`\`\`\n\n`;
            }
        });
    }

    return md.trim();
}

/**
 * Prepare prompt context snippet considering transcript length limits
 */
function buildPromptContextSection(context) {
    let text = `Lecture Information:\n`;
    text += `- Course: "${context.courseTitle}" (${context.courseCategory}, ${context.courseLevel} level)\n`;
    text += `- Lecture #${context.lectureNumber}: "${context.lectureTitle}"\n`;
    text += `- Topic: "${context.concept}"\n`;
    text += `- Programming Language: "${context.language}"\n`;

    if (context.hasTranscript && context.transcriptText) {
        const trimmedTranscript = context.transcriptText.slice(0, 5000);
        text += `\n[PRIMARY SOURCE - LECTURE TRANSCRIPT (Language: ${context.transcriptLanguage})]:\n"""\n${trimmedTranscript}\n"""\n`;
        text += `\nINSTRUCTION: Synthesize and ground the output strictly in the explanations given in this transcript.\n`;
    } else {
        text += `\n[SOURCE STATUS]: Video transcript is unavailable for this video.\n`;
        text += `INSTRUCTION: Base your educational content strictly on the verified course subject, lecture title, and syllabus context.\n`;
        if (context.syllabusNotes) {
            text += `- Syllabus Guidelines: "${context.syllabusNotes}"\n`;
        }
    }

    return text;
}

/**
 * Generate Structured Educational Notes using Groq AI
 *
 * @param {Object} context - Resolved lecture context
 * @returns {Promise<Object>} Saved LectureContent draft document
 */
async function generateAINotes(context) {
    const systemPrompt =
        "You are an expert technical curriculum author and software engineering educator at NGSkillForge. " +
        "Your goal is to produce high-quality, structured, and pedagogical notes in valid JSON format. " +
        (context.hasTranscript
            ? "Ground the content primarily in the provided video transcript."
            : "Use the verified lecture topic, course metadata, and standard software engineering principles.") +
        " You must return ONLY a valid JSON object matching the requested schema.";

    const contextSection = buildPromptContextSection(context);

    const userPrompt = `${contextSection}

Generate a comprehensive educational notes JSON object with the following schema:
{
  "title": "${context.concept}",
  "overview": "Clear 2-3 sentence overview explaining what this topic is, why it matters, and when to use it.",
  "sections": [
    {
      "heading": "Conceptual explanation or sub-topic name",
      "content": "Detailed educational explanation with best practices.",
      "codeSnippet": "Working, clean, well-commented code example illustrating this exact concept.",
      "language": "${context.language}"
    },
    {
      "heading": "Practical Application / Syntax Rules",
      "content": "Step-by-step breakdown of usage rules and real-world patterns.",
      "codeSnippet": "Additional code demonstration or pattern.",
      "language": "${context.language}"
    }
  ],
  "importantPoints": [
    "Key rule or common pitfall to keep in mind",
    "Performance or syntax guideline"
  ],
  "importantNote": "A critical tip or caveat developers should remember when using ${context.concept}.",
  "keyTakeaways": [
    "Core takeaway 1 about ${context.concept}",
    "Core takeaway 2",
    "Core takeaway 3",
    "Core takeaway 4"
  ],
  "usefulResources": [
    {
      "title": "MDN Web Docs / Official Documentation",
      "url": "https://developer.mozilla.org/"
    },
    {
      "title": "DevDocs Documentation Reference",
      "url": "https://devdocs.io/"
    }
  ]
}`;

    const completion = await generateChatCompletion({
        systemPrompt,
        prompt: userPrompt,
        temperature: 0.5,
        maxTokens: 850,
        responseFormat: { type: "json_object" },
    });

    let parsed;
    try {
        parsed = safeParseJSON(completion.text);
    } catch (parseErr) {
        const err = new Error("AI service returned an unparseable response. Content generation failed.");
        err.statusCode = 502;
        throw err;
    }

    if (!parsed.title || !Array.isArray(parsed.sections)) {
        const err = new Error("AI service returned an invalid notes structure. Missing required sections.");
        err.statusCode = 502;
        throw err;
    }

    const markdownNotes = buildMarkdownNotes(parsed);
    const sourceContext = buildSourceContextMetadata(context);

    const savedDoc = await LectureContent.findOneAndUpdate(
        {
            courseId: context.courseId,
            lectureNumber: context.lectureNumber,
        },
        {
            $set: {
                lectureId: context.lectureId,
                courseId: context.courseId,
                lectureNumber: context.lectureNumber,
                status: "draft",
                generatedBy: "ai",
                notes: markdownNotes,
                structuredNotes: parsed,
                keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
                importantNote: parsed.importantNote || "",
                usefulResources: Array.isArray(parsed.usefulResources) ? parsed.usefulResources : [],
                sourceContext,
            },
        },
        { upsert: true, returnDocument: "after" }
    );

    return {
        contentDoc: savedDoc,
        structuredNotes: parsed,
        markdownNotes,
        sourceContext,
    };
}

/**
 * Generate Hands-on Practice Tasks using Groq AI
 *
 * @param {Object} context - Resolved lecture context
 * @param {Object} [options]
 * @param {number} [options.count=3] - Number of tasks to generate (1 to 10)
 * @returns {Promise<Object>} Saved LectureContent draft document
 */
async function generateAITasks(context, { count = 3 } = {}) {
    const validCount = Math.max(1, Math.min(10, Number(count) || 3));

    const systemPrompt =
        "You are an expert technical coding mentor at NGSkillForge. " +
        "Generate practical, realistic hands-on coding tasks based on the lecture content. " +
        (context.hasTranscript
            ? "Incorporate code patterns and exercises directly matching the lecture transcript."
            : "Use standard industry patterns for this verified topic.") +
        " Keep starter code and solutions clean, concise, and focused (under 25 lines per task). " +
        "You must return ONLY a valid JSON object matching the requested schema.";

    const contextSection = buildPromptContextSection(context);

    const userPrompt = `${contextSection}

Generate an array of exactly ${validCount} progressive practical coding tasks (from Easy to Medium/Hard) based on this lecture. Keep each task concise and compact (short description, 2 requirements, 2-line starter, 3-line solution) so all ${validCount} tasks fit in JSON:
{
  "tasks": [
    {
      "title": "Task 1: [Short Title]",
      "description": "1-2 sentence problem statement.",
      "difficulty": "Easy",
      "expectedLearningOutcome": "Short learning outcome.",
      "requirements": ["Requirement 1", "Requirement 2"],
      "starterCode": "// Starter code snippet",
      "solution": "// Concise working solution",
      "hints": ["Helpful tip"]
    }
  ]
}`;

    const completion = await generateChatCompletion({
        systemPrompt,
        prompt: userPrompt,
        temperature: 0.5,
        maxTokens: 850,
        responseFormat: { type: "json_object" },
    });

    let parsed;
    try {
        parsed = safeParseJSON(completion.text);
    } catch (parseErr) {
        const err = new Error("AI service returned an unparseable response for practice tasks.");
        err.statusCode = 502;
        throw err;
    }

    if (!Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
        const err = new Error("AI service returned an invalid tasks structure.");
        err.statusCode = 502;
        throw err;
    }

    const normalizedTasks = parsed.tasks.map((task, idx) => ({
        title: task.title || `Task ${idx + 1}: Practice Exercise`,
        description: task.description || "Solve the exercise as described.",
        difficulty: ["Easy", "Medium", "Hard"].includes(task.difficulty) ? task.difficulty : "Easy",
        expectedLearningOutcome: task.expectedLearningOutcome || "",
        requirements: Array.isArray(task.requirements) ? task.requirements : [],
        starterCode: task.starterCode || "",
        solution: task.solution || "",
        hints: Array.isArray(task.hints) ? task.hints : [],
    }));

    const sourceContext = buildSourceContextMetadata(context);

    const savedDoc = await LectureContent.findOneAndUpdate(
        {
            courseId: context.courseId,
            lectureNumber: context.lectureNumber,
        },
        {
            $set: {
                lectureId: context.lectureId,
                courseId: context.courseId,
                lectureNumber: context.lectureNumber,
                status: "draft",
                generatedBy: "ai",
                tasks: normalizedTasks,
                sourceContext,
            },
        },
        { upsert: true, returnDocument: "after" }
    );

    return {
        contentDoc: savedDoc,
        tasks: normalizedTasks,
        sourceContext,
    };
}

/**
 * Generate Multiple Choice Quiz Questions using Groq AI
 *
 * @param {Object} context - Resolved lecture context
 * @param {Object} [options]
 * @param {number} [options.count=5] - Number of MCQs to generate (1 to 10)
 * @returns {Promise<Object>} Saved LectureContent draft document
 */
async function generateAIMCQs(context, { count = 5 } = {}) {
    const validCount = Math.max(1, Math.min(10, Number(count) || 5));

    const systemPrompt =
        "You are an expert technical assessment creator at NGSkillForge. " +
        "Generate rigorous, high-quality multiple choice quiz questions based on the lecture content. " +
        (context.hasTranscript
            ? "Base questions on key explanations and examples from the video transcript."
            : "Base questions on core concepts of the verified topic.") +
        " Every question must have exactly one correct answer (index 0, 1, 2, or 3). " +
        "You must return ONLY a valid JSON object matching the requested schema.";

    const contextSection = buildPromptContextSection(context);

    const userPrompt = `${contextSection}

Generate an array of exactly ${validCount} multiple-choice quiz questions based on this lecture. Keep questions, options, and explanations concise (1-2 sentences each) so all ${validCount} questions fit in JSON:
{
  "mcqs": [
    {
      "question": "Clear concise question based on the lecture?",
      "codeSnippet": "",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Brief 1-sentence explanation why this option is correct.",
      "difficulty": "Easy"
    }
  ]
}`;

    const completion = await generateChatCompletion({
        systemPrompt,
        prompt: userPrompt,
        temperature: 0.5,
        maxTokens: 850,
        responseFormat: { type: "json_object" },
    });

    let parsed;
    try {
        parsed = safeParseJSON(completion.text);
    } catch (parseErr) {
        const err = new Error("AI service returned an unparseable response for MCQs.");
        err.statusCode = 502;
        throw err;
    }

    if (!Array.isArray(parsed.mcqs) || parsed.mcqs.length === 0) {
        const err = new Error("AI service returned an invalid MCQs structure.");
        err.statusCode = 502;
        throw err;
    }

    const normalizedMCQs = parsed.mcqs.map((q, idx) => {
        const options = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["Option A", "Option B", "Option C", "Option D"];
        let correctIdx = Number(q.correctAnswer);
        if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= options.length) {
            correctIdx = 0;
        }

        return {
            question: q.question || `Question ${idx + 1}: Conceptual assessment`,
            codeSnippet: q.codeSnippet || "",
            options,
            correctAnswer: correctIdx,
            explanation: q.explanation || "Correct answer based on standard language conventions.",
            difficulty: ["Easy", "Medium", "Hard"].includes(q.difficulty) ? q.difficulty : "Medium",
        };
    });

    const sourceContext = buildSourceContextMetadata(context);

    const savedDoc = await LectureContent.findOneAndUpdate(
        {
            courseId: context.courseId,
            lectureNumber: context.lectureNumber,
        },
        {
            $set: {
                lectureId: context.lectureId,
                courseId: context.courseId,
                lectureNumber: context.lectureNumber,
                status: "draft",
                generatedBy: "ai",
                mcqs: normalizedMCQs,
                sourceContext,
            },
        },
        { upsert: true, returnDocument: "after" }
    );

    return {
        contentDoc: savedDoc,
        mcqs: normalizedMCQs,
        sourceContext,
    };
}

module.exports = {
    resolveLectureContext,
    extractConcept,
    detectLanguage,
    buildMarkdownNotes,
    generateAINotes,
    generateAITasks,
    generateAIMCQs,
};
