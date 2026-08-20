require("dotenv").config();

const mongoose = require("mongoose");
const Course = require("../models/course.model");

const courses = [
    {
        title: "JavaScript Foundations",
        description: "Build a strong JavaScript foundation through hands-on exercises covering syntax, functions, arrays, objects, and modern browser APIs.",
        instructor: "Maya Okafor",
        price: 0,
        category: "Frontend",
        level: "Beginner",
        duration: "6 weeks",
    },
    {
        title: "React Interface Workshop",
        description: "Create responsive React interfaces with reusable components, state management, API integration, and practical accessibility patterns.",
        instructor: "Daniel Mensah",
        price: 49,
        category: "Frontend",
        level: "Intermediate",
        duration: "8 weeks",
    },
    {
        title: "Node.js API Engineering",
        description: "Design production-minded REST APIs with Node.js, Express, MongoDB, authentication, validation, and reliable error handling.",
        instructor: "Aisha Bello",
        price: 59,
        category: "Backend",
        level: "Intermediate",
        duration: "8 weeks",
    },
    {
        title: "MongoDB Data Modeling",
        description: "Learn how to model document data, write effective queries, create indexes, and structure MongoDB collections for growing applications.",
        instructor: "Chinedu Eze",
        price: 39,
        category: "Database",
        level: "Intermediate",
        duration: "5 weeks",
    },
    {
        title: "Git and Collaborative Development",
        description: "Work confidently with Git branches, pull requests, code reviews, merge conflict resolution, and team-friendly commit practices.",
        instructor: "Tara Williams",
        price: 0,
        category: "Tools",
        level: "Beginner",
        duration: "3 weeks",
    },
    {
        title: "Full-Stack Project Lab",
        description: "Bring your skills together by planning, building, testing, and deploying a complete learning platform with a React frontend and Node.js backend.",
        instructor: "Ibrahim Yusuf",
        price: 79,
        category: "Full Stack",
        level: "Advanced",
        duration: "10 weeks",
    },
];

async function seedCourses() {
    await mongoose.connect(process.env.MONGO_URI);

    let inserted = 0;
    for (const courseData of courses) {
        const existingCourse = await Course.exists({ title: courseData.title });
        if (!existingCourse) {
            await Course.create(courseData);
            inserted += 1;
        }
    }

    console.log(`Course seed complete: ${inserted} course(s) added.`);
    await mongoose.disconnect();
}

seedCourses().catch(async (error) => {
    console.error("Course seed failed:", error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
});