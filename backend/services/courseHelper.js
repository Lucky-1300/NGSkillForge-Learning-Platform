const mongoose = require("mongoose");
const Course = require("../models/course.model");

/**
 * Helper to resolve Course by ObjectId or title
 */
async function resolveCourse(identifier) {
    if (!identifier) return null;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        const byId = await Course.findById(identifier);
        if (byId) return byId;
    }
    const cleanTitle = identifier.replace(/-/g, " ");
    return await Course.findOne({
        title: new RegExp(`^${cleanTitle}$`, "i"),
    });
}

/**
 * Group flat lectures array into pedagogical modules
 */
function groupLecturesIntoModules(lectures, course) {
    if (!lectures || !lectures.length) return [];

    const courseTitle = (course?.title || "").toLowerCase();
    const totalLectures = lectures.length;

    // Subject-specific tailored module definitions
    if (courseTitle.includes("css")) {
        const cssModuleDefs = [
            { name: "CSS Basics", count: 4 },
            { name: "CSS Box Model", count: 5 },
            { name: "CSS Flexbox", count: 6 },
            { name: "CSS Grid Layouts", count: 8 },
            { name: "CSS Positioning & Float", count: 8 },
            { name: "CSS Transitions & Transforms", count: 10 },
            { name: "CSS Animations & Effects", count: 12 },
            { name: "Responsive Design & Media Queries", count: 14 },
            { name: "Modern Layouts & Projects", count: 999 },
        ];

        const modules = [];
        let curIdx = 0;
        let modNum = 1;

        for (const def of cssModuleDefs) {
            if (curIdx >= totalLectures) break;
            const sliceEnd = Math.min(curIdx + def.count, totalLectures);
            const modLectures = lectures.slice(curIdx, sliceEnd);
            if (!modLectures.length) break;

            modules.push({
                moduleNumber: modNum,
                title: `Module ${modNum}: ${def.name}`,
                startLecture: modLectures[0].lectureNumber,
                endLecture: modLectures[modLectures.length - 1].lectureNumber,
                totalLectures: modLectures.length,
                lectures: modLectures,
            });

            curIdx = sliceEnd;
            modNum++;
        }
        return modules;
    }

    // Default dynamic module generator for other courses
    let moduleNames = [
        "Introduction & Fundamentals",
        "Core Concepts & Syntax",
        "Intermediate Techniques & Architecture",
        "Advanced Patterns & Optimization",
        "Real-World Projects & Best Practices",
        "Ecosystem Tools & Production Mastery",
        "Performance, Security & Deployment",
        "Expert Capstone & Mastery",
    ];

    if (courseTitle.includes("react")) {
        moduleNames = [
            "React Fundamentals & JSX",
            "Components, Props & State",
            "Hooks & Lifecycle Management",
            "Forms, Events & User Input",
            "Routing, Context & Global State",
            "Performance Optimization & Custom Hooks",
            "Real-World Projects & Integrations",
            "Full-Stack React & Advanced Patterns",
        ];
    } else if (courseTitle.includes("node")) {
        moduleNames = [
            "Node.js Fundamentals & Setup",
            "Modules, File System & Streams",
            "Express.js & REST API Architecture",
            "Middleware, Routing & Controllers",
            "Database Integration & ORM/ODM",
            "Authentication, JWT & Security",
            "Full-Stack Projects & CRUD APIs",
            "Deployment, Performance & Scalability",
        ];
    } else if (courseTitle.includes("sql") || courseTitle.includes("mysql")) {
        moduleNames = [
            "Database Fundamentals & SQL Basics",
            "CRUD Queries, Datatypes & Constraints",
            "Filtering, Sorting & String Functions",
            "Aggregation, Grouping & Math Functions",
            "Joins, Relationships & Foreign Keys",
            "Advanced Queries, Views & Subqueries",
            "Transactions, Stored Procedures & Triggers",
            "Database Administration & Indexing",
        ];
    } else if (courseTitle.includes("mongo")) {
        moduleNames = [
            "MongoDB Architecture & Installation",
            "CRUD Operations & Data Types",
            "Query Operators & Indexing",
            "Aggregation Pipelines & Framework",
            "Schema Design & Validation",
            "Performance Optimization & Caching",
            "Security, Auth & Cluster Management",
        ];
    } else if (courseTitle.includes("git")) {
        moduleNames = [
            "Git Installation & Configuration",
            "Staging, Commits & History Inspection",
            "Branching, Merging & Rebase Mastery",
            "Undoing Changes, Reset & Stash",
            "GitHub Collaboration & Pull Requests",
        ];
    }

    const targetPerModule = totalLectures > 100 ? 15 : totalLectures > 40 ? 10 : Math.max(4, Math.ceil(totalLectures / 4));
    const modules = [];

    let currentLecIdx = 0;
    let modIdx = 0;

    while (currentLecIdx < totalLectures) {
        const modLectures = lectures.slice(currentLecIdx, currentLecIdx + targetPerModule);
        const name = moduleNames[modIdx % moduleNames.length];
        const moduleNum = modIdx + 1;

        modules.push({
            moduleNumber: moduleNum,
            title: `Module ${moduleNum}: ${name}`,
            startLecture: modLectures[0].lectureNumber,
            endLecture: modLectures[modLectures.length - 1].lectureNumber,
            totalLectures: modLectures.length,
            lectures: modLectures,
        });

        currentLecIdx += targetPerModule;
        modIdx++;
    }

    return modules;
}

module.exports = {
    resolveCourse,
    groupLecturesIntoModules,
};
