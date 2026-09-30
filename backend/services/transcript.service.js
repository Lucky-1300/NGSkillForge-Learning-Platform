const mongoose = require("mongoose");
const { YoutubeTranscript } = require("youtube-transcript");
const Lecture = require("../models/lecture.model");
const LectureTranscript = require("../models/lectureTranscript.model");

/**
 * Decode common HTML entities and normalize transcript text
 */
function cleanSegmentText(text) {
    if (!text) return "";
    return text
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Combine array of transcript segments into clean, readable paragraphs
 */
function normalizeTranscriptSegments(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
        return {
            fullText: "",
            cleanedSegments: [],
        };
    }

    const cleanedSegments = [];
    const textPieces = [];

    for (const seg of segments) {
        const cleaned = cleanSegmentText(seg.text);
        if (cleaned) {
            cleanedSegments.push({
                text: cleaned,
                start: typeof seg.offset === "number" ? Math.round(seg.offset / 1000) : (Number(seg.start) || 0),
                duration: typeof seg.duration === "number" ? Math.round(seg.duration / 1000) : (Number(seg.duration) || 0),
            });
            textPieces.push(cleaned);
        }
    }

    const fullText = textPieces.join(" ");

    return {
        fullText,
        cleanedSegments,
    };
}

/**
 * Fetch raw transcript from YouTube timedtext caption track
 */
async function fetchYoutubeCaptions(videoId) {
    if (!videoId || typeof videoId !== "string") {
        throw new Error("Invalid YouTube video ID provided.");
    }

    const cleanId = videoId.trim();

    // Try default / auto language caption track
    try {
        const segments = await YoutubeTranscript.fetchTranscript(cleanId);
        if (Array.isArray(segments) && segments.length > 0) {
            return {
                segments,
                language: "auto",
            };
        }
    } catch (err) {
        // Fallback: try explicit language tracks if needed (e.g. 'en', 'hi')
        try {
            const enSegments = await YoutubeTranscript.fetchTranscript(cleanId, { lang: "en" });
            if (Array.isArray(enSegments) && enSegments.length > 0) {
                return {
                    segments: enSegments,
                    language: "en",
                };
            }
        } catch {}

        try {
            const hiSegments = await YoutubeTranscript.fetchTranscript(cleanId, { lang: "hi" });
            if (Array.isArray(hiSegments) && hiSegments.length > 0) {
                return {
                    segments: hiSegments,
                    language: "hi",
                };
            }
        } catch {}

        // Propagate error indicating captions are disabled/unavailable
        const transcriptError = new Error(err.message || "Captions are unavailable for this video.");
        transcriptError.code = "TRANSCRIPT_UNAVAILABLE";
        throw transcriptError;
    }

    const notFoundError = new Error("No caption tracks found for this video.");
    notFoundError.code = "TRANSCRIPT_UNAVAILABLE";
    throw notFoundError;
}

/**
 * Get or extract transcript for a lecture by lectureId
 *
 * @param {string} lectureId - MongoDB ObjectId of the Lecture
 * @param {Object} [options]
 * @param {boolean} [options.forceRefresh=false] - Force re-fetch from YouTube
 * @returns {Promise<Object>} Transcript result object
 */
