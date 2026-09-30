require("dotenv").config({ path: __dirname + "/../.env" });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");
const { fetchPlaylistVideos } = require("../services/youtube.service");

/**
 * Reusable Course to YouTube Playlist Mapping Catalog
 * To add a new course playlist in the future, simply add an entry below:
 */
const PLAYLIST_MAPPINGS = [
    {
        courseTitle: "HTML5 Foundations",
        playlistId: "PLwmDa-QvqlfgD_EU7KFRiB2YUn_wSnxW4",
        playlistUrl: "https://youtube.com/playlist?list=PLwmDa-QvqlfgD_EU7KFRiB2YUn_wSnxW4",
    },
    {
        courseTitle: "JavaScript Foundations",
        playlistId: "PLQEaRBV9gAFuf-27K64l7-hV7o0fr9zx7",
        playlistUrl: "https://youtube.com/playlist?list=PLQEaRBV9gAFuf-27K64l7-hV7o0fr9zx7",
    },
    {
        courseTitle: "CSS3 & Modern Layouts",
        playlistId: "PL0b6OzIxLPbzDsI5YXUa01QzxOWyqmrWw",
        playlistUrl: "https://youtube.com/playlist?list=PL0b6OzIxLPbzDsI5YXUa01QzxOWyqmrWw",
    },
    {
        courseTitle: "MongoDB Data Modeling",
        playlistId: "PL0b6OzIxLPbysebQ-yBd7ZHYGPMuFvvyD",
        playlistUrl: "https://youtube.com/playlist?list=PL0b6OzIxLPbysebQ-yBd7ZHYGPMuFvvyD",
    },
    {
        courseTitle: "React Interface Workshop",
        playlistId: "PL0b6OzIxLPbzGtrDFaF6uoC33cPNHDmeV",
        playlistUrl: "https://youtube.com/playlist?list=PL0b6OzIxLPbzGtrDFaF6uoC33cPNHDmeV",
    },
    {
        courseTitle: "Node.js API Engineering",
        playlistId: "PL8p2I9GklV47KZEsbFEfRcM0sUsOMe5Sp",
        playlistUrl: "https://youtube.com/playlist?list=PL8p2I9GklV47KZEsbFEfRcM0sUsOMe5Sp",
    },
    {
        courseTitle: "Git and Collaborative Development",
        playlistId: "PLA3GkZPtsafYYWC-N6vicOLP0w-4fiQ2S",
        playlistUrl: "https://youtube.com/playlist?list=PLA3GkZPtsafYYWC-N6vicOLP0w-4fiQ2S",
    },
    {
        courseTitle: "MySQL Database & SQL Mastery",
        playlistId: "PLGf6Ram2AQh2GpckMjstVH6AaTm0kPfgI",
        playlistUrl: "https://youtube.com/playlist?list=PLGf6Ram2AQh2GpckMjstVH6AaTm0kPfgI",
    },
    // Future course mappings:
    // { courseTitle: "Express.js Framework & REST APIs", playlistId: "YOUR_PLAYLIST_ID" },
    // { courseTitle: "Artificial Intelligence & Machine Learning", playlistId: "YOUR_PLAYLIST_ID" },
    // { courseTitle: "Full-Stack Project Lab", playlistId: "YOUR_PLAYLIST_ID" },
    // { courseTitle: "Data Structures & Algorithms (DSA)", playlistId: "YOUR_PLAYLIST_ID" },
];

async function seedAllLectures() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Atlas Connected ✅\n");

        for (const mapping of PLAYLIST_MAPPINGS) {
            console.log(`=======================================================`);
            console.log(`Processing Course: "${mapping.courseTitle}"`);
            console.log(`Playlist ID: ${mapping.playlistId}`);
            console.log(`=======================================================`);

            const course = await Course.findOne({
                title: new RegExp(`^${mapping.courseTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
            });

            if (!course) {
                console.warn(`⚠️ Course "${mapping.courseTitle}" not found in database. Skipping...`);
                continue;
            }

            console.log(`Found Course Record: ${course.title} (_id: ${course._id})`);
            console.log(`Fetching playlist videos from YouTube...`);

            const videos = await fetchPlaylistVideos(mapping.playlistId);
            console.log(`Fetched ${videos.length} videos from YouTube playlist.\n`);

            let insertedCount = 0;
            let updatedCount = 0;

            for (const video of videos) {
                const existing = await Lecture.findOne({
                    courseId: course._id,
                    lectureNumber: video.lectureNumber,
                });

                if (!existing) {
                    await Lecture.create({
                        courseId: course._id,
                        lectureNumber: video.lectureNumber,
                        title: video.title,
                        youtubeVideoId: video.youtubeVideoId,
                        youtubeUrl: video.youtubeUrl,
                        thumbnailUrl: video.thumbnailUrl,
                        duration: video.duration,
                        playlistId: video.playlistId,
                    });
                    insertedCount++;
                } else {
                    await Lecture.updateOne(
                        { _id: existing._id },
                        {
                            $set: {
                                title: video.title,
                                youtubeVideoId: video.youtubeVideoId,
                                youtubeUrl: video.youtubeUrl,
                                thumbnailUrl: video.thumbnailUrl,
                                duration: video.duration,
                                playlistId: video.playlistId,
                            },
                        }
                    );
                    updatedCount++;
                }

                console.log(
                    `  #${String(video.lectureNumber).padStart(2, "0")}: ${video.title} | ${video.duration} | [${video.youtubeVideoId}]`
                );
            }

            // Remove any excess or stale lectures that are no longer in the playlist
            const validVideoIds = videos.map((v) => v.youtubeVideoId);
            const deleted = await Lecture.deleteMany({
                courseId: course._id,
                youtubeVideoId: { $nin: validVideoIds },
            });
            if (deleted.deletedCount > 0) {
                console.log(`  🧹 Cleaned up ${deleted.deletedCount} outdated/non-video items.`);
            }

            const totalInDb = await Lecture.countDocuments({ courseId: course._id });
            console.log(`\n🎉 Seeded "${course.title}": Added ${insertedCount}, Updated ${updatedCount}, Total in DB: ${totalInDb}\n`);
        }

        console.log("=======================================================");
        console.log("All YouTube lecture playlists processed successfully!");
        console.log("=======================================================\n");

        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    } catch (err) {
        console.error("Error seeding lectures:", err);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedAllLectures();
