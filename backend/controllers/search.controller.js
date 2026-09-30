const mongoose = require("mongoose");
const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");
const LectureContent = require("../models/lectureContent.model");

/**
 * Escape special regex characters safely
 */
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Calculate relevance score for search ranking
 */
function calculateRelevance(title = "", description = "", query = "") {
    const cleanTitle = (title || "").toLowerCase();
    const cleanDesc = (description || "").toLowerCase();
    const cleanQ = (query || "").toLowerCase();

    let score = 0;
    if (cleanTitle === cleanQ) score += 100;
    else if (cleanTitle.startsWith(cleanQ)) score += 60;
    else if (new RegExp(`\\b${escapeRegex(cleanQ)}\\b`, "i").test(cleanTitle)) score += 40;
    else if (cleanTitle.includes(cleanQ)) score += 25;

    if (new RegExp(`\\b${escapeRegex(cleanQ)}\\b`, "i").test(cleanDesc)) score += 15;
    else if (cleanDesc.includes(cleanQ)) score += 5;

    return score;
}

/**
 * Extract context snippet containing matched keyword
 */
function extractSnippet(text = "", query = "", maxLen = 140) {
    if (!text || !query) return "";
    const cleanText = text.replace(/[#*`_~>\-[\]()]/g, " ").replace(/\s+/g, " ").trim();
    const idx = cleanText.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return cleanText.slice(0, maxLen) + (cleanText.length > maxLen ? "..." : "");

    const start = Math.max(0, idx - 40);
    const end = Math.min(cleanText.length, idx + query.length + 80);
    let snippet = cleanText.slice(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < cleanText.length) snippet = snippet + "...";
    return snippet;
}

/**
 * GET /api/search
 * Global platform search across published Courses, Lectures, Notes, Tasks, and MCQs
 */
const globalSearch = async (req, res) => {
    try {
        const { q = "", type = "all", limit = 30 } = req.query;
        const cleanQuery = q.trim();

        if (!cleanQuery) {
            return res.status(200).json({
                success: true,
                query: "",
                totalResults: 0,
                results: {
                    courses: [],
                    lectures: [],
                    notes: [],
                    tasks: [],
                    mcqs: [],
                },
            });
        }

        const regex = new RegExp(escapeRegex(cleanQuery), "i");
        const maxLimit = Math.min(50, Math.max(1, Number(limit) || 30));

        const searchCourses = type === "all" || type === "courses" || type === "course";
        const searchLectures = type === "all" || type === "lectures" || type === "lecture";
        const searchNotes = type === "all" || type === "notes" || type === "note";
        const searchTasks = type === "all" || type === "tasks" || type === "task";
        const searchMCQs = type === "all" || type === "mcqs" || type === "mcq";

        // 1. Search Courses
        let coursesResults = [];
        if (searchCourses) {
            const courses = await Course.find({
                $or: [
                    { title: regex },
                    { description: regex },
                    { category: regex },
                    { tags: regex },
                ],
            })
                .select("title description category level thumbnail duration slug")
                .limit(maxLimit);

            coursesResults = courses.map((c) => ({
                _id: c._id,
                title: c.title,
                category: c.category || "General",
                level: c.level || "All Levels",
                duration: c.duration || "",
                thumbnail: c.thumbnail || "",
                description: extractSnippet(c.description, cleanQuery),
                type: "course",
                badge: "Course",
                url: `/courses/${c._id}`,
                relevance: calculateRelevance(c.title, c.description, cleanQuery),
            }));
        }

        // 2. Search Lectures
        let lecturesResults = [];
        if (searchLectures) {
            const lectures = await Lecture.find({
                $or: [
                    { title: regex },
                    { moduleTitle: regex },
                ],
            })
                .populate("courseId", "title category thumbnail")
                .limit(maxLimit);

            lecturesResults = lectures
                .filter((l) => l.courseId != null)
                .map((l) => ({
                    _id: l._id,
                    lectureNumber: l.lectureNumber,
                    title: l.title,
                    moduleTitle: l.moduleTitle || "",
                    courseId: l.courseId._id,
                    courseTitle: l.courseId.title,
                    thumbnail: l.thumbnailUrl || l.courseId.thumbnail,
                    type: "lecture",
                    badge: "Lecture",
                    url: `/courses/${l.courseId._id}/learn/${l.lectureNumber}`,
                    relevance: calculateRelevance(l.title, l.moduleTitle, cleanQuery),
                }));
        }

        // 3. Search Published Lecture Contents (Notes, Tasks, MCQs)
        let notesResults = [];
        let tasksResults = [];
        let mcqsResults = [];

        if (searchNotes || searchTasks || searchMCQs) {
            // Strictly fetch only PUBLISHED content
            const publishedContents = await LectureContent.find({
                status: "published",
                $or: [
                    { notes: regex },
                    { "structuredNotes.title": regex },
                    { "structuredNotes.overview": regex },
                    { "structuredNotes.sections.heading": regex },
                    { "structuredNotes.sections.content": regex },
                    { "tasks.title": regex },
                    { "tasks.description": regex },
                    { "mcqs.question": regex },
                ],
            })
                .populate("lectureId", "title lectureNumber")
                .populate("courseId", "title category")
                .limit(maxLimit * 2);

            for (const content of publishedContents) {
                if (!content.courseId || !content.lectureId) continue;

                const cTitle = content.courseId.title;
                const cId = content.courseId._id;
                const lNum = content.lectureNumber || content.lectureId.lectureNumber || 1;
                const lTitle = content.lectureId.title || `Lecture #${lNum}`;

                // Process Notes matches
                if (searchNotes) {
                    let hasNoteMatch = false;
                    let matchedSnippet = "";
                    let noteTitle = content.structuredNotes?.title || `${lTitle} Notes`;

                    if (content.notes && regex.test(content.notes)) {
                        hasNoteMatch = true;
                        matchedSnippet = extractSnippet(content.notes, cleanQuery);
                    } else if (content.structuredNotes?.overview && regex.test(content.structuredNotes.overview)) {
                        hasNoteMatch = true;
                        matchedSnippet = extractSnippet(content.structuredNotes.overview, cleanQuery);
                    } else if (Array.isArray(content.structuredNotes?.sections)) {
                        const sec = content.structuredNotes.sections.find(
                            (s) => regex.test(s.heading) || regex.test(s.content)
                        );
                        if (sec) {
                            hasNoteMatch = true;
                            matchedSnippet = extractSnippet(sec.heading + " " + sec.content, cleanQuery);
                            if (regex.test(sec.heading)) noteTitle = sec.heading;
                        }
                    }

                    if (hasNoteMatch) {
                        notesResults.push({
                            _id: content._id,
                            title: noteTitle,
                            subtitle: `${cTitle} • Lecture #${lNum}`,
                            snippet: matchedSnippet,
                            courseId: cId,
                            courseTitle: cTitle,
                            lectureNumber: lNum,
                            type: "note",
                            badge: "Note",
                            url: `/courses/${cId}/learn/${lNum}?tab=notes`,
                            relevance: calculateRelevance(noteTitle, matchedSnippet, cleanQuery),
                        });
                    }
                }

                // Process Tasks matches
                if (searchTasks && Array.isArray(content.tasks)) {
                    content.tasks.forEach((t) => {
                        if (regex.test(t.title) || regex.test(t.description)) {
                            tasksResults.push({
                                _id: t._id || `${content._id}-task`,
                                title: t.title,
                                description: extractSnippet(t.description, cleanQuery),
                                difficulty: t.difficulty || "Easy",
                                subtitle: `${cTitle} • Lecture #${lNum}`,
                                courseId: cId,
                                courseTitle: cTitle,
                                lectureNumber: lNum,
                                type: "task",
                                badge: "Task",
                                url: `/courses/${cId}/learn/${lNum}?tab=tasks`,
                                relevance: calculateRelevance(t.title, t.description, cleanQuery),
                            });
                        }
                    });
                }

                // Process MCQs matches (NEVER expose correct answers or explanations!)
                if (searchMCQs && Array.isArray(content.mcqs)) {
                    content.mcqs.forEach((m) => {
                        if (regex.test(m.question)) {
                            mcqsResults.push({
                                _id: m._id || `${content._id}-mcq`,
                                question: m.question,
                                difficulty: m.difficulty || "Medium",
                                subtitle: `${cTitle} • Lecture #${lNum}`,
                                courseId: cId,
                                courseTitle: cTitle,
                                lectureNumber: lNum,
                                type: "mcq",
                                badge: "MCQ",
                                url: `/courses/${cId}/learn/${lNum}?tab=mcqs`,
                                relevance: calculateRelevance(m.question, "", cleanQuery),
                            });
                        }
                    });
                }
            }
        }

        // Sort each result group by relevance score descending
        coursesResults.sort((a, b) => b.relevance - a.relevance);
        lecturesResults.sort((a, b) => b.relevance - a.relevance);
        notesResults.sort((a, b) => b.relevance - a.relevance);
        tasksResults.sort((a, b) => b.relevance - a.relevance);
        mcqsResults.sort((a, b) => b.relevance - a.relevance);

        const totalResults =
            coursesResults.length +
            lecturesResults.length +
            notesResults.length +
            tasksResults.length +
            mcqsResults.length;

        return res.status(200).json({
            success: true,
            query: cleanQuery,
            typeFilter: type,
            totalResults,
            results: {
                courses: coursesResults,
                lectures: lecturesResults,
                notes: notesResults,
                tasks: tasksResults,
                mcqs: mcqsResults,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to search right now. Please try again.",
            error: error.message,
        });
    }
};

module.exports = {
    globalSearch,
};