async function getLectureTranscript(lectureId, { forceRefresh = false } = {}) {
    if (!lectureId) {
        return {
            success: false,
            reason: "INVALID_LECTURE_ID",
            message: "Validation Error: 'lectureId' is required.",
        };
    }

    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
        return {
            success: false,
            reason: "INVALID_LECTURE_ID_FORMAT",
            message: `Invalid lecture ID format '${lectureId}'.`,
        };
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        return {
            success: false,
            reason: "LECTURE_NOT_FOUND",
            message: `Lecture not found with ID '${lectureId}'.`,
        };
    }

    // Check existing stored transcript in database if not forcing refresh
    if (!forceRefresh) {
        const existingTranscript = await LectureTranscript.findOne({
            lectureId: lecture._id,
        });

        if (existingTranscript) {
            if (existingTranscript.status === "available" && existingTranscript.transcriptText) {
                return {
                    success: true,
                    lectureId: lecture._id,
                    videoId: lecture.youtubeVideoId,
                    courseId: lecture.courseId,
                    transcriptText: existingTranscript.transcriptText,
                    language: existingTranscript.language,
                    source: existingTranscript.source,
                    segmentCount: existingTranscript.segmentCount,
                    characterCount: existingTranscript.characterCount,
                    cached: true,
                };
            }

            if (existingTranscript.status === "unavailable") {
                return {
                    success: false,
                    lectureId: lecture._id,
                    videoId: lecture.youtubeVideoId,
                    courseId: lecture.courseId,
                    reason: "TRANSCRIPT_UNAVAILABLE",
                    message: existingTranscript.failureReason || "Captions/transcript are not available or disabled for this YouTube video.",
                    cached: true,
                };
            }
        }
    }

    // Attempt to retrieve captions from YouTube
    try {
        const { segments, language } = await fetchYoutubeCaptions(lecture.youtubeVideoId);
        const { fullText, cleanedSegments } = normalizeTranscriptSegments(segments);

        if (!fullText || fullText.trim().length === 0) {
            await LectureTranscript.findOneAndUpdate(
                { lectureId: lecture._id },
                {
                    $set: {
                        lectureId: lecture._id,
                        videoId: lecture.youtubeVideoId,
                        courseId: lecture.courseId,
                        status: "unavailable",
                        failureReason: "EMPTY_CAPTION_TRACK",
                    },
                },
                { upsert: true }
            );

            return {
                success: false,
                lectureId: lecture._id,
                videoId: lecture.youtubeVideoId,
                courseId: lecture.courseId,
                reason: "TRANSCRIPT_UNAVAILABLE",
                message: "Caption track exists but contains no readable text.",
            };
        }

        // Save available transcript to MongoDB
        const savedDoc = await LectureTranscript.findOneAndUpdate(
            { lectureId: lecture._id },
            {
                $set: {
                    lectureId: lecture._id,
                    videoId: lecture.youtubeVideoId,
                    courseId: lecture.courseId,
                    transcriptText: fullText,
                    segments: cleanedSegments.slice(0, 300), // store up to 300 timed segments
                    language: language || "auto",
                    source: "youtube-captions",
                    status: "available",
                    failureReason: "",
                    segmentCount: cleanedSegments.length,
                    characterCount: fullText.length,
                },
            },
            { upsert: true, returnDocument: "after" }
        );

        return {
            success: true,
            lectureId: lecture._id,
            videoId: lecture.youtubeVideoId,
            courseId: lecture.courseId,
            transcriptText: savedDoc.transcriptText,
            language: savedDoc.language,
            source: savedDoc.source,
            segmentCount: savedDoc.segmentCount,
            characterCount: savedDoc.characterCount,
            cached: false,
        };
    } catch (fetchErr) {
        // Record unavailable status to avoid repeated failing requests
        await LectureTranscript.findOneAndUpdate(
            { lectureId: lecture._id },
            {
                $set: {
                    lectureId: lecture._id,
                    videoId: lecture.youtubeVideoId,
                    courseId: lecture.courseId,
                    transcriptText: "",
                    segments: [],
                    status: "unavailable",
                    failureReason: fetchErr.message || "TRANSCRIPT_UNAVAILABLE",
                },
            },
            { upsert: true }
        );

        return {
            success: false,
            lectureId: lecture._id,
            videoId: lecture.youtubeVideoId,
            courseId: lecture.courseId,
            reason: "TRANSCRIPT_UNAVAILABLE",
            message: "Captions/transcript are not available or disabled for this YouTube video.",
            details: fetchErr.message,
        };
    }
}

module.exports = {
    getLectureTranscript,
    fetchYoutubeCaptions,
    normalizeTranscriptSegments,
};
